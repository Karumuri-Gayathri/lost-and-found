import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Pagination from '../components/Pagination';
import { foundService } from '../services/foundService';

const CATEGORIES = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Bags', 'Valuables', 'Other'];

const FoundItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        console.log('Fetching found items from /api/items/found');
        const response = await foundService.getAll(page, 10);
        console.log('Response:', response.data);
        console.log('Items received:', response.data.data?.length || 0);
        setItems(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching items:', error);
        console.error('Error response:', error.response?.data);
        alert('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setPage(1);
    setLoading(true);
    try {
      if (query.length === 0) {
        // Fetch all items if search is empty
        const response = await foundService.getAll(1, 10);
        setItems(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        // Search for items
        const response = await foundService.search(query);
        setItems(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error searching items:', error);
      alert('Failed to search items');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (cat) => {
    setCategory(cat);
    setPage(1);
    setLoading(true);
    try {
      const response = await foundService.getAll(1, 10);
      let filteredItems = response.data.data || [];
      if (cat) {
        filteredItems = filteredItems.filter(item => item.category === cat);
      }
      setItems(filteredItems);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error filtering items:', error);
      alert('Failed to filter items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">Found Items</h1>
        <p className="text-gray-600">Browse items that have been found</p>

        <SearchBar onSearch={handleSearch} placeholder="Search found items..." />
        <FilterDropdown categories={CATEGORIES} selectedCategory={category} onFilter={handleFilter} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No found items yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default FoundItemsPage;
