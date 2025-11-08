import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, verifyOTP } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    treasurerKey: '',
    otp: ''
  });

  const [loginAs, setLoginAs] = useState('member');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
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

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setIsVerifying(true);
    try {
      const response = await authAPI.sendOTP({
        email: formData.email,
        type: 'login'
      });
      if (response.success) {
        toast.success('OTP sent to your email');
        setShowOTPInput(true);
        startCountdown();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (!showOTPInput) {
        const loginResult = await login(formData);
        if (loginResult.success) {
          if (loginResult.user) {
            if (loginResult.user.role === 'treasurer') navigate('/treasurer-dashboard');
            else navigate('/member-dashboard');
          } else if (loginResult.requireOTP) {
            setShowOTPInput(true);
            startCountdown();
          }
        }
        return;
      }

      if (!formData.otp) {
        setErrors((prev) => ({ ...prev, otp: 'OTP is required' }));
        return;
      }

      const result = await verifyOTP(formData.email, formData.otp, 'login');
      if (result.success && result.user) {
        if (result.user.role === 'treasurer') navigate('/treasurer-dashboard');
        else navigate('/member-dashboard');
      } else if (result.success) {
        toast.success('OTP verified');
      } else {
        toast.error(result.error || 'OTP verification failed');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B09] text-[#F5F3E7] px-4 font-inter">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A6C36F]/10 rounded-full ring-1 ring-[#3A3E36]/40 shadow-[0_0_25px_rgba(166,195,111,0.08)] mb-4">
            <LogIn className="w-8 h-8 text-[#A6C36F]" />
          </div>
          <h1 className="text-3xl font-bold text-[#F5F3E7] mb-1">AuroraTreasury</h1>
          <p className="text-[#E8E3C5]/70 text-sm">Sign in to manage your club finances</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1F221C] rounded-2xl border border-[#3A3E36]/40 shadow-[0_0_25px_rgba(166,195,111,0.08)] p-8 ring-1 ring-[#3A3E36]/40 hover-glow transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/80 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 bg-[#0B0B09] text-[#F5F3E7] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6C36F] transition-all duration-300 ${
                    errors.email ? 'border-red-500' : 'border-[#3A3E36]/40'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/80 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 bg-[#0B0B09] text-[#F5F3E7] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6C36F] transition-all duration-300 ${
                    errors.password ? 'border-red-500' : 'border-[#3A3E36]/40'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Login Type */}
            <div>
              <label className="block text-sm font-medium text-[#E8E3C5] mb-2">Login As</label>
              <div className="flex items-center space-x-4">
                <label
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    loginAs === 'member'
                      ? 'bg-[#A6C36F]/20 text-[#A6C36F]'
                      : 'bg-[#0B0B09] text-[#E8E3C5]/70 border border-[#3A3E36]/40'
                  }`}
                >
                  <input type="radio" name="loginAs" value="member" checked={loginAs === 'member'} onChange={() => handleLoginAsChange('member')} className="hidden" />
                  Member
                </label>
                <label
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    loginAs === 'treasurer'
                      ? 'bg-[#A6C36F]/20 text-[#A6C36F]'
                      : 'bg-[#0B0B09] text-[#E8E3C5]/70 border border-[#3A3E36]/40'
                  }`}
                >
                  <input type="radio" name="loginAs" value="treasurer" checked={loginAs === 'treasurer'} onChange={() => handleLoginAsChange('treasurer')} className="hidden" />
                  Treasurer
                </label>
              </div>
            </div>

            {/* Treasurer Key */}
            {loginAs === 'treasurer' && (
              <div>
                <label htmlFor="treasurerKey" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Treasurer Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/80 w-5 h-5" />
                  <input
                    id="treasurerKey"
                    name="treasurerKey"
                    type="text"
                    value={formData.treasurerKey}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 bg-[#0B0B09] text-[#F5F3E7] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6C36F] transition-all duration-300 ${
                      errors.treasurerKey ? 'border-red-500' : 'border-[#3A3E36]/40'
                    }`}
                    placeholder="Enter treasurer key"
                  />
                </div>
                {errors.treasurerKey && <p className="mt-1 text-sm text-red-500">{errors.treasurerKey}</p>}
              </div>
            )}

            {/* OTP Input */}
            {showOTPInput && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-20 py-2 bg-[#0B0B09] text-[#F5F3E7] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6C36F] transition-all duration-300 ${
                      errors.otp ? 'border-red-500' : 'border-[#3A3E36]/40'
                    }`}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  {countdown > 0 ? (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[#E8E3C5]/60">{countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-[#A6C36F] hover:text-[#8FAE5D] transition-all"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                {errors.otp && <p className="mt-1 text-sm text-red-500">{errors.otp}</p>}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#A6C36F] text-[#0B0B09] py-2 px-4 rounded-2xl hover:bg-[#8FAE5D] focus:outline-none focus:ring-2 focus:ring-[#A6C36F] focus:ring-offset-2 focus:ring-offset-[#0B0B09] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-[0_0_25px_rgba(166,195,111,0.08)]"
            >
              {isLoading || isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0B0B09]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isVerifying ? 'Sending OTP...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {showOTPInput ? 'Verify & Sign In' : 'Continue with Email'}
                </>
              )}
            </button>
          </form>

          {/* Sign Up + Forgot Password */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-[#E8E3C5]/70">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#A6C36F] hover:text-[#8FAE5D] font-medium">
                Sign up here
              </Link>
            </p>
            <p className="text-sm text-[#E8E3C5]/70">
              <Link to="/forgot-password" className="text-[#A6C36F] hover:text-[#8FAE5D] font-medium">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[#E8E3C5]/60 text-sm italic">
          Contact your club treasurer for access or assistance
        </div>
      </div>
    </div>
  );
};

export default Login;
