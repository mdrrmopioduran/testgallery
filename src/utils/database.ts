import { DatabaseConfig, DatabaseConnection, DatabaseStats, TableInfo } from '../types/database';

// Database configuration storage
const DB_CONFIG_KEY = 'gallery_db_config';
const DB_CONNECTION_KEY = 'gallery_db_connection';

export const saveDbConfig = (config: DatabaseConfig): void => {
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
};

export const getDbConfig = (): DatabaseConfig | null => {
  const config = localStorage.getItem(DB_CONFIG_KEY);
  return config ? JSON.parse(config) : null;
};

export const saveDbConnection = (connection: DatabaseConnection): void => {
  localStorage.setItem(DB_CONNECTION_KEY, JSON.stringify(connection));
};

export const getDbConnection = (): DatabaseConnection => {
  const connection = localStorage.getItem(DB_CONNECTION_KEY);
  return connection ? JSON.parse(connection) : {
    isConnected: false,
    config: null,
    lastConnected: null,
    error: null
  };
};

// Mock database operations for demo purposes
export const testDatabaseConnection = async (config: DatabaseConfig): Promise<{ success: boolean; error?: string }> => {
  // Simulate connection test
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock validation
  if (!config.host || !config.user || !config.database) {
    return { success: false, error: 'Missing required connection parameters' };
  }
  
  if (config.host === 'localhost' && config.user === 'root') {
    return { success: true };
  }
  
  return { success: false, error: 'Connection failed: Access denied for user' };
};

export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  // Mock database statistics
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    totalTables: 8,
    totalRecords: 15420,
    databaseSize: '245.7 MB',
    lastBackup: new Date('2024-01-20T10:30:00Z'),
    uptime: '15 days, 8 hours'
  };
};

export const getTableInfo = async (): Promise<TableInfo[]> => {
  // Mock table information
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      name: 'images',
      rows: 1250,
      size: '125.4 MB',
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-20')
    },
    {
      name: 'users',
      rows: 48,
      size: '2.1 MB',
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-19')
    },
    {
      name: 'categories',
      rows: 12,
      size: '0.5 MB',
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-15')
    },
    {
      name: 'image_tags',
      rows: 3420,
      size: '15.2 MB',
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-20')
    },
    {
      name: 'user_sessions',
      rows: 156,
      size: '1.8 MB',
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-20')
    },
    {
      name: 'analytics',
      rows: 8940,
      size: '45.3 MB',
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-20')
    },
    {
      name: 'settings',
      rows: 1,
      size: '0.1 MB',
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-18')
    },
    {
      name: 'backups',
      rows: 24,
      size: '55.3 MB',
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-20')
    }
  ];
};

export const executeQuery = async (query: string): Promise<{ success: boolean; results?: any[]; error?: string }> => {
  // Mock query execution
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simple query validation
  if (!query.trim()) {
    return { success: false, error: 'Query cannot be empty' };
  }
  
  if (query.toLowerCase().includes('drop') || query.toLowerCase().includes('delete')) {
    return { success: false, error: 'Destructive queries are not allowed in demo mode' };
  }
  
  // Mock results based on query type
  if (query.toLowerCase().includes('select')) {
    return {
      success: true,
      results: [
        { id: 1, name: 'Sample Record 1', created_at: '2024-01-20' },
        { id: 2, name: 'Sample Record 2', created_at: '2024-01-19' },
        { id: 3, name: 'Sample Record 3', created_at: '2024-01-18' }
      ]
    };
  }
  
  return { success: true, results: [] };
};

export const createDatabaseTables = async (): Promise<{ success: boolean; error?: string }> => {
  // Mock table creation
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return { success: true };
};

export const migrateDatabaseSchema = async (): Promise<{ success: boolean; error?: string }> => {
  // Mock schema migration
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  return { success: true };
};