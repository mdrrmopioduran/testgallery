import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Camera, Eye, EyeOff, AlertCircle, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check Supabase connection
    checkSupabaseConnection();
  }, []);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Supabase connection error:', error);
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
      setConnectionStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        if (!name.trim()) {
          setError('Name is required for registration');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim()
            }
          }
        });

        if (error) {
          console.error('Signup error:', error);
          setError(error.message);
          toast.error(error.message);
        } else if (data.user) {
          toast.success('Account created successfully! You can now log in.');
          setIsSignUp(false);
          setName('');
          setPassword('');
        }
      } else {
        // Sign in
        const success = await login(email.trim(), password);
        if (success) {
          toast.success('Login successful!');
          navigate('/admin');
        } else {
          setError('Invalid email or password. Please check your credentials.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = isSignUp ? 'Registration failed. Please try again.' : 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setName('');
    setPassword('');
  };

  const handleDemoLogin = async () => {
    setEmail('admin@gallery.com');
    setPassword('admin123');
    setLoading(true);
    
    // Try to login with demo credentials
    const success = await login('admin@gallery.com', 'admin123');
    if (!success) {
      // If demo user doesn't exist, create it
      try {
        const { data, error } = await supabase.auth.signUp({
          email: 'admin@gallery.com',
          password: 'admin123',
          options: {
            data: {
              name: 'Demo Admin'
            }
          }
        });

        if (data.user) {
          toast.success('Demo account created! Logging in...');
          setTimeout(async () => {
            const loginSuccess = await login('admin@gallery.com', 'admin123');
            if (loginSuccess) {
              navigate('/admin');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Demo account creation failed:', error);
        toast.error('Failed to create demo account');
      }
    } else {
      navigate('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <Camera className="h-10 w-10 text-blue-900" />
            <span className="text-2xl font-bold text-blue-900">Gallery Pro</span>
          </Link>
          <h2 className="text-3xl font-bold text-blue-900">
            {isSignUp ? 'Create Account' : 'Admin Login'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp 
              ? 'Sign up to start managing your gallery' 
              : 'Sign in to access the gallery dashboard'
            }
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-yellow-200">
          {/* Connection Status */}
          <div className={`mb-6 p-4 rounded-lg border ${
            connectionStatus === 'connected' 
              ? 'bg-green-50 border-green-200' 
              : connectionStatus === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center">
              {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-600 mr-3" />}
              {connectionStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-600 mr-3" />}
              {connectionStatus === 'checking' && <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-3" />}
              
              <div>
                <h3 className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-green-800' :
                  connectionStatus === 'error' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {connectionStatus === 'connected' && '✅ Supabase Connected'}
                  {connectionStatus === 'error' && '❌ Connection Error'}
                  {connectionStatus === 'checking' && '🔄 Checking Connection...'}
                </h3>
                <p className={`text-xs ${
                  connectionStatus === 'connected' ? 'text-green-700' :
                  connectionStatus === 'error' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {connectionStatus === 'connected' && 'Database and authentication ready'}
                  {connectionStatus === 'error' && 'Please check your Supabase configuration'}
                  {connectionStatus === 'checking' && 'Verifying database connection...'}
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium">{isSignUp ? 'Registration Failed' : 'Login Failed'}</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={isSignUp}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-900 focus:border-blue-900"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-900 focus:border-blue-900"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-900 focus:border-blue-900"
                  placeholder="Enter your password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || connectionStatus !== 'connected'}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isSignUp ? (
                    <UserPlus className="h-5 w-5 text-blue-700 group-hover:text-blue-600" />
                  ) : (
                    <LogIn className="h-5 w-5 text-blue-700 group-hover:text-blue-600" />
                  )}
                </span>
                {loading 
                  ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                  : (isSignUp ? 'Create Account' : 'Sign in')
                }
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                disabled={loading}
                className="ml-1 text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors disabled:opacity-50"
              >
                {isSignUp ? 'Sign in here' : 'Sign up here'}
              </button>
            </div>

            {/* Demo Login Button */}
            {!isSignUp && (
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading || connectionStatus !== 'connected'}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Try Demo Account
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Email: admin@gallery.com | Password: admin123
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="font-medium text-blue-900 hover:text-blue-700 transition-colors"
          >
            ← Back to Gallery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;