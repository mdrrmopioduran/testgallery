const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(i.id) as image_count
      FROM categories c
      LEFT JOIN images i ON c.id = i.category_id AND i.is_public = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    const formattedCategories = categories.map(category => ({
      ...category,
      imageCount: category.image_count,
      isActive: category.is_active
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [categories] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(i.id) as image_count
      FROM categories c
      LEFT JOIN images i ON c.id = i.category_id AND i.is_public = true
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = categories[0];
    const formattedCategory = {
      ...category,
      imageCount: category.image_count,
      isActive: category.is_active
    };

    res.json(formattedCategory);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const [existing] = await pool.execute(
      'SELECT id FROM categories WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const [result] = await pool.execute(`
      INSERT INTO categories (name, description, is_active) 
      VALUES (?, ?, ?)
    `, [name.trim(), description || '', isActive]);

    res.status(201).json({
      message: 'Category created successfully',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.is_active = isActive;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Check if new name already exists (if name is being updated)
    if (updates.name) {
      const [existing] = await pool.execute(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [updates.name, id]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Category name already exists' });
      }
    }

    const updateFields = Object.keys(updates);
    const updateValues = updateFields.map(key => updates[key]);
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    
    const query = `UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await pool.execute(query, [...updateValues, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has images
    const [images] = await pool.execute(
      'SELECT COUNT(*) as count FROM images WHERE category_id = ?',
      [id]
    );

    if (images[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing images. Move or delete images first.' 
      });
    }

    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;