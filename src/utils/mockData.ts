import { Image, User, Category, Analytics, Activity } from '../types';

export const mockImages: Image[] = [
  {
    id: '1',
    title: 'Sunset Over Mountains',
    description: 'A breathtaking sunset captured over the mountain peaks',
    url: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Nature',
    tags: ['sunset', 'mountains', 'landscape'],
    uploadDate: new Date('2024-01-15'),
    size: 2048000,
    dimensions: { width: 1920, height: 1080 },
    userId: '1',
    isPublic: true,
    likes: 124,
    views: 1250
  },
  {
    id: '2',
    title: 'City Lights at Night',
    description: 'Urban cityscape with vibrant neon lights',
    url: 'https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Urban',
    tags: ['city', 'night', 'lights'],
    uploadDate: new Date('2024-01-10'),
    size: 1856000,
    dimensions: { width: 1920, height: 1280 },
    userId: '2',
    isPublic: true,
    likes: 89,
    views: 945
  },
  {
    id: '3',
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the shore',
    url: 'https://images.pexels.com/photos/1022936/pexels-photo-1022936.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/1022936/pexels-photo-1022936.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Nature',
    tags: ['ocean', 'waves', 'water'],
    uploadDate: new Date('2024-01-08'),
    size: 2234000,
    dimensions: { width: 1920, height: 1080 },
    userId: '1',
    isPublic: true,
    likes: 156,
    views: 1876
  },
  {
    id: '4',
    title: 'Forest Path',
    description: 'A serene path through a dense forest',
    url: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Nature',
    tags: ['forest', 'path', 'trees'],
    uploadDate: new Date('2024-01-05'),
    size: 1920000,
    dimensions: { width: 1920, height: 1280 },
    userId: '3',
    isPublic: true,
    likes: 98,
    views: 1123
  },
  {
    id: '5',
    title: 'Abstract Art',
    description: 'Colorful abstract digital art composition',
    url: 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Art',
    tags: ['abstract', 'colorful', 'digital'],
    uploadDate: new Date('2024-01-03'),
    size: 1654000,
    dimensions: { width: 1920, height: 1080 },
    userId: '2',
    isPublic: true,
    likes: 67,
    views: 789
  },
  {
    id: '6',
    title: 'Vintage Camera',
    description: 'Classic vintage camera on wooden table',
    url: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Objects',
    tags: ['vintage', 'camera', 'photography'],
    uploadDate: new Date('2024-01-01'),
    size: 1789000,
    dimensions: { width: 1920, height: 1280 },
    userId: '1',
    isPublic: true,
    likes: 134,
    views: 1456
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    joinDate: new Date('2023-12-01'),
    lastActive: new Date('2024-01-20'),
    totalImages: 125,
    totalViews: 15630,
    isActive: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'photographer',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
    joinDate: new Date('2023-11-15'),
    lastActive: new Date('2024-01-19'),
    totalImages: 89,
    totalViews: 12450,
    isActive: true
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'user',
    avatar: 'https://images.pexels.com/photos/1496372/pexels-photo-1496372.jpeg?auto=compress&cs=tinysrgb&w=200',
    joinDate: new Date('2024-01-10'),
    lastActive: new Date('2024-01-18'),
    totalImages: 34,
    totalViews: 4567,
    isActive: true
  }
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Nature', description: 'Beautiful nature photography', imageCount: 45, isActive: true },
  { id: '2', name: 'Urban', description: 'City and urban landscapes', imageCount: 32, isActive: true },
  { id: '3', name: 'Art', description: 'Artistic and creative works', imageCount: 28, isActive: true },
  { id: '4', name: 'Objects', description: 'Still life and objects', imageCount: 19, isActive: true },
  { id: '5', name: 'People', description: 'Portrait and people photography', imageCount: 41, isActive: true }
];

export const mockAnalytics: Analytics = {
  totalImages: 165,
  totalUsers: 48,
  totalViews: 32647,
  totalLikes: 1568,
  newUsersThisMonth: 12,
  newImagesThisMonth: 23,
  topCategories: [
    { name: 'Nature', count: 45 },
    { name: 'People', count: 41 },
    { name: 'Urban', count: 32 },
    { name: 'Art', count: 28 }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'upload',
      description: 'uploaded 3 new images',
      timestamp: new Date('2024-01-20T10:30:00'),
      userId: '1',
      userName: 'John Doe'
    },
    {
      id: '2',
      type: 'user_join',
      description: 'joined the platform',
      timestamp: new Date('2024-01-20T09:15:00'),
      userId: '4',
      userName: 'Sarah Wilson'
    },
    {
      id: '3',
      type: 'like',
      description: 'liked "Sunset Over Mountains"',
      timestamp: new Date('2024-01-20T08:45:00'),
      userId: '2',
      userName: 'Jane Smith'
    }
  ]
};