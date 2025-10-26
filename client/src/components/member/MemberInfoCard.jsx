import { User, Award, BookOpen, Calendar } from 'lucide-react';

/**
 * MemberInfoCard Component
 * Displays member profile information with badge
 * 
 * @param {Object} user - User object with name, usn, branch, year, profilePhoto
 */
const MemberInfoCard = ({ user }) => {
  // Get initials from name for fallback avatar
  const getInitials = (name) => {
    if (!name) return 'AU';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-blue-500">
      <div className="p-6 space-y-4">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <div className="relative">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-blue-100 shadow-md">
                <span className="text-3xl font-bold text-white">
                  {getInitials(user?.name)}
                </span>
              </div>
            )}
            
            {/* Active Status Indicator */}
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
          </div>
        </div>

        {/* Aurora Member Badge */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
            <Award className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              Aurora Member
            </span>
          </div>
        </div>

        {/* Member Details */}
        <div className="space-y-3 text-center">
          {/* Name */}
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {user?.name || 'Member'}
            </h3>
          </div>

          {/* USN */}
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <User className="w-4 h-4" />
            <p className="text-sm font-mono font-semibold">
              {user?.usn || 'N/A'}
            </p>
          </div>

          {/* Branch and Year */}
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">{user?.branch || 'N/A'}</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{user?.year || 'N/A'} Year</span>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Border */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberInfoCard;
