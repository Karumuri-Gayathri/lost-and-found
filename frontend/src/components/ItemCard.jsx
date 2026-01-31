import { Link } from 'react-router-dom';

const ItemCard = ({ item, onDelete, canDelete = false, onEdit = null }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${item.status === 'resolved' ? 'opacity-50' : ''}`}>
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
          <div className="flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
            </span>
            {item.status === 'resolved' && (
              <span className="px-3 py-1 rounded-full text-sm bg-gray-500 text-white font-semibold">
                ✓ Claimed
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-2 text-sm line-clamp-2">{item.description}</p>
        <div className="space-y-1 text-sm text-gray-700 mb-3">
          <p><span className="font-semibold">Category:</span> {item.category}</p>
          <p><span className="font-semibold">Location:</span> {item.location}</p>
          <p><span className="font-semibold">Date:</span> {new Date(item.date).toLocaleDateString()}</p>
        </div>
        {item.postedBy && (
          <p className="text-gray-500 text-xs mb-3">Posted by: {item.postedBy.name || 'Anonymous'}</p>
        )}
        <div className="flex gap-2">
          <Link
            to={`/item/${item._id}`}
            className="flex-1 bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 text-sm"
          >
            View Details
          </Link>
          {canDelete && onEdit && (
            <button
              onClick={() => onEdit(item._id)}
              className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 text-sm"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(item._id)}
              className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
