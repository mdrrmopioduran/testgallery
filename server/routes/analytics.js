const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get analytics overview (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get basic stats
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM images) as total_images,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COALESCE(SUM(views_count), 0) FROM images) as total_views,
        (SELECT COALESCE(SUM(likes_count), 0) FROM images) as total_likes,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_month,
        (SELECT COUNT(*) FROM images WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_images_month
    `);

    // Get top categories
    const [categories] = await pool.execute(`
      SELECT 
        c.name,
        COUNT(i.id) as count
      FROM categories c
      LEFT JOIN images i ON c.id = i.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get recent activity
    const [activity] = await pool.execute(`
      SELECT 
        a.event_type,
        a.created_at,
        u.name as user_name,
        i.title as image_title
      FROM analytics a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN images i ON a.image_id = i.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    // Get daily stats for the last 30 days
    const [dailyStats] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        event_type,
        COUNT(*) as count
      FROM analytics
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at), event_type
      ORDER BY date DESC
    `);

    // Get user engagement stats
    const [userStats] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        u.avatar,
        COUNT(i.id) as image_count,
        COALESCE(SUM(i.views_count), 0) as total_views,
        COALESCE(SUM(i.likes_count), 0) as total_likes
      FROM users u
      LEFT JOIN images i ON u.id = i.user_id
      GROUP BY u.id, u.name, u.avatar
      ORDER BY total_views DESC
      LIMIT 10
    `);

    const analytics = {
      overview: {
        totalImages: stats[0].total_images,
        totalUsers: stats[0].total_users,
        totalViews: stats[0].total_views,
        totalLikes: stats[0].total_likes,
        newUsersThisMonth: stats[0].new_users_month,
        newImagesThisMonth: stats[0].new_images_month
      },
      topCategories: categories.map(cat => ({
        name: cat.name,
        count: cat.count
      })),
      recentActivity: activity.map(act => ({
        id: Math.random().toString(36).substr(2, 9),
        type: act.event_type,
        description: getActivityDescription(act),
        timestamp: act.created_at,
        userName: act.user_name || 'Unknown User'
      })),
      dailyStats: processDailyStats(dailyStats),
      topContributors: userStats.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        imageCount: user.image_count,
        totalViews: user.total_views,
        totalLikes: user.total_likes
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Track event
router.post('/track', async (req, res) => {
  try {
    const { eventType, imageId, metadata = {} } = req.body;
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (!eventType) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    await pool.execute(`
      INSERT INTO analytics (event_type, user_id, image_id, ip_address, user_agent, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [eventType, userId, imageId, ipAddress, userAgent, JSON.stringify(metadata)]);

    // Update counters for specific events
    if (eventType === 'view' && imageId) {
      await pool.execute(
        'UPDATE images SET views_count = views_count + 1 WHERE id = ?',
        [imageId]
      );
    } else if (eventType === 'like' && imageId) {
      await pool.execute(
        'UPDATE images SET likes_count = likes_count + 1 WHERE id = ?',
        [imageId]
      );
    }

    res.json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get image analytics
router.get('/images/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [events] = await pool.execute(`
      SELECT 
        event_type,
        DATE(created_at) as date,
        COUNT(*) as count
      FROM analytics
      WHERE image_id = ?
      GROUP BY event_type, DATE(created_at)
      ORDER BY date DESC
    `, [id]);

    const [totalStats] = await pool.execute(`
      SELECT 
        views_count,
        likes_count,
        (SELECT COUNT(*) FROM analytics WHERE image_id = ? AND event_type = 'download') as downloads
      FROM images
      WHERE id = ?
    `, [id, id]);

    res.json({
      imageId: id,
      totalViews: totalStats[0]?.views_count || 0,
      totalLikes: totalStats[0]?.likes_count || 0,
      totalDownloads: totalStats[0]?.downloads || 0,
      dailyStats: events
    });
  } catch (error) {
    console.error('Get image analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch image analytics' });
  }
});

// Helper functions
function getActivityDescription(activity) {
  switch (activity.event_type) {
    case 'view':
      return `viewed "${activity.image_title || 'an image'}"`;
    case 'like':
      return `liked "${activity.image_title || 'an image'}"`;
    case 'download':
      return `downloaded "${activity.image_title || 'an image'}"`;
    case 'upload':
      return `uploaded "${activity.image_title || 'a new image'}"`;
    case 'login':
      return 'logged in';
    default:
      return 'performed an action';
  }
}

function processDailyStats(dailyStats) {
  const statsMap = new Map();
  
  dailyStats.forEach(stat => {
    if (!statsMap.has(stat.date)) {
      statsMap.set(stat.date, {
        date: stat.date,
        views: 0,
        likes: 0,
        uploads: 0,
        downloads: 0
      });
    }
    
    const dayStats = statsMap.get(stat.date);
    dayStats[stat.event_type + 's'] = stat.count;
  });
  
  return Array.from(statsMap.values()).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

module.exports = router;