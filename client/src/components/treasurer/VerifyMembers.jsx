import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShieldCheck, User, Calendar, Award } from 'lucide-react';
import { getUnverifiedUsers, verifyUser } from '../../utils/treasurerAPI';
import toast from 'react-hot-toast';

const VerifyMembers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    fetchUnverifiedUsers();
  }, []);

  const fetchUnverifiedUsers = async () => {
    setLoading(true);
    try {
      const response = await getUnverifiedUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    setVerifyingId(userId);
    try {
      const response = await verifyUser(userId);
      if (response.success) {
        toast.success(`Member verified successfully`);
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A6C36F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F3E7]">Member Verification</h2>
          <p className="text-[#E8E3C5]/60 mt-1">Review and approve new member signups</p>
        </div>
        <div className="px-4 py-2 bg-[#A6C36F]/10 rounded-full border border-[#A6C36F]/20 text-[#A6C36F] text-sm font-medium">
          Pending Request: {users.length}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 bg-black/20 rounded-2xl border border-[#3A3E36]/30">
          <ShieldCheck className="w-16 h-16 text-[#A6C36F]/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#F5F3E7]/80">All caught up!</h3>
          <p className="text-[#E8E3C5]/50 mt-2">No new members pending verification.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-black/40 backdrop-blur-sm border border-[#3A3E36]/50 rounded-xl overflow-hidden hover:border-[#A6C36F]/30 transition-all duration-300 relative group"
              >
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#A6C36F]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#A6C36F]/20 flex items-center justify-center text-[#A6C36F]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#F5F3E7] truncate max-w-[150px]">{user.name}</h3>
                        <p className="text-xs text-[#E8E3C5]/50">{user.usn}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-[#A6C36F]/10 rounded text-xs text-[#A6C36F] border border-[#A6C36F]/20">
                      New
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-[#E8E3C5]/70">
                      <Award className="w-4 h-4 mr-2 text-[#A6C36F]/60" />
                      <span>{user.branch}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#E8E3C5]/70">
                      <Calendar className="w-4 h-4 mr-2 text-[#A6C36F]/60" />
                      <span>{user.year} Year</span>
                    </div>
                    <div className="text-xs text-[#E8E3C5]/40 mt-2 bg-black/20 p-2 rounded border border-[#3A3E36]/30 truncate">
                      {user.email}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVerify(user._id)}
                      disabled={verifyingId === user._id}
                      className="flex-1 bg-[#A6C36F] hover:bg-[#8FAE5D] text-black font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {verifyingId === user._id ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          Verify
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default VerifyMembers;
