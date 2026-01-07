import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, GraduationCap, Building } from 'lucide-react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Background3D from '../components/Background3D';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    email: '',
    password: '',
    confirmPassword: '',
    year: '',
    branch: '',
    role: 'member',
    otp: ''
  });

  const [errors, setErrors] = useState({});
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const years = ['1st', '2nd', '3rd', '4th'];
  const branches = [
    'Computer Science',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Science',
    'Electrical Engineering',
    'Other',
  ];

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.usn.trim()) {
      newErrors.usn = 'USN is required';
    } else if (!/^[A-Z0-9]+$/i.test(formData.usn)) {
      newErrors.usn = 'USN must contain only letters and numbers';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.year) {
      newErrors.year = 'Please select your year';
    }

    if (!formData.branch) {
      newErrors.branch = 'Please select your branch';
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
      const response = await authAPI.sendOTP({ email: formData.email, type: 'signup' });
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

    if (!validateForm()) {
      return;
    }

    if (!showOTPInput) {
      await handleSendOTP();
      return;
    }

    if (!formData.otp) {
      setErrors((prev) => ({ ...prev, otp: 'OTP is required' }));
      return;
    }

    try {
      await authAPI.verifyOTP(formData.email, formData.otp);
      const result = await signup(formData);

      if (result.success) {
        toast.success('Account created successfully! Please login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-inter">
      <Background3D />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#A6C36F]/20 overflow-hidden z-10 relative"
      >
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#A6C36F] to-transparent opacity-60" />

        <div className="p-8 pb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-tr from-[#A6C36F] to-[#5F7A30] rounded-full mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(166,195,111,0.2)]"
          >
            <UserPlus className="w-10 h-10 text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#F5F3E7] mb-2 tracking-tight">Join AuroraTreasury</h1>
          <p className="text-[#E8E3C5]/60">Create your account to get started</p>
        </div>

        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name & USN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                  Full Name *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#A6C36F]/70 group-focus-within:text-[#A6C36F] transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 ${
                      errors.name ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-400 ml-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="usn" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                  USN *
                </label>
                <input
                  id="usn"
                  name="usn"
                  type="text"
                  value={formData.usn}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 ${
                    errors.usn ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                  }`}
                  placeholder="1AB23CS001"
                />
                {errors.usn && <p className="mt-1 text-sm text-red-400 ml-1">{errors.usn}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                Email Address *
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
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400 ml-1">{errors.email}</p>}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                  Password *
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
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-400 ml-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                  Confirm Password *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#A6C36F]/70 group-focus-within:text-[#A6C36F] transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400 ml-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Year & Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                  Academic Year *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-[#A6C36F]/70 group-focus-within:text-[#A6C36F] transition-colors" />
                  </div>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 appearance-none ${
                      errors.year ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                    }`}
                  >
                    <option value="" className="bg-[#050505]">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year} className="bg-[#050505]">
                        {year} Year
                      </option>
                    ))}
                  </select>
                </div>
                {errors.year && <p className="mt-1 text-sm text-red-400 ml-1">{errors.year}</p>}
              </div>

              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                  Branch/Department *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-[#A6C36F]/70 group-focus-within:text-[#A6C36F] transition-colors" />
                  </div>
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 appearance-none ${
                      errors.branch ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                    }`}
                  >
                    <option value="" className="bg-[#050505]">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch} className="bg-[#050505]">
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.branch && <p className="mt-1 text-sm text-red-400 ml-1">{errors.branch}</p>}
              </div>
            </div>

            {/* OTP */}
            {showOTPInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label htmlFor="otp" className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">
                  Enter OTP
                </label>
                <div className="relative group">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    className={`block w-full pl-4 pr-24 py-2.5 bg-black/40 border rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/20 focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-[#A6C36F] transition-all duration-300 ${
                      errors.otp ? 'border-red-500' : 'border-[#3A3E36]/40 hover:border-[#A6C36F]/30'
                    }`}
                    maxLength="6"
                    placeholder="6-digit OTP"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {countdown > 0 ? (
                      <span className="text-sm text-[#E8E3C5]/60 font-mono bg-black/40 px-2 py-1 rounded">
                        {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="text-xs text-black bg-[#A6C36F] hover:bg-[#8FAE5D] px-2 py-1 rounded transition-colors font-medium"
                      >
                        Resend
                      </button>
                    )}
                  </div>
                </div>
                {errors.otp && <p className="mt-1 text-sm text-red-400 ml-1">{errors.otp}</p>}
              </motion.div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#E8E3C5] mb-2 ml-1">Role</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors ${formData.role === 'member' ? 'border-[#A6C36F] bg-[#A6C36F]/20' : 'border-[#3A3E36]/40 group-hover:border-[#A6C36F]/30'}`}>
                    {formData.role === 'member' && <div className="w-2.5 h-2.5 rounded-full bg-[#A6C36F]" />}
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={formData.role === 'member'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-sm text-[#E8E3C5] group-hover:text-[#F5F3E7] transition-colors">Club Member</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors ${formData.role === 'treasurer' ? 'border-[#A6C36F] bg-[#A6C36F]/20' : 'border-[#3A3E36]/40 group-hover:border-[#A6C36F]/30'}`}>
                    {formData.role === 'treasurer' && <div className="w-2.5 h-2.5 rounded-full bg-[#A6C36F]" />}
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="treasurer"
                    checked={formData.role === 'treasurer'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-sm text-[#E8E3C5] group-hover:text-[#F5F3E7] transition-colors">Treasurer/President</span>
                </label>
              </div>
            </div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#A6C36F] to-[#8FAE5D] text-black py-3 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(166,195,111,0.3)] focus:outline-none focus:ring-2 focus:ring-[#A6C36F] focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg mt-4"
            >
              {isLoading || isVerifying ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
                  Processing...
                </>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-[#E8E3C5]/40">
            Already have an account?{' '}
            <Link to="/login" className="text-[#A6C36F] hover:text-[#E8E3C5] font-semibold transition-colors underline decoration-transparent hover:decoration-[#A6C36F] underline-offset-4">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
