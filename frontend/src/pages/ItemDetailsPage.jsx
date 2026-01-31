import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ClaimForm from '../components/ClaimForm';
import { lostService } from '../services/lostService';
import { foundService } from '../services/foundService';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        // Fetch the item - both services call the same backend endpoint
        const response = await lostService.getById(id);
        
        // Axios wraps the response in a data property
        // Backend returns: { success: true, data: { ...item } }
        // So we need response.data.data to get the actual item
        const itemData = response.data.data || response.data;
        
        // Log for debugging
        console.log('Item data from backend:', itemData);
        console.log('Item type:', itemData.type);
        
        setItem({ 
          ...itemData, 
          type: itemData.type || 'lost' // Use type field from backend, default to 'lost'
        });
      } catch (error) {
        console.error('Error fetching item:', error);
        alert('Item not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleClaimSuccess = () => {
    setClaimSubmitted(true);
    setShowClaimForm(false);
    
    // Show success message for 3 seconds, then hide
    setTimeout(() => {
      setClaimSubmitted(false);
    }, 3000);
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

  if (!item) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4 font-semibold"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={`grid grid-cols-1 ${item.imageUrl ? 'md:grid-cols-2' : ''} gap-8 p-8`}>
            {/* Image - Only render if imageUrl exists */}
            {item.imageUrl && (
              <div>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Details */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{item.title}</h1>
                <span className={`px-4 py-2 rounded-full text-white font-semibold ${item.type === 'lost' ? 'bg-red-600' : 'bg-green-600'}`}>
                  {item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Description</h3>
                  <p className="text-gray-800">{item.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Category</h3>
                    <p className="text-gray-800">{item.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Location</h3>
                    <p className="text-gray-800">{item.location}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    {item.type === 'lost' ? 'Date Lost' : 'Date Found'}
                  </h3>
                  <p className="text-gray-800">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>

                {item.postedBy && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Posted by</h3>
                    <p className="text-gray-800">{item.postedBy.name || 'Anonymous'}</p>
                  </div>
                )}
              </div>

              {/* Claim Button - Only for FOUND items and if not resolved */}
              {item.type === 'found' && item.status !== 'resolved' && (
                <>
                  {!showClaimForm ? (
                    <button
                      onClick={() => setShowClaimForm(true)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Claim This Item
                    </button>
                  ) : (
                    <div className="mt-4">
                      <ClaimForm
                        itemId={id}
                        onSuccess={handleClaimSuccess}
                        onCancel={() => setShowClaimForm(false)}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Item Resolved Message */}
              {item.status === 'resolved' && (
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg text-center">
                  <p className="text-green-800 font-semibold">✓ This item has been claimed and resolved.</p>
                </div>
              )}

              {/* Claim Success Message */}
              {claimSubmitted && (
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg text-center animate-pulse">
                  <p className="text-green-800 font-semibold">✓ Claim submitted successfully!</p>
                  <p className="text-green-700 text-sm">The item owner will review your proof.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ItemDetailsPage;
