import { supabase, uploadImageToStorage, deleteImageFromStorage } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: any; session: any }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        return { error: error.message };
      }

      if (data.user && data.session) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Profile might not exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              role: 'admin' // First user becomes admin
            })
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            return { error: 'Failed to create user profile' };
          }

          toast.success('Login successful! Profile created.');
          return { 
            data: { 
              user: {
                id: data.user.id,
                email: data.user.email,
                ...newProfile
              }, 
              session: data.session 
            } 
          };
        }

        // Track login event
        await this.trackEvent('login', { user_id: data.user.id });

        toast.success('Login successful!');
        return { 
          data: { 
            user: {
              id: data.user.id,
              email: data.user.email,
              ...profile
            }, 
            session: data.session 
          } 
        };
      }

      return { error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error during login');
      return { error: 'Network error' };
    }
  }

  async register(userData: { name: string; email: string; password: string; role?: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'user'
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message);
        return { error: error.message };
      }

      if (data.user) {
        toast.success('Account created successfully!');
        return { data };
      }

      return { error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error during registration');
      return { error: 'Network error' };
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed');
        return { error: error.message };
      } else {
        toast.success('Logged out successfully');
        return { data: { message: 'Logged out successfully' } };
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
      return { error: 'Logout failed' };
    }
  }

  // Images
  async getImages(params?: {
    category?: string;
    user_id?: string;
    is_public?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> {
    try {
      let query = supabase
        .from('images')
        .select(`
          *,
          categories(id, name),
          profiles(id, name),
          image_tags(tag)
        `);

      if (params?.category) {
        query = query.eq('categories.name', params.category);
      }

      if (params?.user_id) {
        query = query.eq('user_id', params.user_id);
      }

      if (params?.is_public !== undefined) {
        query = query.eq('is_public', params.is_public);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      if (params?.offset) {
        query = query.range(params.offset, (params.offset + (params.limit || 50)) - 1);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Get images error:', error);
        toast.error('Failed to fetch images');
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get images error:', error);
      toast.error('Failed to fetch images');
      return { error: 'Failed to fetch images' };
    }
  }

  async uploadImage(file: File, metadata: {
    title: string;
    description?: string;
    category_id?: string;
    tags?: string[];
    is_public?: boolean;
  }): Promise<ApiResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to upload images');
        return { error: 'User not authenticated' };
      }

      // Upload file to storage
      const { fileName, publicUrl } = await uploadImageToStorage(file, user.id);

      // Insert image record
      const { data: imageData, error: insertError } = await supabase
        .from('images')
        .insert({
          title: metadata.title,
          description: metadata.description || '',
          file_path: publicUrl,
          thumbnail_path: publicUrl, // For now, using same image as thumbnail
          file_size: file.size,
          mime_type: file.type,
          category_id: metadata.category_id,
          user_id: user.id,
          is_public: metadata.is_public !== false
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert image error:', insertError);
        toast.error('Failed to save image metadata');
        return { error: insertError.message };
      }

      // Add tags if provided
      if (metadata.tags && metadata.tags.length > 0) {
        const tagInserts = metadata.tags.map(tag => ({
          image_id: imageData.id,
          tag: tag.trim()
        }));

        const { error: tagError } = await supabase
          .from('image_tags')
          .insert(tagInserts);

        if (tagError) {
          console.error('Tag insert error:', tagError);
        }
      }

      // Track upload event
      await this.trackEvent('upload', { image_id: imageData.id });

      toast.success('Image uploaded successfully!');
      return { data: imageData };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      return { error: 'Upload failed' };
    }
  }

  async deleteImage(id: string): Promise<ApiResponse> {
    try {
      // Get image details first
      const { data: image, error: fetchError } = await supabase
        .from('images')
        .select('file_path, user_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Fetch image error:', fetchError);
        toast.error('Failed to find image');
        return { error: fetchError.message };
      }

      // Check permissions
      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = user?.id === image.user_id;
      const isAdminUser = await this.isCurrentUserAdmin();

      if (!isOwner && !isAdminUser) {
        toast.error('You do not have permission to delete this image');
        return { error: 'Permission denied' };
      }

      // Delete from database (this will cascade to related tables)
      const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete image error:', deleteError);
        toast.error('Failed to delete image');
        return { error: deleteError.message };
      }

      // Delete from storage
      await deleteImageFromStorage(image.file_path);

      toast.success('Image deleted successfully');
      return { data: { message: 'Image deleted successfully' } };
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
      return { error: 'Delete failed' };
    }
  }

  async updateImage(id: string, updates: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update image error:', error);
        toast.error('Failed to update image');
        return { error: error.message };
      }

      toast.success('Image updated successfully');
      return { data };
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed');
      return { error: 'Update failed' };
    }
  }

  // Users
  async getUsers(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get users error:', error);
        toast.error('Failed to fetch users');
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get users error:', error);
      toast.error('Failed to fetch users');
      return { error: 'Failed to fetch users' };
    }
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update user error:', error);
        toast.error('Failed to update user');
        return { error: error.message };
      }

      toast.success('User updated successfully');
      return { data };
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update user');
      return { error: 'Failed to update user' };
    }
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      // Check if current user is admin
      const isAdminUser = await this.isCurrentUserAdmin();
      if (!isAdminUser) {
        toast.error('Only admins can delete users');
        return { error: 'Permission denied' };
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete user error:', error);
        toast.error('Failed to delete user');
        return { error: error.message };
      }

      toast.success('User deleted successfully');
      return { data: { message: 'User deleted successfully' } };
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
      return { error: 'Failed to delete user' };
    }
  }

  // Categories
  async getCategories(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          images(count)
        `)
        .order('name');

      if (error) {
        console.error('Get categories error:', error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get categories error:', error);
      return { error: 'Failed to fetch categories' };
    }
  }

  async createCategory(categoryData: { name: string; description: string }): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        console.error('Create category error:', error);
        toast.error('Failed to create category');
        return { error: error.message };
      }

      toast.success('Category created successfully');
      return { data };
    } catch (error) {
      console.error('Create category error:', error);
      toast.error('Failed to create category');
      return { error: 'Failed to create category' };
    }
  }

  async updateCategory(id: string, updates: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update category error:', error);
        toast.error('Failed to update category');
        return { error: error.message };
      }

      toast.success('Category updated successfully');
      return { data };
    } catch (error) {
      console.error('Update category error:', error);
      toast.error('Failed to update category');
      return { error: 'Failed to update category' };
    }
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete category error:', error);
        toast.error('Failed to delete category');
        return { error: error.message };
      }

      toast.success('Category deleted successfully');
      return { data: { message: 'Category deleted successfully' } };
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error('Failed to delete category');
      return { error: 'Failed to delete category' };
    }
  }

  // Collections
  async getCollections(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          profiles(name),
          collection_images(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get collections error:', error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get collections error:', error);
      return { error: 'Failed to fetch collections' };
    }
  }

  async createCollection(collectionData: any): Promise<ApiResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to create collections');
        return { error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('collections')
        .insert({
          ...collectionData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Create collection error:', error);
        toast.error('Failed to create collection');
        return { error: error.message };
      }

      toast.success('Collection created successfully');
      return { data };
    } catch (error) {
      console.error('Create collection error:', error);
      toast.error('Failed to create collection');
      return { error: 'Failed to create collection' };
    }
  }

  // Analytics
  async getAnalytics(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse> {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*');

      if (params?.startDate) {
        query = query.gte('created_at', params.startDate);
      }

      if (params?.endDate) {
        query = query.lte('created_at', params.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Get analytics error:', error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get analytics error:', error);
      return { error: 'Failed to fetch analytics' };
    }
  }

  async trackEvent(eventType: string, metadata?: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          user_id: user?.id,
          metadata
        });

      if (error) {
        console.error('Track event error:', error);
      }
    } catch (error) {
      console.error('Track event error:', error);
    }
  }

  // Settings
  async getSettings(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) {
        console.error('Get settings error:', error);
        return { error: error.message };
      }

      // Convert to key-value object
      const settings: Record<string, any> = {};
      data?.forEach(setting => {
        try {
          settings[setting.setting_key] = JSON.parse(setting.setting_value);
        } catch {
          settings[setting.setting_key] = setting.setting_value;
        }
      });

      return { data: settings };
    } catch (error) {
      console.error('Get settings error:', error);
      return { error: 'Failed to fetch settings' };
    }
  }

  async updateSetting(key: string, value: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          setting_key: key,
          setting_value: JSON.stringify(value)
        })
        .select()
        .single();

      if (error) {
        console.error('Update setting error:', error);
        toast.error('Failed to update setting');
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Update setting error:', error);
      toast.error('Failed to update setting');
      return { error: 'Failed to update setting' };
    }
  }

  // Helper methods
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return profile?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Real-time subscriptions
  subscribeToImages(callback: (payload: any) => void) {
    return supabase
      .channel('images')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'images' }, 
        callback
      )
      .subscribe();
  }

  subscribeToUsers(callback: (payload: any) => void) {
    return supabase
      .channel('profiles')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        callback
      )
      .subscribe();
  }
}

export const apiClient = new ApiClient();
export default apiClient;