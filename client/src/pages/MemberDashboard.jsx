import { useAuth } from '../context/AuthContext';
import { LogOut, User, Wallet } from 'lucide-react';

const MemberDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Member Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-600">USN: {user?.usn}</p>
                <p className="text-sm text-gray-600">
                  {user?.year} Year • {user?.branch}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-1">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Total Paid</span>
              </div>
              <p className="text-3xl font-bold text-green-600">₹{user?.totalPaid || 0}</p>
            </div>
          </div>
        </div>

        {/* Placeholder for upcoming features */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <p className="text-sm text-gray-700">Monthly Group Fund Payment Tracking</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <p className="text-sm text-gray-700">Reimbursement Requests</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <p className="text-sm text-gray-700">Payment History & Analytics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;
