import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import Background3D from '../components/Background3D';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    treasurerKey: '',
  });

  const [loginAs, setLoginAs] = useState('member');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleLoginAsChange = (role) => {
    setLoginAs(role);
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
    if (loginAs === 'treasurer' && !formData.treasurerKey.trim()) {
      newErrors.treasurerKey = 'Treasurer key is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const loginResult = await login(formData);
      if (loginResult.success) {
        if (loginResult.user) {
          if (loginResult.user.role === 'treasurer') navigate('/treasurer-dashboard');
          else navigate('/member-dashboard');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-inter">
      <Background3D />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#A6C36F]/20 overflow-hidden z-10 relative"
      >
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#A6C36F] to-transparent opacity-60" />

        {/* Header */}
        <div className="p-8 pb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-tr from-[#A6C36F] to-[#5F7A30] rounded-full mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(166,195,111,0.2)]"
          >
            <LogIn className="w-10 h-10 text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#F5F3E7] mb-2 tracking-tight">AuroraTreasury</h1>
          <p className="text-[#E8E3C5]/60">Sign in to manage your club finances</p>
        </div>

        {/* Login Form */}
        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#A6C36F]/70 group-focus-within:text-[#A6C36F] transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 ${
                    errors.email ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400 ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#A6C36F]/70 group-focus-within:text-[#A6C36F] transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 ${
                    errors.password ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400 ml-1">{errors.password}</p>}
            </div>

            {/* Login Type */}
            <div>
              <label className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">Login As</label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`relative flex items-center justify-center px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 border ${
                    loginAs === 'member'
                      ? 'bg-[#A6C36F]/10 border-[#A6C36F] text-[#A6C36F] shadow-[0_0_15px_rgba(166,195,111,0.05)]'
                      : 'bg-black/20 border-[#3A3E36]/40 text-[#E8E3C5]/40 hover:bg-black/40 hover:border-[#A6C36F]/20'
                  }`}
                >
                  <input type="radio" name="loginAs" value="member" checked={loginAs === 'member'} onChange={() => handleLoginAsChange('member')} className="hidden" />
                  <span className="font-medium">Member</span>
                </label>
                <label
                  className={`relative flex items-center justify-center px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 border ${
                    loginAs === 'treasurer'
                      ? 'bg-[#A6C36F]/10 border-[#A6C36F] text-[#A6C36F] shadow-[0_0_15px_rgba(166,195,111,0.05)]'
                      : 'bg-black/20 border-[#3A3E36]/40 text-[#E8E3C5]/40 hover:bg-black/40 hover:border-[#A6C36F]/20'
                  }`}
                >
                  <input type="radio" name="loginAs" value="treasurer" checked={loginAs === 'treasurer'} onChange={() => handleLoginAsChange('treasurer')} className="hidden" />
                  <span className="font-medium">Treasurer</span>
                </label>
              </div>
            </div>

            {/* Treasurer Key */}
            {loginAs === 'treasurer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="treasurerKey" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                  Treasurer Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-[#A6C36F]/70 group-focus-within:text-[#A6C36F] transition-colors" />
                  </div>
                  <input
                    id="treasurerKey"
                    name="treasurerKey"
                    type="text"
                    value={formData.treasurerKey}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 ${
                      errors.treasurerKey ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                    }`}
                    placeholder="Enter treasurer key"
                  />
                </div>
                {errors.treasurerKey && <p className="mt-1 text-sm text-red-400 ml-1">{errors.treasurerKey}</p>}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#A6C36F] to-[#8FAE5D] text-black py-3 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(166,195,111,0.2)] focus:outline-none focus:ring-2 focus:ring-[#A6C36F] focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {'Sign In'}
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up + Forgot Password */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-[#E8E3C5]/40">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#A6C36F] hover:text-[#E8E3C5] font-semibold transition-colors underline decoration-transparent hover:decoration-[#A6C36F] underline-offset-4">
                Sign up here
              </Link>
            </p>
            <p className="text-sm text-[#E8E3C5]/40">
              <Link to="/forgot-password" className="text-[#A6C36F] hover:text-[#E8E3C5] font-semibold transition-colors">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="py-4 bg-black/20 text-center text-[#E8E3C5]/20 text-xs border-t border-[#3A3E36]/20">
          Contact your club treasurer for access or assistance
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
