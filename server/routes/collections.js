const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all collections
router.get('/', async (req, res) => {
  try {
    const { user_id, is_public } = req.query;
    
    let query = `
      SELECT 
        c.*,
        u.name as user_name,
        COUNT(ci.image_id) as image_count,
        cover.filename as cover_image
      FROM collections c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN collection_images ci ON c.id = ci.collection_id
      LEFT JOIN images cover ON c.cover_image_id = cover.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (user_id) {
      query += ' AND c.user_id = ?';
      params.push(user_id);
    }
    
    if (is_public !== undefined) {
      query += ' AND c.is_public = ?';
      params.push(is_public === 'true');
    }
    
    query += ' GROUP BY c.id ORDER BY c.created_at DESC';
    
    const [collections] = await pool.execute(query, params);
    
    const formattedCollections = collections.map(collection => ({
      ...collection,
      imageCount: collection.image_count,
      isPublic: collection.is_public,
      coverImage: collection.cover_image ? `/uploads/images/${collection.cover_image}` : null,
      createdBy: collection.user_name,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at
    }));
    
    res.json(formattedCollections);
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get collection by ID with images
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get collection info
    const [collections] = await pool.execute(`
      SELECT 
        c.*,
        u.name as user_name,
        cover.filename as cover_image
      FROM collections c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN images cover ON c.cover_image_id = cover.id
      WHERE c.id = ?
    `, [id]);
    
    if (collections.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const collection = collections[0];
    
    // Get collection images
    const [images] = await pool.execute(`
      SELECT 
        i.*,
        ci.sort_order,
        GROUP_CONCAT(it.tag) as tags
      FROM collection_images ci
      JOIN images i ON ci.image_id = i.id
      LEFT JOIN image_tags it ON i.id = it.image_id
      WHERE ci.collection_id = ?
      GROUP BY i.id
      ORDER BY ci.sort_order ASC, ci.created_at ASC
    `, [id]);
    
    const formattedCollection = {
      ...collection,
      isPublic: collection.is_public,
      coverImage: collection.cover_image ? `/uploads/images/${collection.cover_image}` : null,
      createdBy: collection.user_name,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
      images: images.map(image => ({
        ...image,
        tags: image.tags ? image.tags.split(',') : [],
        file_url: `/uploads/images/${image.filename}`,
        thumbnail_url: image.thumbnail_path ? `/uploads/images/${image.thumbnail_path}` : `/uploads/images/${image.filename}`
      }))
    };
    
    res.json(formattedCollection);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Create collection
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, imageIds = [], isPublic = true, tags = [] } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create collection
      const [result] = await connection.execute(`
        INSERT INTO collections (name, description, user_id, is_public) 
        VALUES (?, ?, ?, ?)
      `, [name.trim(), description || '', req.user.userId, isPublic]);

      const collectionId = result.insertId;

      // Add images to collection
      if (imageIds.length > 0) {
        for (let i = 0; i < imageIds.length; i++) {
          await connection.execute(`
            INSERT INTO collection_images (collection_id, image_id, sort_order) 
            VALUES (?, ?, ?)
          `, [collectionId, imageIds[i], i]);
        }

        // Set first image as cover if no cover specified
        await connection.execute(`
          UPDATE collections SET cover_image_id = ? WHERE id = ?
        `, [imageIds[0], collectionId]);
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Collection created successfully',
        collectionId
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Update collection
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageIds, isPublic, coverImageId } = req.body;

    // Check if user owns the collection or is admin
    const [collections] = await pool.execute(
      'SELECT user_id FROM collections WHERE id = ?',
      [id]
    );

    if (collections.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collections[0].user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update collection info
      const updates = {};
      if (name !== undefined) updates.name = name.trim();
      if (description !== undefined) updates.description = description;
      if (isPublic !== undefined) updates.is_public = isPublic;
      if (coverImageId !== undefined) updates.cover_image_id = coverImageId;

      if (Object.keys(updates).length > 0) {
        const updateFields = Object.keys(updates);
        const updateValues = updateFields.map(key => updates[key]);
        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        
        await connection.execute(
          `UPDATE collections SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [...updateValues, id]
        );
      }

      // Update images if provided
      if (imageIds !== undefined) {
        // Remove existing images
        await connection.execute('DELETE FROM collection_images WHERE collection_id = ?', [id]);
        
        // Add new images
        for (let i = 0; i < imageIds.length; i++) {
          await connection.execute(`
            INSERT INTO collection_images (collection_id, image_id, sort_order) 
            VALUES (?, ?, ?)
          `, [id, imageIds[i], i]);
        }
      }

      await connection.commit();
      connection.release();

      res.json({ message: 'Collection updated successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete collection
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the collection or is admin
    const [collections] = await pool.execute(
      'SELECT user_id FROM collections WHERE id = ?',
      [id]
    );

    if (collections.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collections[0].user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.execute('DELETE FROM collections WHERE id = ?', [id]);

    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

module.exports = router;