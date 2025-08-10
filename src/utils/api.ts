import { supabase } from '../lib/supabase';

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
        return { error: error.message };
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

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
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Network error' };
    }
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  }

  // Images
  async getImages(params?: {
    category?: string;
    user_id?: string;
    is_public?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('images')
        .select(`
          *,
          categories(name),
          profiles(name),
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
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get images error:', error);
      return { error: 'Failed to fetch images' };
    }
  }

  async uploadImage(file: File, metadata: {
    title: string;
    description?: string;
    category_id?: string;
    tags?: string[];
    is_public?: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) {
        return { error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // Insert image record
      const { data: imageData, error: insertError } = await supabase
        .from('images')
        .insert({
          title: metadata.title,
          description: metadata.description || '',
          file_path: publicUrl,
          thumbnail_path: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          category_id: metadata.category_id,
          user_id: user.id,
          is_public: metadata.is_public !== false
        })
        .select()
        .single();

      if (insertError) {
        return { error: insertError.message };
      }

      // Add tags if provided
      if (metadata.tags && metadata.tags.length > 0) {
        const tagInserts = metadata.tags.map(tag => ({
          image_id: imageData.id,
          tag: tag.trim()
        }));

        await supabase.from('image_tags').insert(tagInserts);
      }

      return { data: imageData };
    } catch (error) {
      console.error('Upload error:', error);
      return { error: 'Upload failed' };
    }
  }

  async deleteImage(id: string) {
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: { message: 'Image deleted successfully' } };
    } catch (error) {
      console.error('Delete error:', error);
      return { error: 'Delete failed' };
    }
  }

  // Users
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get users error:', error);
      return { error: 'Failed to fetch users' };
    }
  }

  async updateUser(id: string, userData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Update user error:', error);
      return { error: 'Failed to update user' };
    }
  }

  // Categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          images(count)
        `)
        .order('name');

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get categories error:', error);
      return { error: 'Failed to fetch categories' };
    }
  }

  async createCategory(categoryData: { name: string; description: string }) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Create category error:', error);
      return { error: 'Failed to create category' };
    }
  }

  // Collections
  async getCollections() {
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
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get collections error:', error);
      return { error: 'Failed to fetch collections' };
    }
  }

  async createCollection(collectionData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Create collection error:', error);
      return { error: 'Failed to create collection' };
    }
  }

  // Analytics
  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
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
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Get analytics error:', error);
      return { error: 'Failed to fetch analytics' };
    }
  }

  async trackEvent(eventType: string, metadata?: any) {
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
}

export const apiClient = new ApiClient();
export default apiClient;