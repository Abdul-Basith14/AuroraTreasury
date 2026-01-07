import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, GraduationCap, Building } from 'lucide-react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B09] px-4 py-8 text-[#F5F3E7]">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A6C36F] rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-[#0B0B09]" />
          </div>
          <h1 className="text-3xl font-bold text-[#F5F3E7] mb-2">Join AuroraTreasury</h1>
          <p className="text-[#E8E3C5]">Create your account to get started</p>
        </div>

        <div className="bg-[#1F221C] rounded-2xl border border-[#3A3E36]/40 p-8 shadow-[0_0_25px_rgba(166,195,111,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name & USN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/70 w-5 h-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#0B0B09] border focus:outline-none focus:ring-2 focus:ring-[#A6C36F] text-[#F5F3E7] placeholder-[#E8E3C5]/50 ${
                      errors.name ? 'border-red-500' : 'border-[#3A3E36]/60'
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="usn" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  USN *
                </label>
                <input
                  id="usn"
                  name="usn"
                  type="text"
                  value={formData.usn}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg bg-[#0B0B09] border focus:outline-none focus:ring-2 focus:ring-[#A6C36F] text-[#F5F3E7] placeholder-[#E8E3C5]/50 ${
                    errors.usn ? 'border-red-500' : 'border-[#3A3E36]/60'
                  }`}
                />
                {errors.usn && <p className="mt-1 text-sm text-red-500">{errors.usn}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/70 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#0B0B09] border focus:outline-none focus:ring-2 focus:ring-[#A6C36F] text-[#F5F3E7] placeholder-[#E8E3C5]/50 ${
                    errors.email ? 'border-red-500' : 'border-[#3A3E36]/60'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/70 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#0B0B09] border focus:outline-none focus:ring-2 focus:ring-[#A6C36F] text-[#F5F3E7] ${
                      errors.password ? 'border-red-500' : 'border-[#3A3E36]/60'
                    }`}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/70 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#0B0B09] border focus:outline-none focus:ring-2 focus:ring-[#A6C36F] text-[#F5F3E7] ${
                      errors.confirmPassword ? 'border-red-500' : 'border-[#3A3E36]/60'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Year & Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Academic Year *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/70 w-5 h-5" />
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#0B0B09] border focus:outline-none focus:ring-2 focus:ring-[#A6C36F] text-[#F5F3E7] ${
                      errors.year ? 'border-red-500' : 'border-[#3A3E36]/60'
                    }`}
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year} Year
                      </option>
                    ))}
                  </select>
                </div>
                {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year}</p>}
              </div>

              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Branch/Department *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6C36F]/70 w-5 h-5" />
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#0B0B09] border focus:outline-none focus:ring-2 focus:ring-[#A6C36F] text-[#F5F3E7] ${
                      errors.branch ? 'border-red-500' : 'border-[#3A3E36]/60'
                    }`}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.branch && <p className="mt-1 text-sm text-red-500">{errors.branch}</p>}
              </div>
            </div>

            {/* OTP */}
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
                    className={`w-full pl-4 pr-20 py-2 rounded-lg bg-[#0B0B09] border focus:outline-none focus:ring-2 focus:ring-[#A6C36F] text-[#F5F3E7] ${
                      errors.otp ? 'border-red-500' : 'border-[#3A3E36]/60'
                    }`}
                    maxLength="6"
                  />
                  {countdown > 0 ? (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[#E8E3C5]/70">
                      {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-[#A6C36F] hover:text-[#8FAE5D]"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                {errors.otp && <p className="mt-1 text-sm text-red-500">{errors.otp}</p>}
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#E8E3C5] mb-2">Role</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={formData.role === 'member'}
                    onChange={handleChange}
                    className="mr-2 accent-[#A6C36F]"
                  />
                  <span className="text-sm text-[#E8E3C5]">Club Member</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="treasurer"
                    checked={formData.role === 'treasurer'}
                    onChange={handleChange}
                    className="mr-2 accent-[#A6C36F]"
                  />
                  <span className="text-sm text-[#E8E3C5]">Treasurer/President</span>
                </label>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#A6C36F] text-[#0B0B09] py-2 px-4 rounded-xl hover:bg-[#8FAE5D] focus:outline-none focus:ring-2 focus:ring-[#A6C36F]/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading || isVerifying ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0B0B09]"
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
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#E8E3C5]/70">
            Already have an account?{' '}
            <Link to="/login" className="text-[#A6C36F] hover:text-[#8FAE5D] font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
