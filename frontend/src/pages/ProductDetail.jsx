import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';

const catEmoji = { Cola: '🥤', Orange: '🍊', Lemon: '🍋', Water: '💧', Other: '🍶' };

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => { setProduct(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-400">Product not found</div>;

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-teal mb-8 transition-colors">
        <FiArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl flex items-center justify-center p-12 min-h-64">
          <span className="text-[120px]">{catEmoji[product.category] || '🍶'}</span>
        </div>

        {/* Details */}
        <div>
          <span className="badge-blue mb-3 inline-block">{product.category} · {product.size}</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-extrabold text-brand-teal">₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
                <span className="badge-green">{discount}% off</span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{product.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-500 text-xs mb-1">GST</div>
              <div className="font-semibold">{product.gstPercent}%</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-500 text-xs mb-1">Stock</div>
              <div className={`font-semibold ${product.stock === 0 ? 'text-red-600' : product.stock < 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
              </div>
            </div>
          </div>

          {product.stock > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600">
                    <FiMinus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-bold min-w-12 text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600">
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
              <button onClick={() => addItem(product, qty)}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                <FiShoppingCart size={18} /> Add {qty} to Cart — ₹{product.price * qty}
              </button>
            </div>
          ) : (
            <div className="bg-red-50 text-red-600 rounded-xl p-4 text-center font-medium">
              Currently out of stock
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
