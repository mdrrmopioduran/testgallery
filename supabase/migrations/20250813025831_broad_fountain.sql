/*
  # Complete Gallery Pro Database Schema

  1. New Tables
    - `profiles` - User profiles with roles and metadata
    - `categories` - Image categories for organization
    - `images` - Image metadata and file information
    - `image_tags` - Tags associated with images
    - `collections` - User-created image collections
    - `collection_images` - Many-to-many relationship for collections
    - `analytics_events` - User interaction tracking
    - `settings` - Application configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for sensitive operations
    - Public read policies where appropriate

  3. Storage
    - Create storage buckets for images
    - Set up proper access policies
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar text DEFAULT 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
  role text DEFAULT 'user' CHECK (role IN ('admin', 'photographer', 'user')),
  total_images integer DEFAULT 0,
  total_views integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text DEFAULT '',
  file_path text NOT NULL,
  thumbnail_path text,
  file_size bigint DEFAULT 0,
  width integer DEFAULT 0,
  height integer DEFAULT 0,
  mime_type text DEFAULT 'image/jpeg',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_public boolean DEFAULT true,
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create image_tags table
CREATE TABLE IF NOT EXISTS image_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id uuid REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text DEFAULT '',
  cover_image_id uuid REFERENCES images(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collection_images table
CREATE TABLE IF NOT EXISTS collection_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  image_id uuid REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, image_id)
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL CHECK (event_type IN ('view', 'like', 'download', 'upload', 'login')),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  image_id uuid REFERENCES images(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Images policies
CREATE POLICY "Anyone can view public images" ON images FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own images" ON images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all images" ON images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Users can insert own images" ON images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own images" ON images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any image" ON images FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Users can delete own images" ON images FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any image" ON images FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Image tags policies
CREATE POLICY "Anyone can view tags for public images" ON image_tags FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM images 
    WHERE id = image_tags.image_id AND is_public = true
  )
);
CREATE POLICY "Users can manage tags for own images" ON image_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM images 
    WHERE id = image_tags.image_id AND user_id = auth.uid()
  )
);

-- Collections policies
CREATE POLICY "Anyone can view public collections" ON collections FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own collections" ON collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own collections" ON collections FOR ALL USING (auth.uid() = user_id);

-- Collection images policies
CREATE POLICY "Users can view collection images" ON collection_images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_images.collection_id 
    AND (is_public = true OR user_id = auth.uid())
  )
);
CREATE POLICY "Users can manage own collection images" ON collection_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_images.collection_id AND user_id = auth.uid()
  )
);

-- Analytics policies
CREATE POLICY "Users can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON analytics_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Settings policies
CREATE POLICY "Admins can manage settings" ON settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Nature', 'Beautiful landscapes and nature photography'),
  ('Urban', 'City life and urban architecture'),
  ('Art', 'Artistic and creative works'),
  ('Portrait', 'People and portrait photography'),
  ('Travel', 'Travel and adventure photography'),
  ('Architecture', 'Buildings and architectural details')
ON CONFLICT (name) DO NOTHING;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
  ('site_name', '"Gallery Pro"'),
  ('site_description', '"Professional image gallery and management system"'),
  ('images_per_page', '20'),
  ('max_file_size', '10'),
  ('allowed_formats', '["JPEG", "PNG", "WebP", "GIF"]'),
  ('enable_public_uploads', 'false'),
  ('require_approval', 'true')
ON CONFLICT (setting_key) DO NOTHING;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('images', 'images', true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (
  bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for thumbnails bucket
CREATE POLICY "Anyone can view thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'thumbnails' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own thumbnails" ON storage.objects FOR UPDATE USING (
  bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own thumbnails" ON storage.objects FOR DELETE USING (
  bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]
);