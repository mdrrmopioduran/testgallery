import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Dashboard from './pages/Admin/Dashboard';
import Images from './pages/Admin/Images';
import Upload from './pages/Admin/Upload';
import Enhance from './pages/Admin/Enhance';
import Users from './pages/Admin/Users';
import Categories from './pages/Admin/Categories';
import Collections from './pages/Admin/Collections';
import Archives from './pages/Admin/Archives';
import Settings from './pages/Admin/Settings';
import Database from './pages/Admin/Database';
import Watermark from './pages/Admin/Watermark';
import Analytics from './pages/Admin/Analytics';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/images"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Images />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/upload"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Upload />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enhance"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Enhance />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/watermark"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Watermark />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Users />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Categories />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/collections"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Collections />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/archives"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Archives />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/database"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Database />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Analytics />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;