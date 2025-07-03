export interface Image {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  tags: string[];
  uploadDate: Date;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  userId: string;
  isPublic: boolean;
  likes: number;
  views: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'photographer';
  avatar: string;
  joinDate: Date;
  lastActive: Date;
  totalImages: number;
  totalViews: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageCount: number;
  isActive: boolean;
}

export interface Analytics {
  totalImages: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
  newUsersThisMonth: number;
  newImagesThisMonth: number;
  topCategories: { name: string; count: number }[];
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'upload' | 'delete' | 'edit' | 'user_join' | 'like';
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export interface EnhancementOptions {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  grayscale: number;
}