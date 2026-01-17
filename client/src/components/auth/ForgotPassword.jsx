import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset, checkResetStatus } from '../../utils/passwordResetAPI';
import { KeyRound, Mail, Lock, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: set password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const navigate = useNavigate();

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await checkResetStatus(email);
      if (response.success && response.data.hasRequest) {
        setRequestStatus(response.data);
        toast.info(`Your password reset request is ${response.data.status}`);
      } else {
        setStep(2);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to check status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await requestPasswordReset(email, newPassword, confirmPassword);
      if (response.success) {
        toast.success(response.message);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit reset request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-black/40 backdrop-blur-md border border-[#A6C36F]/30 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-[#A6C36F]/20 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-[#A6C36F]" />
            </div>
            <h2 className="text-3xl font-bold text-[#F5F3E7]">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-[#E8E3C5]/70">
              {step === 1 
                ? 'Enter your email to check status or create a reset request'
                : 'Enter your new password for approval by treasurer'}
            </p>
          </div>

          {requestStatus && requestStatus.status === 'pending' && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock className="w-5 h-5" />
                <p className="font-medium">Request Pending</p>
              </div>
              <p className="text-sm text-[#E8E3C5]/70 mt-1">
                Your password reset request is awaiting treasurer approval. Please check back later.
              </p>
            </div>
          )}

          {requestStatus && requestStatus.status === 'rejected' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">Request Rejected</p>
              </div>
              <p className="text-sm text-[#E8E3C5]/70 mt-1">
                {requestStatus.rejectionReason || 'Your request was rejected. Please submit a new request.'}
              </p>
              <button
                onClick={() => {
                  setRequestStatus(null);
                  setStep(2);
                }}
                className="mt-2 text-sm text-[#A6C36F] hover:text-[#E8E3C5] transition-colors"
              >
                Submit New Request →
              </button>
            </div>
          )}

          {requestStatus && requestStatus.status === 'approved' && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">Request Approved</p>
              </div>
              <p className="text-sm text-[#E8E3C5]/70 mt-1">
                Your password has been reset. You can now login with your new password.
              </p>
              <div className="flex gap-3 mt-3">
                <Link
                  to="/login"
                  className="text-sm text-[#A6C36F] hover:text-[#E8E3C5] transition-colors font-medium"
                >
                  Go to Login →
                </Link>
                <span className="text-[#E8E3C5]/30">|</span>
                <button
                  onClick={() => {
                    setRequestStatus(null);
                    setStep(2);
                  }}
                  className="text-sm text-[#A6C36F] hover:text-[#E8E3C5] transition-colors font-medium"
                >
                  Reset Again →
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCheckStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E8E3C5]/70 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A6C36F]/50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#A6C36F]/30 rounded-lg text-[#F5F3E7] placeholder-[#E8E3C5]/40 focus:outline-none focus:border-[#A6C36F] transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#A6C36F] text-black font-semibold rounded-lg hover:bg-[#E8E3C5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Checking...' : 'Check Status / Continue'}
              </button>
            </form>
          )}

          {step === 2 && !requestStatus && (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E8E3C5]/70 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A6C36F]/50" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-[#A6C36F]/20 rounded-lg text-[#E8E3C5]/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E8E3C5]/70 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A6C36F]/50" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#A6C36F]/30 rounded-lg text-[#F5F3E7] placeholder-[#E8E3C5]/40 focus:outline-none focus:border-[#A6C36F] transition-colors"
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E8E3C5]/70 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A6C36F]/50" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#A6C36F]/30 rounded-lg text-[#F5F3E7] placeholder-[#E8E3C5]/40 focus:outline-none focus:border-[#A6C36F] transition-colors"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-[#E8E3C5]/70">
                  <strong className="text-blue-400">Note:</strong> Your password reset request will be sent to the treasurer for verification. You'll be able to login once approved.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-4 py-3 bg-black/40 border border-[#A6C36F]/30 text-[#E8E3C5] font-semibold rounded-lg hover:bg-black/60 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#A6C36F] text-black font-semibold rounded-lg hover:bg-[#E8E3C5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-[#A6C36F] hover:text-[#E8E3C5] transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;