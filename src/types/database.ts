export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
  connectionLimit?: number;
  acquireTimeout?: number;
  timeout?: number;
}

export interface DatabaseConnection {
  isConnected: boolean;
  config: DatabaseConfig | null;
  lastConnected: Date | null;
  error: string | null;
}

export interface DatabaseStats {
  totalTables: number;
  totalRecords: number;
  databaseSize: string;
  lastBackup: Date | null;
  uptime: string;
}

export interface TableInfo {
  name: string;
  rows: number;
  size: string;
  engine: string;
  collation: string;
  created: Date;
  updated: Date;
}

export interface DatabaseQuery {
  id: string;
  query: string;
  timestamp: Date;
  duration: number;
  status: 'success' | 'error';
  error?: string;
  results?: any[];
}