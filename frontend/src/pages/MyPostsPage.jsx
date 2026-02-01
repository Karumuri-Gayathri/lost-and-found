import { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import ItemCard from '../components/ItemCard';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { lostService } from '../services/lostService';

const MyPostsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      try {
        const response = await lostService.getUserDashboard();
        setItems(response.data.data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await lostService.delete(itemId);
      setItems(items.filter(item => item._id !== itemId));
      alert('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleEdit = (itemId) => {
    const item = items.find(i => i._id === itemId);
    if (item && item.status === 'lost') {
      navigate(`/create-lost?edit=${itemId}`);
    } else if (item && item.status === 'found') {
      navigate(`/create-found?edit=${itemId}`);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">My Posts</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/create-lost')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
            >
              Post Lost Item
            </button>
            <button
              onClick={() => navigate('/create-found')}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
            >
              Post Found Item
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">You haven't posted anything yet</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/create-lost')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Post Lost Item
              </button>
              <button
                onClick={() => navigate('/create-found')}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Post Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} onDelete={handleDelete} onEdit={handleEdit} canDelete={true} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyPostsPage;
