import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { adminService } from '../services/adminService';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsResponse = await adminService.getStats();
        console.log('Stats Response:', statsResponse);
        // Stats returns { data: { users: {...}, items: {...} } }
        setStats(statsResponse.data?.data || statsResponse.data);

        const usersResponse = await adminService.getUsers(1, 50);
        console.log('Users Response:', usersResponse);
        // Users returns { data: [...] }
        setUsers(Array.isArray(usersResponse.data?.data) ? usersResponse.data.data : (Array.isArray(usersResponse.data) ? usersResponse.data : []));

        const itemsResponse = await adminService.getAllItems(1, 50);
        console.log('Items Response:', itemsResponse);
        // Items returns { data: [...] }
        setItems(Array.isArray(itemsResponse.data?.data) ? itemsResponse.data.data : (Array.isArray(itemsResponse.data) ? itemsResponse.data : []));
      } catch (error) {
        console.error('Error fetching admin data:', error);
        alert('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user?')) return;

    try {
      await adminService.blockUser(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: true } : u));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          users: {
            ...stats.users,
            active: stats.users.active - 1,
            blocked: stats.users.blocked + 1
          }
        });
      }
      
      alert('User blocked successfully');
    } catch (error) {
      alert('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminService.unblockUser(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: false } : u));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          users: {
            ...stats.users,
            active: stats.users.active + 1,
            blocked: stats.users.blocked - 1
          }
        });
      }
      
      alert('User unblocked successfully');
    } catch (error) {
      alert('Failed to unblock user');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await adminService.deletePost(itemId);
      setItems(items.filter(i => i._id !== itemId));
      alert('Item deleted successfully');
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleApproveItem = async (itemId) => {
    try {
      await adminService.approveItem(itemId);
      const updatedItems = items.map(i => i._id === itemId ? { ...i, isApproved: true } : i);
      setItems([...updatedItems]);
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          items: {
            ...stats.items,
            pendingApprovals: stats.items.pendingApprovals - 1,
            approved: stats.items.approved + 1
          }
        });
      }
      
      alert('Item approved successfully');
    } catch (error) {
      alert('Failed to approve item');
    }
  };

  const handleRejectItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to reject this item?')) return;

    try {
      await adminService.rejectItem(itemId);
      // Remove the rejected item from the list
      setItems(items.filter(i => i._id !== itemId));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          items: {
            ...stats.items,
            pendingApprovals: stats.items.pendingApprovals - 1
          }
        });
      }
      
      alert('Item rejected successfully');
    } catch (error) {
      alert('Failed to reject item');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm font-semibold">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.users?.total || 0}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm font-semibold">Lost Items</p>
              <p className="text-3xl font-bold text-green-600">{stats.items?.lost || 0}</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm font-semibold">Found Items</p>
              <p className="text-3xl font-bold text-purple-600">{stats.items?.found || 0}</p>
            </div>
            <div className="bg-orange-100 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm font-semibold">Pending Approvals</p>
              <p className="text-3xl font-bold text-orange-600">{stats.items?.pendingApprovals || 0}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-300">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold border-b-2 ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-6 py-3 font-semibold border-b-2 ${
                activeTab === 'items'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-400'
              }`}
            >
              Items ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-semibold border-b-2 ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-400'
              }`}
            >
              Pending Approvals ({items.filter(i => !i.isApproved).length})
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* User Filter Buttons */}
            <div className="flex gap-4 border-b border-gray-300 pb-4">
              <button
                onClick={() => setUserFilter('all')}
                className={`px-4 py-2 font-semibold rounded ${
                  userFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setUserFilter('active')}
                className={`px-4 py-2 font-semibold rounded ${
                  userFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active ({users.filter(u => !u.isBlocked).length})
              </button>
              <button
                onClick={() => setUserFilter('blocked')}
                className={`px-4 py-2 font-semibold rounded ${
                  userFilter === 'blocked'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Blocked ({users.filter(u => u.isBlocked).length})
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(userFilter === 'all' ? users : userFilter === 'active' ? users.filter(u => !u.isBlocked) : users.filter(u => u.isBlocked)).map((user) => (
                    <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3">{user.name}</td>
                      <td className="px-6 py-3">{user.email}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {user.isBlocked ? (
                          <button
                            onClick={() => handleUnblockUser(user._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-semibold"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(user._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold"
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(userFilter === 'all' ? users : userFilter === 'active' ? users.filter(u => !u.isBlocked) : users.filter(u => u.isBlocked)).length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Posted by</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3">{item.title}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {item.status === 'lost' ? 'Lost' : 'Found'}
                      </span>
                    </td>
                    <td className="px-6 py-3">{item.category}</td>
                    <td className="px-6 py-3">{item.postedBy?.name || 'Unknown'}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Posted by</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.filter(i => !i.isApproved).map((item) => (
                  <tr key={item._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3">{item.title}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {item.status === 'lost' ? 'Lost' : 'Found'}
                      </span>
                    </td>
                    <td className="px-6 py-3">{item.category}</td>
                    <td className="px-6 py-3">{item.postedBy?.name || 'Unknown'}</td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => handleApproveItem(item._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectItem(item._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.filter(i => !i.isApproved).length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No pending approvals
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
