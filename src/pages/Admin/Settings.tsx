import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Camera, 
  Globe, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Mail,
  Server,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload as UploadIcon,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface SettingsData {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
  };
  gallery: {
    imagesPerPage: number;
    allowPublicUploads: boolean;
    requireApproval: boolean;
    maxFileSize: number;
    allowedFormats: string[];
    enableWatermark: boolean;
    watermarkText: string;
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireStrongPasswords: boolean;
    enableCaptcha: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    newUserNotifications: boolean;
    newImageNotifications: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    accentColor: string;
    logoUrl: string;
    faviconUrl: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    lastBackup: string;
  };
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      siteName: 'Gallery Pro',
      siteDescription: 'Professional image gallery and management system',
      siteUrl: 'https://gallery-pro.com',
      adminEmail: 'admin@gallery-pro.com',
      timezone: 'UTC',
      language: 'en'
    },
    gallery: {
      imagesPerPage: 20,
      allowPublicUploads: false,
      requireApproval: true,
      maxFileSize: 10,
      allowedFormats: ['JPEG', 'PNG', 'WebP'],
      enableWatermark: false,
      watermarkText: 'Gallery Pro'
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireStrongPasswords: true,
      enableCaptcha: false
    },
    notifications: {
      emailNotifications: true,
      newUserNotifications: true,
      newImageNotifications: true,
      systemAlerts: true,
      weeklyReports: false
    },
    appearance: {
      theme: 'light',
      primaryColor: '#1e3a8a',
      accentColor: '#eab308',
      logoUrl: '',
      faviconUrl: ''
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: '2024-01-20T10:30:00Z'
    }
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('gallery_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('gallery_settings', JSON.stringify(settings));
    setUnsavedChanges(false);
    setSaving(false);
    
    alert('Settings saved successfully!');
  };

  const handleBackup = () => {
    const data = {
      settings,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gallery-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          setSettings(data.settings);
          setUnsavedChanges(true);
          alert('Settings restored successfully!');
        }
      } catch (error) {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'gallery', label: 'Gallery', icon: Camera },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'backup', label: 'Backup', icon: Database }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email
          </label>
          <input
            type="email"
            value={settings.general.adminEmail}
            onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderGallerySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images Per Page
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={settings.gallery.imagesPerPage}
            onChange={(e) => handleSettingChange('gallery', 'imagesPerPage', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max File Size (MB)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={settings.gallery.maxFileSize}
            onChange={(e) => handleSettingChange('gallery', 'maxFileSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allowed File Formats
        </label>
        <div className="flex flex-wrap gap-3">
          {['JPEG', 'PNG', 'WebP', 'GIF', 'TIFF'].map(format => (
            <label key={format} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.gallery.allowedFormats.includes(format)}
                onChange={(e) => {
                  const formats = e.target.checked
                    ? [...settings.gallery.allowedFormats, format]
                    : settings.gallery.allowedFormats.filter(f => f !== format);
                  handleSettingChange('gallery', 'allowedFormats', formats);
                }}
                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700 mr-2"
              />
              <span className="text-sm text-gray-700">{format}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowPublicUploads"
            checked={settings.gallery.allowPublicUploads}
            onChange={(e) => handleSettingChange('gallery', 'allowPublicUploads', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
          <label htmlFor="allowPublicUploads" className="ml-2 text-sm text-gray-700">
            Allow public uploads
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireApproval"
            checked={settings.gallery.requireApproval}
            onChange={(e) => handleSettingChange('gallery', 'requireApproval', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
          <label htmlFor="requireApproval" className="ml-2 text-sm text-gray-700">
            Require admin approval for new images
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableWatermark"
            checked={settings.gallery.enableWatermark}
            onChange={(e) => handleSettingChange('gallery', 'enableWatermark', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
          <label htmlFor="enableWatermark" className="ml-2 text-sm text-gray-700">
            Enable watermark on images
          </label>
        </div>
      </div>

      {settings.gallery.enableWatermark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Watermark Text
          </label>
          <input
            type="text"
            value={settings.gallery.watermarkText}
            onChange={(e) => handleSettingChange('gallery', 'watermarkText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="480"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableTwoFactor"
            checked={settings.security.enableTwoFactor}
            onChange={(e) => handleSettingChange('security', 'enableTwoFactor', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
          <label htmlFor="enableTwoFactor" className="ml-2 text-sm text-gray-700">
            Enable two-factor authentication
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireStrongPasswords"
            checked={settings.security.requireStrongPasswords}
            onChange={(e) => handleSettingChange('security', 'requireStrongPasswords', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
          <label htmlFor="requireStrongPasswords" className="ml-2 text-sm text-gray-700">
            Require strong passwords
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableCaptcha"
            checked={settings.security.enableCaptcha}
            onChange={(e) => handleSettingChange('security', 'enableCaptcha', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
          <label htmlFor="enableCaptcha" className="ml-2 text-sm text-gray-700">
            Enable CAPTCHA for login
          </label>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">API Key</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Your API key for external integrations. Keep this secure and don't share it.
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value="sk_live_1234567890abcdef"
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-yellow-300 rounded-lg text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 text-yellow-600 hover:text-yellow-700"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button className="p-2 text-yellow-600 hover:text-yellow-700">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">New User Notifications</h4>
            <p className="text-sm text-gray-500">Get notified when new users register</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.newUserNotifications}
            onChange={(e) => handleSettingChange('notifications', 'newUserNotifications', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">New Image Notifications</h4>
            <p className="text-sm text-gray-500">Get notified when new images are uploaded</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.newImageNotifications}
            onChange={(e) => handleSettingChange('notifications', 'newImageNotifications', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">System Alerts</h4>
            <p className="text-sm text-gray-500">Receive important system notifications</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.systemAlerts}
            onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
            <p className="text-sm text-gray-500">Receive weekly analytics reports</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.weeklyReports}
            onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={settings.appearance.theme}
            onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.appearance.primaryColor}
              onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={settings.appearance.primaryColor}
              onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accent Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.appearance.accentColor}
              onChange={(e) => handleSettingChange('appearance', 'accentColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={settings.appearance.accentColor}
              onChange={(e) => handleSettingChange('appearance', 'accentColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            value={settings.appearance.logoUrl}
            onChange={(e) => handleSettingChange('appearance', 'logoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Favicon URL
          </label>
          <input
            type="url"
            value={settings.appearance.faviconUrl}
            onChange={(e) => handleSettingChange('appearance', 'faviconUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            placeholder="https://example.com/favicon.ico"
          />
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Frequency
          </label>
          <select
            value={settings.backup.backupFrequency}
            onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retention Days
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={settings.backup.retentionDays}
            onChange={(e) => handleSettingChange('backup', 'retentionDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoBackup"
          checked={settings.backup.autoBackup}
          onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
          className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
        />
        <label htmlFor="autoBackup" className="ml-2 text-sm text-gray-700">
          Enable automatic backups
        </label>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Last Backup</h4>
        <p className="text-sm text-gray-600">
          {new Date(settings.backup.lastBackup).toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleBackup}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download Backup</span>
        </button>
        
        <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
          <UploadIcon className="h-4 w-4" />
          <span>Restore Backup</span>
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
          />
        </label>

        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Trash2 className="h-4 w-4" />
          <span>Clear All Data</span>
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'gallery': return renderGallerySettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'backup': return renderBackupSettings();
      default: return renderGeneralSettings();
    }
  };

  // Get the current tab data
  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentIcon = currentTab?.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your gallery system preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!unsavedChanges || saving}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {unsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <p className="text-sm text-yellow-800">
              You have unsaved changes. Don't forget to save your settings.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-50 text-blue-900 border border-yellow-200'
                    : 'text-gray-700 hover:bg-yellow-50 hover:text-blue-900'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              {CurrentIcon && (
                <CurrentIcon className="h-6 w-6 text-blue-900" />
              )}
              <h2 className="text-xl font-semibold text-blue-900">
                {currentTab?.label} Settings
              </h2>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;