const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/images');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

// Get all images
router.get('/', async (req, res) => {
  try {
    const { category, user_id, is_public, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT i.*, c.name as category_name, u.name as user_name,
             GROUP_CONCAT(it.tag) as tags
      FROM images i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN image_tags it ON i.id = it.image_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }
    
    if (user_id) {
      query += ' AND i.user_id = ?';
      params.push(user_id);
    }
    
    if (is_public !== undefined) {
      query += ' AND i.is_public = ?';
      params.push(is_public === 'true');
    }
    
    query += ' GROUP BY i.id ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [images] = await pool.execute(query, params);
    
    // Format response
    const formattedImages = images.map(image => ({
      ...image,
      tags: image.tags ? image.tags.split(',') : [],
      file_url: `/uploads/images/${image.filename}`,
      thumbnail_url: image.thumbnail_path ? `/uploads/images/${image.thumbnail_path}` : `/uploads/images/${image.filename}`
    }));
    
    res.json(formattedImages);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Upload image
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { title, description, category_id, tags, is_public = true } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Insert image record
    const [result] = await pool.execute(`
      INSERT INTO images (
        title, description, filename, original_name, file_path, 
        file_size, mime_type, category_id, user_id, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description || '',
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      category_id || null,
      req.user.userId,
      is_public === 'true'
    ]);

    const imageId = result.insertId;

    // Add tags if provided
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      for (const tag of tagArray) {
        await pool.execute(
          'INSERT INTO image_tags (image_id, tag) VALUES (?, ?)',
          [imageId, tag]
        );
      }
    }

    res.status(201).json({
      message: 'Image uploaded successfully',
      imageId,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete image
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get image info
    const [images] = await pool.execute(
      'SELECT * FROM images WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found or unauthorized' });
    }
    
    const image = images[0];
    
    // Delete file
    try {
      await fs.unlink(image.file_path);
    } catch (fileError) {
      console.warn('Could not delete file:', fileError.message);
    }
    
    // Delete from database
    await pool.execute('DELETE FROM images WHERE id = ?', [id]);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;