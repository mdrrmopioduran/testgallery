import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Camera, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

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

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim()
            }
          }
        });

        if (error) {
          setError(error.message);
          toast.error(error.message);
        } else if (data.user) {
          toast.success('Account created successfully! You can now log in.');
          setIsSignUp(false);
          setName('');
        }
      } else {
        // Sign in
        const success = await login(email, password);
        if (success) {
          navigate('/admin');
        } else {
          setError('Invalid email or password. Please check your credentials.');
        }
      }
    } catch (err) {
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
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isSignUp ? (
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
          </form>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">✅ Supabase Connected</h3>
            <p className="text-xs text-green-700">
              Your gallery is powered by Supabase for authentication, database, and file storage.
            </p>
            <p className="text-xs text-green-600 mt-1">
              {isSignUp ? 'Create your account to get started!' : 'Sign in to access the admin dashboard!'}
            </p>
          </div>
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