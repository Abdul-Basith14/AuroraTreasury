import { User, Award, BookOpen, Calendar } from 'lucide-react';

/**
 * MemberInfoCard — Bright Olive Elegance Theme (Lighter Interior)
 */
const MemberInfoCard = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return 'AU';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Determines the "Member Since" year.
   * Prioritizes the year from the createdAt timestamp.
   * If the createdAt year is the current year (which can be inaccurate for older members),
   * it calculates a more realistic start year based on the academic year (user.year).
   */
  const getMemberSinceYear = () => {
    const currentYear = new Date().getFullYear();
    const createdAtYear = new Date(user?.createdAt || Date.now()).getFullYear();

    // 1. If createdAt is provided and is NOT the current year, use it.
    if (user?.createdAt && createdAtYear < currentYear) {
      return createdAtYear;
    }

    // 2. Fallback: Calculate based on academic year ('1st Year', '3rd Year', etc.)
    const yearMap = {
      '1st Year': 0,
      '2nd Year': 1,
      '3rd Year': 2, // 2025 - 2 = 2023
      '4th Year': 3,
    };
    
    // Convert '3rd Year' to 3, then subtract 1 because 1st year means 0 years passed.
    const yearIndex = parseInt(user?.year) || 1; // Default to 1st year (index 1)
    
    // Calculate years passed (e.g., 3rd year means 2 years have passed)
    const yearsPassed = yearIndex > 0 ? yearIndex - 1 : 0; 
    
    // Calculate assumed joining year
    return currentYear - yearsPassed;
  };

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-[#A6C36F]/20 shadow-lg hover:shadow-[0_0_20px_rgba(166,195,111,0.15)] transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6 space-y-4">
        
        {/* Profile Photo */}
        <div className="flex justify-center">
          <div className="relative">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#A6C36F]/30"
              />
            ) : (
              // Initial Display
              <div className="w-24 h-24 rounded-full bg-black/40 flex items-center justify-center border-4 border-[#A6C36F]/30 shadow-inner">
                <span className="text-3xl font-bold text-[#A6C36F]">
                  {getInitials(user?.name)}
                </span>
              </div>
            )}
            {/* Status Indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#A6C36F] rounded-full border-4 border-black"></div>
          </div>
        </div>

        {/* Aurora Member Badge */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 bg-[#A6C36F]/10 px-4 py-2 rounded-full border border-[#A6C36F]/30">
            <Award className="w-4 h-4 text-[#A6C36F]" />
            <span className="text-sm font-semibold text-[#E8E3C5]">Aurora Member</span>
          </div>
        </div>

        {/* Member Details */}
        <div className="space-y-3 text-center">
          <h3 className="text-xl font-bold text-[#F5F3E7]">
            {user?.name || 'Member'}
          </h3>

          <div className="flex items-center justify-center space-x-2 text-[#E8E3C5]/80">
            <User className="w-4 h-4 text-[#A6C36F]" />
            <p className="text-sm font-mono font-semibold">{user?.usn || 'N/A'}</p>
          </div>

          <div className="flex items-center justify-center space-x-4 text-[#E8E3C5]/80">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4 text-[#A6C36F]" />
              <span className="text-sm font-medium">{user?.branch || 'N/A'}</span>
            </div>
            <span className="text-[#A6C36F]/40">•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-[#A6C36F]" />
              <span className="text-sm font-medium">{user?.year || 'N/A'} Year</span>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Border and Member Since */}
        <div className="pt-4 border-t border-[#A6C36F]/20">
          <p className="text-xs text-center text-[#E8E3C5]/60">
            Member since {getMemberSinceYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberInfoCard;