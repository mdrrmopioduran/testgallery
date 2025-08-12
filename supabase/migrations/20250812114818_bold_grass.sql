/*
  # Complete Gallery Pro Database Schema

  1. New Tables
    - `users` (Supabase Auth integration)
    - `profiles` (User profiles linked to auth.users)
    - `categories` (Image categories)
    - `images` (Image metadata and storage)
    - `image_tags` (Tags for images)
    - `collections` (Image collections)
    - `collection_images` (Many-to-many relationship)
    - `analytics_events` (User activity tracking)
    - `settings` (Application settings)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
    - Admin-only policies for management
    - Public read policies where appropriate

  3. Storage
    - Images bucket for file storage
    - Thumbnails bucket for optimized images

  4. Functions
    - Auto-create profile on user signup
    - Update timestamp triggers
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  file_path text NOT NULL,
  thumbnail_path text,
  file_size bigint NOT NULL,
  width integer,
  height integer,
  mime_type text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_public boolean DEFAULT true,
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create image_tags table
CREATE TABLE IF NOT EXISTS image_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid REFERENCES images(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(image_id, tag)
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image_id uuid REFERENCES images(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collection_images table
CREATE TABLE IF NOT EXISTS collection_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  image_id uuid REFERENCES images(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, image_id)
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('view', 'like', 'download', 'upload', 'login')),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  image_id uuid REFERENCES images(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies
CREATE POLICY "Anyone can read active categories" ON categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Images policies
CREATE POLICY "Anyone can read public images" ON images
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Users can read own images" ON images
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON images
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON images
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON images
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Image tags policies
CREATE POLICY "Users can read tags for accessible images" ON image_tags
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM images 
      WHERE id = image_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage tags for own images" ON image_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM images 
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

-- Collections policies
CREATE POLICY "Anyone can read public collections" ON collections
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Users can manage own collections" ON collections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own collections" ON collections
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Collection images policies
CREATE POLICY "Users can read collection images for accessible collections" ON collection_images
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE id = collection_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own collection images" ON collection_images
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- Analytics policies
CREATE POLICY "Users can insert analytics events" ON analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read analytics" ON analytics_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Settings policies
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Thumbnail storage policies
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 'admin');
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Nature', 'Beautiful nature photography and landscapes'),
  ('Urban', 'City life and urban architecture'),
  ('Art', 'Artistic and creative works'),
  ('Objects', 'Still life and product photography'),
  ('People', 'Portrait and people photography'),
  ('Architecture', 'Buildings and architectural details'),
  ('Travel', 'Travel and destination photography'),
  ('Abstract', 'Abstract and conceptual art')
ON CONFLICT (name) DO NOTHING;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
  ('site_name', '"Gallery Pro"'),
  ('site_description', '"Professional image gallery and management system"'),
  ('images_per_page', '20'),
  ('max_file_size', '10485760'),
  ('allowed_formats', '["JPEG", "PNG", "WebP", "GIF"]'),
  ('watermark_enabled', 'false'),
  ('auto_backup', 'true'),
  ('backup_frequency', '"daily"')
ON CONFLICT (setting_key) DO NOTHING;