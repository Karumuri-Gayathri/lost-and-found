import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { lostService } from '../services/lostService';

const CATEGORIES = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Bags', 'Valuables', 'Other'];

const CreateLostItemPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editItemId = searchParams.get('edit');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    location: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Load existing item data if in edit mode
  useEffect(() => {
    if (editItemId) {
      setInitialLoading(true);
      const fetchItem = async () => {
        try {
          const response = await lostService.getById(editItemId);
          
          if (response.data.data) {
            const item = response.data.data;
            setFormData({
              title: item.title || '',
              description: item.description || '',
              category: item.category || CATEGORIES[0],
              location: item.location || '',
              date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
            });
            if (item.imageUrl) {
              setImagePreview(item.imageUrl);
            }
          }
        } catch (err) {
          setError('Failed to load item data');
          console.error(err);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchItem();
    }
  }, [editItemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('status', 'lost');
      
      // Append image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editItemId) {
        await lostService.update(editItemId, formDataToSend);
      } else {
        await lostService.create(formDataToSend);
      }

      alert(editItemId ? 'Lost item updated successfully!' : 'Lost item posted successfully!');
      navigate('/my-posts');
    } catch (err) {
      setError(err.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            {editItemId ? 'Update Lost Item' : 'Report Lost Item'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Item Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g., Blue Backpack"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                rows="4"
                placeholder="Describe the item in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Location Lost</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g., Library, Main Building"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date Lost</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-gray-600 text-sm mt-1">Max size: 5MB. Formats: JPEG, PNG, GIF, WebP</p>
              
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-gray-700 font-semibold mb-2">Image Preview</p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Saving...' : editItemId ? 'Update Lost Item' : 'Post Lost Item'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateLostItemPage;
