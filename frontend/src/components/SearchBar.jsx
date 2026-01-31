const SearchBar = ({ onSearch, placeholder = "Search items..." }) => {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};

export default SearchBar;
