import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Pagination from '../components/Pagination';
import { lostService } from '../services/lostService';

const CATEGORIES = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Bags', 'Valuables', 'Other'];

const LostItemsPage = () => {
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
        console.log('Fetching lost items from /api/items/lost');
        const response = await lostService.getAll(page, 10);
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
        const response = await lostService.getAll(1, 10);
        setItems(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        // Search for items
        const response = await lostService.search(query);
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
      const response = await lostService.getAll(1, 10);
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
        <h1 className="text-4xl font-bold text-gray-800">Lost Items</h1>
        <p className="text-gray-600">Help others find their lost items</p>

        <SearchBar onSearch={handleSearch} placeholder="Search lost items..." />
        <FilterDropdown categories={CATEGORIES} selectedCategory={category} onFilter={handleFilter} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No lost items found</p>
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

export default LostItemsPage;
