import React, { useState, useEffect } from 'react';
import { Image, Users, Eye, Heart, TrendingUp, Upload, Activity } from 'lucide-react';
import StatsCard from '../../components/Admin/StatsCard';
import { getImages, getUsers } from '../../utils/storage';
import { mockAnalytics } from '../../utils/mockData';
import { Image as ImageType, User, Analytics } from '../../types';

const Dashboard: React.FC = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>(mockAnalytics);

  useEffect(() => {
    const loadData = () => {
      setImages(getImages());
      setUsers(getUsers());
    };
    loadData();
  }, []);

  const stats = [
    {
      title: 'Total Images',
      value: images.length,
      change: '+12',
      changeType: 'increase' as const,
      icon: Image,
      color: 'blue' as const
    },
    {
      title: 'Total Users',
      value: users.length,
      change: '+3',
      changeType: 'increase' as const,
      icon: Users,
      color: 'green' as const
    },
    {
      title: 'Total Views',
      value: images.reduce((sum, img) => sum + img.views, 0).toLocaleString(),
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: Eye,
      color: 'purple' as const
    },
    {
      title: 'Total Likes',
      value: images.reduce((sum, img) => sum + img.likes, 0).toLocaleString(),
      change: '+15.3%',
      changeType: 'increase' as const,
      icon: Heart,
      color: 'orange' as const
    }
  ];

  const recentImages = images.slice(0, 5);
  const topImages = images.sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Recent Images</h3>
          <div className="space-y-4">
            {recentImages.map((image) => (
              <div key={image.id} className="flex items-center space-x-4">
                <img
                  src={image.thumbnail}
                  alt={image.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {image.title}
                  </p>
                  <p className="text-sm text-gray-500">{image.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{image.views} views</p>
                  <p className="text-sm text-gray-500">{image.likes} likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Top Performing</h3>
          <div className="space-y-4">
            {topImages.map((image, index) => (
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
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {image.title}
                  </p>
                  <p className="text-sm text-gray-500">{image.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{image.views} views</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">+{Math.floor(Math.random() * 20)}%</span>
                  </div>
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
          {analytics.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  {activity.type === 'upload' && <Upload className="h-4 w-4 text-yellow-600" />}
                  {activity.type === 'user_join' && <Users className="h-4 w-4 text-green-600" />}
                  {activity.type === 'like' && <Heart className="h-4 w-4 text-red-600" />}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;