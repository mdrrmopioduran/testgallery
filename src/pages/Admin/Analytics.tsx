import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Download, 
  Calendar,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Star,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../utils/api';
import { Image as ImageType, User } from '../../types';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalLikes: number;
    totalDownloads: number;
    totalUsers: number;
    totalImages: number;
    avgViewsPerImage: number;
    avgLikesPerImage: number;
    growthRate: number;
  };
  timeSeriesData: {
    date: string;
    views: number;
    likes: number;
    uploads: number;
    newUsers: number;
  }[];
  topImages: {
    id: string;
    title: string;
    thumbnail: string;
    views: number;
    likes: number;
    category: string;
    uploadDate: Date;
  }[];
  categoryStats: {
    name: string;
    imageCount: number;
    totalViews: number;
    totalLikes: number;
    avgViews: number;
  }[];
  userStats: {
    topContributors: {
      id: string;
      name: string;
      avatar: string;
      imageCount: number;
      totalViews: number;
      totalLikes: number;
    }[];
    userGrowth: {
      month: string;
      newUsers: number;
      activeUsers: number;
    }[];
  };
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicStats: {
    country: string;
    users: number;
    views: number;
  }[];
  recentActivity: {
    id: string;
    type: 'view' | 'like' | 'upload' | 'download' | 'user_join';
    description: string;
    timestamp: Date;
    userName: string;
    imageTitle?: string;
  }[];
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'likes' | 'uploads'>('views');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      const [imagesResponse, usersResponse, analyticsResponse] = await Promise.all([
        apiClient.getImages(),
        apiClient.getUsers(),
        apiClient.getAnalytics()
      ]);

      if (imagesResponse.data && usersResponse.data) {
        const images = imagesResponse.data.map((img: any) => ({
          id: img.id,
          title: img.title,
          description: img.description,
          url: img.file_path,
          thumbnail: img.thumbnail_path || img.file_path,
          category: img.categories?.name || 'Uncategorized',
          tags: img.image_tags?.map((tag: any) => tag.tag) || [],
          uploadDate: new Date(img.created_at),
          size: img.file_size,
          dimensions: { width: img.width || 1920, height: img.height || 1080 },
          userId: img.user_id,
          isPublic: img.is_public,
          likes: img.likes_count,
          views: img.views_count
        }));

        const users = usersResponse.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email || '',
          role: user.role,
          avatar: user.avatar,
          joinDate: new Date(user.created_at),
          lastActive: new Date(user.updated_at),
          totalImages: user.total_images || 0,
          totalViews: user.total_views || 0,
          isActive: user.is_active
        }));

        const mockData: AnalyticsData = {
          overview: {
            totalViews: images.reduce((sum, img) => sum + img.views, 0),
            totalLikes: images.reduce((sum, img) => sum + img.likes, 0),
            totalDownloads: Math.floor(images.reduce((sum, img) => sum + img.views, 0) * 0.15),
            totalUsers: users.length,
            totalImages: images.length,
            avgViewsPerImage: images.length > 0 ? Math.floor(images.reduce((sum, img) => sum + img.views, 0) / images.length) : 0,
            avgLikesPerImage: images.length > 0 ? Math.floor(images.reduce((sum, img) => sum + img.likes, 0) / images.length) : 0,
            growthRate: 12.5
          },
          timeSeriesData: generateTimeSeriesData(dateRange),
          topImages: images
            .sort((a, b) => b.views - a.views)
            .slice(0, 10)
            .map(img => ({
              id: img.id,
              title: img.title,
              thumbnail: img.thumbnail,
              views: img.views,
              likes: img.likes,
              category: img.category,
              uploadDate: img.uploadDate
            })),
          categoryStats: generateCategoryStats(images),
          userStats: {
            topContributors: generateTopContributors(users, images),
            userGrowth: generateUserGrowthData()
          },
          deviceStats: {
            desktop: 45,
            mobile: 35,
            tablet: 20
          },
          geographicStats: [
            { country: 'United States', users: 1250, views: 15420 },
            { country: 'United Kingdom', users: 890, views: 11230 },
            { country: 'Canada', users: 650, views: 8940 },
            { country: 'Germany', users: 580, views: 7650 },
            { country: 'France', users: 420, views: 5890 }
          ],
          recentActivity: generateRecentActivity()
        };
        
        setAnalyticsData(mockData);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 500) + 200,
        likes: Math.floor(Math.random() * 100) + 50,
        uploads: Math.floor(Math.random() * 10) + 2,
        newUsers: Math.floor(Math.random() * 15) + 3
      });
    }
    
    return data;
  };

  const generateCategoryStats = (images: ImageType[]) => {
    const categories = Array.from(new Set(images.map(img => img.category)));
    
    return categories.map(category => {
      const categoryImages = images.filter(img => img.category === category);
      const totalViews = categoryImages.reduce((sum, img) => sum + img.views, 0);
      const totalLikes = categoryImages.reduce((sum, img) => sum + img.likes, 0);
      
      return {
        name: category,
        imageCount: categoryImages.length,
        totalViews,
        totalLikes,
        avgViews: Math.floor(totalViews / categoryImages.length)
      };
    }).sort((a, b) => b.totalViews - a.totalViews);
  };

  const generateTopContributors = (users: User[], images: ImageType[]) => {
    return users.map(user => {
      const userImages = images.filter(img => img.userId === user.id);
      const totalViews = userImages.reduce((sum, img) => sum + img.views, 0);
      const totalLikes = userImages.reduce((sum, img) => sum + img.likes, 0);
      
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        imageCount: userImages.length,
        totalViews,
        totalLikes
      };
    }).sort((a, b) => b.totalViews - a.totalViews).slice(0, 5);
  };

  const generateUserGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      newUsers: Math.floor(Math.random() * 50) + 20,
      activeUsers: Math.floor(Math.random() * 200) + 100
    }));
  };

  const generateRecentActivity = () => {
    const activities = [
      { type: 'view' as const, description: 'viewed "Sunset Over Mountains"', userName: 'John Doe', imageTitle: 'Sunset Over Mountains' },
      { type: 'like' as const, description: 'liked "City Lights at Night"', userName: 'Jane Smith', imageTitle: 'City Lights at Night' },
      { type: 'upload' as const, description: 'uploaded 3 new images', userName: 'Mike Johnson' },
      { type: 'download' as const, description: 'downloaded "Ocean Waves"', userName: 'Sarah Wilson', imageTitle: 'Ocean Waves' },
      { type: 'user_join' as const, description: 'joined the platform', userName: 'Alex Brown' }
    ];
    
    return activities.map((activity, index) => ({
      id: (index + 1).toString(),
      ...activity,
      timestamp: new Date(Date.now() - Math.random() * 86400000) // Random time in last 24h
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'views': return Eye;
      case 'likes': return Heart;
      case 'uploads': return ImageIcon;
      case 'downloads': return Download;
      default: return BarChart3;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-900" />
          <span className="text-gray-600">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your gallery performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(analyticsData.overview.totalViews)}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+{analyticsData.overview.growthRate}%</span>
              </div>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-red-600">{formatNumber(analyticsData.overview.totalLikes)}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+8.2%</span>
              </div>
            </div>
            <Heart className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(analyticsData.overview.totalDownloads)}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+15.3%</span>
              </div>
            </div>
            <Download className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(analyticsData.overview.totalUsers)}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+5.7%</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Performance Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="uploads">Uploads</option>
            </select>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.timeSeriesData.map((data, index) => {
              const value = data[selectedMetric];
              const maxValue = Math.max(...analyticsData.timeSeriesData.map(d => d[selectedMetric]));
              const height = (value / maxValue) * 200;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}px` }}
                    title={`${data.date}: ${value} ${selectedMetric}`}
                  />
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Device Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Desktop</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${analyticsData.deviceStats.desktop}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{analyticsData.deviceStats.desktop}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Mobile</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${analyticsData.deviceStats.mobile}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{analyticsData.deviceStats.mobile}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Tablet className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Tablet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${analyticsData.deviceStats.tablet}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{analyticsData.deviceStats.tablet}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Top Performing Images</h3>
          <div className="space-y-4">
            {analyticsData.topImages.slice(0, 5).map((image, index) => (
              <div key={image.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <img
                  src={image.thumbnail}
                  alt={image.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 truncate">{image.title}</p>
                  <p className="text-xs text-gray-500">{image.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Eye className="h-3 w-3" />
                    <span>{formatNumber(image.views)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Heart className="h-3 w-3" />
                    <span>{formatNumber(image.likes)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Category Performance</h3>
          <div className="space-y-4">
            {analyticsData.categoryStats.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.imageCount} images</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(category.totalViews)} views</p>
                  <p className="text-xs text-gray-500">{formatNumber(category.avgViews)} avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic and User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {analyticsData.geographicStats.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{country.country}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(country.users)} users</p>
                  <p className="text-xs text-gray-500">{formatNumber(country.views)} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Top Contributors</h3>
          <div className="space-y-4">
            {analyticsData.userStats.topContributors.map((user, index) => (
              <div key={user.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.imageCount} images</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(user.totalViews)}</p>
                  <p className="text-xs text-gray-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {analyticsData.recentActivity.map((activity) => {
            const Icon = getMetricIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icon className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.userName}</span> {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;