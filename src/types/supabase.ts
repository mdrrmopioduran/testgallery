export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar: string;
          role: 'admin' | 'photographer' | 'user';
          total_images: number;
          total_views: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar?: string;
          role?: 'admin' | 'photographer' | 'user';
          total_images?: number;
          total_views?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string;
          role?: 'admin' | 'photographer' | 'user';
          total_images?: number;
          total_views?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      images: {
        Row: {
          id: string;
          title: string;
          description: string;
          file_path: string;
          thumbnail_path: string;
          file_size: number;
          width: number;
          height: number;
          mime_type: string;
          category_id: string;
          user_id: string;
          is_public: boolean;
          likes_count: number;
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          file_path: string;
          thumbnail_path?: string;
          file_size: number;
          width?: number;
          height?: number;
          mime_type?: string;
          category_id?: string;
          user_id: string;
          is_public?: boolean;
          likes_count?: number;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          file_path?: string;
          thumbnail_path?: string;
          file_size?: number;
          width?: number;
          height?: number;
          mime_type?: string;
          category_id?: string;
          user_id?: string;
          is_public?: boolean;
          likes_count?: number;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      image_tags: {
        Row: {
          id: string;
          image_id: string;
          tag: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          image_id: string;
          tag: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          image_id?: string;
          tag?: string;
          created_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          name: string;
          description: string;
          cover_image_id: string;
          user_id: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          cover_image_id?: string;
          user_id: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          cover_image_id?: string;
          user_id?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_images: {
        Row: {
          id: string;
          collection_id: string;
          image_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          image_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          image_id?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: 'view' | 'like' | 'download' | 'upload' | 'login';
          user_id: string;
          image_id: string;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: 'view' | 'like' | 'download' | 'upload' | 'login';
          user_id?: string;
          image_id?: string;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: 'view' | 'like' | 'download' | 'upload' | 'login';
          user_id?: string;
          image_id?: string;
          metadata?: any;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}