import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center py-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Campus Lost & Found Portal</h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto px-4">Help your campus community find lost items and reunite them with their owners</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link
              to="/lost"
              className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Browse Lost Items
            </Link>
            <Link
              to="/found"
              className="w-full sm:w-auto bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-lg"
            >
              Browse Found Items
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Easy to Use</h3>
            <p className="text-gray-600">Post and search for lost or found items with just a few clicks</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Search & Filter</h3>
            <p className="text-gray-600">Find items by category, location, and date to recover your belongings</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Secure Verification</h3>
            <p className="text-gray-600">Verify claims through our secure verification system</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-blue-600 mb-3">1</div>
              <h4 className="font-semibold text-gray-800 mb-2 text-lg">Register</h4>
              <p className="text-gray-600 text-sm">Create an account to post and claim items</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-blue-600 mb-3">2</div>
              <h4 className="font-semibold text-gray-800 mb-2 text-lg">Post</h4>
              <p className="text-gray-600 text-sm">Report lost or found items with details</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-blue-600 mb-3">3</div>
              <h4 className="font-semibold text-gray-800 mb-2 text-lg">Search</h4>
              <p className="text-gray-600 text-sm">Browse and search for matching items</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-blue-600 mb-3">4</div>
              <h4 className="font-semibold text-gray-800 mb-2 text-lg">Connect</h4>
              <p className="text-gray-600 text-sm">Claim items and verify ownership</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Lost Something?</h2>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto px-4">Post about it now and let others help you find it</p>
          <Link
            to="/create-lost"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Report Lost Item
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
