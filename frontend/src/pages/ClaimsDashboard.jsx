import { useState } from 'react';
import Layout from '../components/Layout';
import MyClaimsPanel from '../components/MyClaimsPanel';
import ClaimsReceivedPanel from '../components/ClaimsReceivedPanel';
import { claimService } from '../services/claimService';

const ClaimsDashboard = () => {
  const [activeTab, setActiveTab] = useState('my-claims');
  const [myItems, setMyItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  // Load user's items when switching to "Claims Received" tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'claims-received' && myItems.length === 0) {
      fetchMyItems();
    }
  };

  const fetchMyItems = async () => {
    try {
      setLoadingItems(true);
      // Get user's posted items (found items the user has posted)
      const response = await claimService.getMyItems();
      if (response?.data?.data) {
        const userItems = response.data.data.filter(item => item.type === 'found');
        setMyItems(userItems);
        if (userItems.length > 0) {
          setSelectedItemId(userItems[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Claims Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('my-claims')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'my-claims'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            My Claims
          </button>
          <button
            onClick={() => handleTabChange('claims-received')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'claims-received'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Claims Received
          </button>
        </div>

        {/* My Claims Tab */}
        {activeTab === 'my-claims' && (
          <div className="space-y-4">
            <p className="text-gray-600">View all the claims you've submitted on found items.</p>
            <MyClaimsPanel />
          </div>
        )}

        {/* Claims Received Tab */}
        {activeTab === 'claims-received' && (
          <div className="space-y-6">
            <p className="text-gray-600">Review claims from people who believe they own your found items.</p>

            {loadingItems && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loadingItems && myItems.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">You haven't posted any found items yet.</p>
              </div>
            )}

            {!loadingItems && myItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Item Selection */}
                <div className="md:col-span-1">
                  <h3 className="font-bold mb-3 text-gray-700">Your Found Items</h3>
                  <div className="space-y-2">
                    {myItems.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => setSelectedItemId(item._id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition ${
                          selectedItemId === item._id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          {item.category}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Claims for Selected Item */}
                <div className="md:col-span-3">
                  {selectedItemId ? (
                    <>
                      <h3 className="font-bold mb-3 text-gray-700">
                        Claims for: {myItems.find(i => i._id === selectedItemId)?.title}
                      </h3>
                      <ClaimsReceivedPanel itemId={selectedItemId} />
                    </>
                  ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                      <p className="text-gray-500">Select an item to view claims</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClaimsDashboard;
