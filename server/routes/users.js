const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        id, name, email, role, avatar, is_active, created_at, updated_at,
        (SELECT COUNT(*) FROM images WHERE user_id = users.id) as total_images,
        (SELECT COALESCE(SUM(views_count), 0) FROM images WHERE user_id = users.id) as total_views
      FROM users 
      ORDER BY created_at DESC
    `);

    const formattedUsers = users.map(user => ({
      ...user,
      joinDate: user.created_at,
      lastActive: user.updated_at,
      totalImages: user.total_images,
      totalViews: user.total_views,
      isActive: user.is_active
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [users] = await pool.execute(`
      SELECT 
        id, name, email, role, avatar, is_active, created_at, updated_at,
        (SELECT COUNT(*) FROM images WHERE user_id = users.id) as total_images,
        (SELECT COALESCE(SUM(views_count), 0) FROM images WHERE user_id = users.id) as total_views
      FROM users 
      WHERE id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const formattedUser = {
      ...user,
      joinDate: user.created_at,
      lastActive: user.updated_at,
      totalImages: user.total_images,
      totalViews: user.total_views,
      isActive: user.is_active
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar, isActive } = req.body;
    
    // Users can only update their own profile unless they're admin
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only admins can change roles and active status
    const updates = { name, email, avatar };
    if (req.user.role === 'admin') {
      updates.role = role;
      updates.is_active = isActive;
    }

    // Build dynamic update query
    const updateFields = Object.keys(updates).filter(key => updates[key] !== undefined);
    const updateValues = updateFields.map(key => updates[key]);
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await pool.execute(query, [...updateValues, id]);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting yourself
    if (req.user.userId === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Change password
router.put('/:id/password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Users can only change their own password unless they're admin
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // If not admin, verify current password
    if (req.user.role !== 'admin') {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }

      const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;