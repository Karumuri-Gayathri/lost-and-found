const FilterDropdown = ({ categories, selectedCategory, onFilter }) => {
  return (
    <div className="mb-6">
      <select
        value={selectedCategory}
        onChange={(e) => onFilter(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
