import { useEffect, useMemo, useState } from 'react';
import { User, Award, BookOpen, Calendar, Pencil, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

/**
 * MemberInfoCard — Bright Olive Elegance Theme (Lighter Interior)
 */
const MemberInfoCard = ({ user }) => {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    name: user?.name || '',
    usn: user?.usn || '',
    branch: user?.branch || '',
    year: normalizeYear(user?.year),
  });
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || '');
  const [photoFile, setPhotoFile] = useState(null);

  function normalizeYear(year) {
    if (!year) return '1st';
    const match = `${year}`.match(/\d/);
    return match ? `${match[0]}${match[0] === '1' ? 'st' : match[0] === '2' ? 'nd' : match[0] === '3' ? 'rd' : 'th'}` : '1st';
  }

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
  const memberSinceYear = useMemo(() => {
    const now = new Date();
    const academicBaseYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const yearMatch = `${user?.year || ''}`.match(/\d/);
    const yearIndex = yearMatch ? parseInt(yearMatch[0], 10) : 1;
    const clampedYearIndex = Math.min(Math.max(yearIndex, 1), 4);
    const yearsCompleted = clampedYearIndex - 1;
    return academicBaseYear - yearsCompleted;
  }, [user?.year]);

  useEffect(() => {
    if (!isEditing) {
      setFormState({
        name: user?.name || '',
        usn: user?.usn || '',
        branch: user?.branch || '',
        year: normalizeYear(user?.year),
      });
      setPhotoPreview(user?.profilePhoto || '');
      setPhotoFile(null);
    }
  }, [user, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormState({
      name: user?.name || '',
      usn: user?.usn || '',
      branch: user?.branch || '',
      year: normalizeYear(user?.year),
    });
    setPhotoPreview(user?.profilePhoto || '');
    setPhotoFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formState.name.trim());
    payload.append('usn', formState.usn.trim());
    payload.append('branch', formState.branch.trim());
    payload.append('year', formState.year);
    if (photoFile) {
      payload.append('profilePhoto', photoFile);
    }

    try {
      setSaving(true);
      const result = await updateProfile(payload);
      if (result?.success) {
        toast.success('Profile saved');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-[#A6C36F]/20 shadow-lg hover:shadow-[0_0_20px_rgba(166,195,111,0.15)] transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6 space-y-4">

        <div className="flex justify-between items-start">
          <div className="flex-1" />
          <button
            onClick={() => {
              if (isEditing) {
                resetForm();
              }
              setIsEditing((prev) => !prev);
            }}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-[#E8E3C5] bg-[#A6C36F]/15 border border-[#A6C36F]/30 rounded-lg hover:bg-[#A6C36F]/25 transition-colors"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>
        
        {/* Profile Photo */}
        <div className="flex justify-center">
          <div className="relative">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={user?.name}
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
        {!isEditing ? (
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
                <span className="text-sm font-medium">{user?.year ? `${user.year} Year` : 'N/A'}</span>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-1">Name</label>
                <input
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-[#A6C36F]/30 rounded-lg px-3 py-2 text-sm text-[#E8E3C5] focus:outline-none focus:border-[#A6C36F]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-1">USN</label>
                <input
                  name="usn"
                  value={formState.usn}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-[#A6C36F]/30 rounded-lg px-3 py-2 text-sm text-[#E8E3C5] focus:outline-none focus:border-[#A6C36F] uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-1">Branch</label>
                <input
                  name="branch"
                  value={formState.branch}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-[#A6C36F]/30 rounded-lg px-3 py-2 text-sm text-[#E8E3C5] focus:outline-none focus:border-[#A6C36F]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-1">Year</label>
                <select
                  name="year"
                  value={formState.year}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-[#A6C36F]/30 rounded-lg px-3 py-2 text-sm text-[#E8E3C5] focus:outline-none focus:border-[#A6C36F]"
                >
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-1">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-sm text-[#E8E3C5]/80"
                />
                {photoPreview && (
                  <div className="mt-2 flex justify-center">
                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border border-[#A6C36F]/30" />
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#A6C36F] text-black font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(166,195,111,0.35)] transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </form>
        )}

        {/* Decorative Bottom Border and Member Since */}
        <div className="pt-4 border-t border-[#A6C36F]/20">
          <p className="text-xs text-center text-[#E8E3C5]/60">
            Member since {memberSinceYear}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberInfoCard;