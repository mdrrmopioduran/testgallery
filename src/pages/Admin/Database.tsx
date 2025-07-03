import React, { useState, useEffect } from 'react';
import { Database as DatabaseIcon, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import ConnectionForm from '../../components/Database/ConnectionForm';
import DatabaseDashboard from '../../components/Database/DatabaseDashboard';
import { DatabaseConfig, DatabaseConnection } from '../../types/database';
import { getDbConnection, saveDbConnection } from '../../utils/database';

const Database: React.FC = () => {
  const [connection, setConnection] = useState<DatabaseConnection>({
    isConnected: false,
    config: null,
    lastConnected: null,
    error: null
  });

  useEffect(() => {
    const savedConnection = getDbConnection();
    setConnection(savedConnection);
  }, []);

  const handleConnectionSuccess = (config: DatabaseConfig) => {
    const newConnection: DatabaseConnection = {
      isConnected: true,
      config,
      lastConnected: new Date(),
      error: null
    };
    
    setConnection(newConnection);
    saveDbConnection(newConnection);
  };

  const handleDisconnect = () => {
    const disconnectedConnection: DatabaseConnection = {
      isConnected: false,
      config: connection.config,
      lastConnected: connection.lastConnected,
      error: null
    };
    
    setConnection(disconnectedConnection);
    saveDbConnection(disconnectedConnection);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Database Management</h1>
          <p className="text-gray-600 mt-1">Configure and manage your MySQL database connection</p>
        </div>
        
        {connection.isConnected && (
          <button
            onClick={handleDisconnect}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Disconnect</span>
          </button>
        )}
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connection.isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Database Status: {connection.isConnected ? 'Connected' : 'Disconnected'}
              </h3>
              {connection.config && (
                <p className="text-sm text-gray-500">
                  {connection.config.user}@{connection.config.host}:{connection.config.port}/{connection.config.database}
                </p>
              )}
              {connection.lastConnected && (
                <p className="text-xs text-gray-400">
                  Last connected: {new Date(connection.lastConnected).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {connection.isConnected ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {connection.isConnected ? (
        <DatabaseDashboard />
      ) : (
        <ConnectionForm onConnectionSuccess={handleConnectionSuccess} />
      )}

      {/* Database Schema Information */}
      {connection.isConnected && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Database Schema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Required Tables</h4>
              <div className="space-y-2">
                {[
                  { name: 'users', description: 'User accounts and profiles' },
                  { name: 'images', description: 'Image metadata and information' },
                  { name: 'categories', description: 'Image categories' },
                  { name: 'image_tags', description: 'Tags associated with images' },
                  { name: 'user_sessions', description: 'User authentication sessions' },
                  { name: 'analytics', description: 'Usage analytics and statistics' },
                  { name: 'settings', description: 'Application configuration' },
                  { name: 'backups', description: 'Backup history and metadata' }
                ].map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-sm">{table.name}</span>
                      <p className="text-xs text-gray-500">{table.description}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Migration Status</h4>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Schema is up to date</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    All required tables and indexes are present
                  </p>
                </div>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Run Migration</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Database;