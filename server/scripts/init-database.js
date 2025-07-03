const { pool } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🚀 Initializing database...');

    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'photographer', 'user') DEFAULT 'user',
        avatar TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Images table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS images (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        thumbnail_path TEXT,
        file_size BIGINT NOT NULL,
        width INT,
        height INT,
        mime_type VARCHAR(100),
        category_id VARCHAR(36),
        user_id VARCHAR(36) NOT NULL,
        is_public BOOLEAN DEFAULT true,
        likes_count INT DEFAULT 0,
        views_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Image tags table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS image_tags (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        image_id VARCHAR(36) NOT NULL,
        tag VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
        UNIQUE KEY unique_image_tag (image_id, tag)
      )
    `);

    // Collections table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image_id VARCHAR(36),
        user_id VARCHAR(36) NOT NULL,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cover_image_id) REFERENCES images(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Collection images table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS collection_images (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        collection_id VARCHAR(36) NOT NULL,
        image_id VARCHAR(36) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
        UNIQUE KEY unique_collection_image (collection_id, image_id)
      )
    `);

    // Analytics table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        event_type ENUM('view', 'like', 'download', 'upload', 'login') NOT NULL,
        user_id VARCHAR(36),
        image_id VARCHAR(36),
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE SET NULL
      )
    `);

    // Settings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user
    const [existingAdmin] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@gallery-pro.com']
    );

    if (existingAdmin.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.execute(`
        INSERT INTO users (name, email, password, role, avatar) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'Admin User',
        'admin@gallery-pro.com',
        hashedPassword,
        'admin',
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200'
      ]);
    }

    // Insert default categories
    const defaultCategories = [
      { name: 'Nature', description: 'Beautiful nature photography' },
      { name: 'Urban', description: 'City and urban landscapes' },
      { name: 'Art', description: 'Artistic and creative works' },
      { name: 'Objects', description: 'Still life and objects' },
      { name: 'People', description: 'Portrait and people photography' }
    ];

    for (const category of defaultCategories) {
      await pool.execute(`
        INSERT IGNORE INTO categories (name, description) 
        VALUES (?, ?)
      `, [category.name, category.description]);
    }

    console.log('✅ Database initialized successfully!');
    console.log('📧 Default admin: admin@gallery-pro.com');
    console.log('🔑 Default password: admin123');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    process.exit();
  }
};

createTables();