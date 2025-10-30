import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Key } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    treasurerKey: '',
  });

  const [loginAs, setLoginAs] = useState('member'); // 'member' or 'treasurer'

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleLoginAsChange = (role) => {
    setLoginAs(role);

    // If switching to member, clear treasurer-only fields and errors so member login isn't blocked
    if (role === 'member') {
      setFormData((prev) => ({ ...prev, treasurerKey: '' }));
      setErrors((prev) => {
        const { treasurerKey, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    // If logging in as treasurer, require treasurer key
    if (loginAs === 'treasurer') {
      if (!formData.treasurerKey.trim()) {
        newErrors.treasurerKey = 'Treasurer key is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare payload
    const payload = {
      email: formData.email,
      password: formData.password,
    };

    if (loginAs === 'treasurer') {
      payload.treasurerKey = formData.treasurerKey;
    }

    const result = await login(payload);

    if (result.success) {
      // Redirect based on user role
      if (result.user.role === 'treasurer') {
        navigate('/treasurer-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AuroraTreasury</h1>
          <p className="text-gray-600">Sign in to manage your club finances</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Login Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Login As</label>
              <div className="flex items-center space-x-4">
                <label className={`px-3 py-2 rounded-lg cursor-pointer ${loginAs === 'member' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                  <input type="radio" name="loginAs" value="member" checked={loginAs === 'member'} onChange={() => handleLoginAsChange('member')} className="hidden" />
                  Member
                </label>
                <label className={`px-3 py-2 rounded-lg cursor-pointer ${loginAs === 'treasurer' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                  <input type="radio" name="loginAs" value="treasurer" checked={loginAs === 'treasurer'} onChange={() => handleLoginAsChange('treasurer')} className="hidden" />
                  Treasurer
                </label>
              </div>
            </div>

            {/* Treasurer Key (shown only when loginAs === 'treasurer') */}
            {loginAs === 'treasurer' && (
              <div>
                <label htmlFor="treasurerKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Treasurer Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="treasurerKey"
                    name="treasurerKey"
                    type="text"
                    value={formData.treasurerKey}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.treasurerKey ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter treasurer key"
                  />
                </div>
                {errors.treasurerKey && <p className="mt-1 text-sm text-red-600">{errors.treasurerKey}</p>}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
          <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Contact your club treasurer for access or assistance
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
