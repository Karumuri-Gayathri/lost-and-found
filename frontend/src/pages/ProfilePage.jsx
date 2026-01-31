import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useNotifications(true);
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>
          
          <div className="space-y-6">
            {/* User Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Name</label>
                  <p className="text-gray-800 bg-gray-50 px-4 py-2 rounded">{user?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Email</label>
                  <p className="text-gray-800 bg-gray-50 px-4 py-2 rounded">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Role</label>
                  <p className="text-gray-800 bg-gray-50 px-4 py-2 rounded capitalize">
                    {user?.role || 'User'}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Member Since</label>
                  <p className="text-gray-800 bg-gray-50 px-4 py-2 rounded">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/my-posts')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  View My Posts
                </button>
                <button
                  onClick={() => navigate('/create-lost')}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
                >
                  Post Lost Item
                </button>
                <button
                  onClick={() => navigate('/create-found')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Post Found Item
                </button>
              </div>
            </div>

            {/* Admin Access */}
            {user?.role === 'admin' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-3 text-blue-800">Admin Access</h2>
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 font-semibold"
                >
                  Go to Admin Dashboard
                </button>
              </div>
            )}

            {/* Notifications Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-blue-800">Notifications</h2>
                  <p className="text-blue-700 text-sm mt-1">
                    You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/notifications')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
