import React, { useState, useEffect } from 'react';
import { Database, Eye, EyeOff, TestTube, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { DatabaseConfig } from '../../types/database';
import { testDatabaseConnection, saveDbConfig, getDbConfig } from '../../utils/database';

interface ConnectionFormProps {
  onConnectionSuccess: (config: DatabaseConfig) => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onConnectionSuccess }) => {
  const [config, setConfig] = useState<DatabaseConfig>({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'gallery_pro',
    ssl: false,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved configuration
    const savedConfig = getDbConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, []);

  const handleInputChange = (field: keyof DatabaseConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testDatabaseConnection(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConnection = async () => {
    setSaving(true);
    
    try {
      saveDbConfig(config);
      onConnectionSuccess(config);
      alert('Database configuration saved successfully!');
    } catch (error) {
      alert('Failed to save database configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Database className="h-6 w-6 text-blue-900" />
        <h2 className="text-xl font-semibold text-blue-900">Database Connection</h2>
      </div>

      <div className="space-y-6">
        {/* Basic Connection Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host
            </label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => handleInputChange('host', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="localhost"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port
            </label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="3306"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={config.user}
              onChange={(e) => handleInputChange('user', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="root"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database Name
          </label>
          <input
            type="text"
            value={config.database}
            onChange={(e) => handleInputChange('database', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            placeholder="gallery_pro"
          />
        </div>

        {/* Advanced Settings */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Limit
              </label>
              <input
                type="number"
                value={config.connectionLimit}
                onChange={(e) => handleInputChange('connectionLimit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acquire Timeout (ms)
              </label>
              <input
                type="number"
                value={config.acquireTimeout}
                onChange={(e) => handleInputChange('acquireTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                min="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query Timeout (ms)
              </label>
              <input
                type="number"
                value={config.timeout}
                onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                min="1000"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.ssl || false}
                onChange={(e) => handleInputChange('ssl', e.target.checked)}
                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
              />
              <span className="ml-2 text-sm text-gray-700">Enable SSL connection</span>
            </label>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? 'Connection successful!' : 'Connection failed'}
              </span>
            </div>
            {testResult.error && (
              <p className="text-sm text-red-700 mt-1">{testResult.error}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <button
            onClick={handleSaveConnection}
            disabled={saving || !testResult?.success}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>

        {/* Demo Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Demo Mode</h4>
              <p className="text-sm text-yellow-700 mt-1">
                This is a demo environment. Use "localhost" as host and "root" as username for a successful test connection.
                In production, replace this with actual MySQL connection logic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionForm;