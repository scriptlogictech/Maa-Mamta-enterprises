import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';

const CATEGORIES = ['All', 'Cola', 'Orange', 'Lemon', 'Water', 'Other'];

// ✅ CATEGORY IMAGES
const catImages = {
  Cola: '/images/cola.webp',
  Orange: '/images/orange.webp',
  Lemon: '/images/lemon.webp',
  Water: '/images/water.jpg',
  Other: '/images/other.jpg'
};

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = new URLSearchParams({ limit: 50 });

      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setLoading(false);
    };

    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products available</p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              category === c
                ? 'bg-brand-teal text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-teal hover:text-brand-teal'
            }`}
          >
            {c !== 'All' && (
              <img
                src={catImages[c]}
                alt={c}
                className="w-4 h-4 object-contain"
              />
            )}
            {c}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="bg-gray-200 rounded-xl h-24 mb-3" />
              <div className="bg-gray-200 rounded h-4 mb-2" />
              <div className="bg-gray-200 rounded h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

          {/* PRODUCTS */}
          {products.map(p => (
            <div
              key={p._id}
              className="card p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group"
            >
              <Link to={`/shop/${p._id}`}>

                {/* IMAGE */}
                <div className="flex justify-center py-4 mb-3 bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors">
                  <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition">
                    <img
                      src={catImages[p.category] || catImages['Other']}
                      alt={p.category}
                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                </div>

                {/* NAME */}
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                  {p.name}
                </h3>

                {/* PRICE */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-brand-teal">₹{p.price}</span>
                  {p.mrp > p.price && (
                    <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                  )}
                </div>
              </Link>

              {/* ADD TO CART */}
              <button
                onClick={() => addItem(p)}
                className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <FiShoppingCart size={13} /> Add to Cart
              </button>

              {/* STOCK INFO */}
              {p.stock <= p.reorderLevel && p.stock > 0 && (
                <p className="text-xs text-yellow-600 text-center mt-1.5">
                  Only {p.stock} left
                </p>
              )}

              {p.stock === 0 && (
                <p className="text-xs text-red-500 text-center mt-1.5 font-medium">
                  Out of stock
                </p>
              )}
            </div>
          ))}

          {/* EMPTY */}
          {!products.length && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-medium">No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}