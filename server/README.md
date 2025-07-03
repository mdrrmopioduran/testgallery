# Gallery Pro Backend API

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Setup MySQL Database
```sql
-- Create database
CREATE DATABASE gallery_pro;

-- Create user (optional)
CREATE USER 'gallery_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON gallery_pro.* TO 'gallery_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Initialize Database
```bash
npm run init-db
```

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Images
- `GET /api/images` - Get all images
- `POST /api/images/upload` - Upload image (auth required)
- `DELETE /api/images/:id` - Delete image (auth required)

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user (auth required)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)

### Collections
- `GET /api/collections` - Get all collections
- `POST /api/collections` - Create collection (auth required)

## 🔧 Configuration

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gallery_pro
PORT=5000
JWT_SECRET=your_secret_key
```

### Default Admin Account
- **Email:** admin@gallery-pro.com
- **Password:** admin123

## 📁 Project Structure
```
server/
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── images.js
│   ├── users.js
│   └── categories.js
├── scripts/
│   └── init-database.js
├── uploads/
│   └── images/
├── .env.example
├── package.json
└── server.js
```

## 🛡️ Security Features
- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- File upload validation

## 📊 Database Schema
- **users** - User accounts and profiles
- **categories** - Image categories
- **images** - Image metadata and files
- **image_tags** - Tags for images
- **collections** - Image collections
- **analytics** - Usage analytics