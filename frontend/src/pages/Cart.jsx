import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';

const catEmoji = { Cola: '🥤', Orange: '🍊', Lemon: '🍋', Water: '💧', Other: '🍶' };

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, gstAmount, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!items.length) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
      <p className="text-gray-500 mb-8">Add some Campa Cola products to get started</p>
      <Link to="/shop" className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-base">
        <FiShoppingBag /> Browse Products
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cart ({items.length} items)</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item._id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                {catEmoji[item.category] || '🍶'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{item.category} · {item.size}</p>
                <p className="text-brand-teal font-bold mt-1">₹{item.price}</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <button onClick={() => updateQty(item._id, item.quantity - 1)}
                  className="px-2.5 py-2 hover:bg-gray-100 transition-colors text-gray-600">
                  <FiMinus size={13} />
                </button>
                <span className="px-3 py-2 text-sm font-bold min-w-10 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)}
                  className="px-2.5 py-2 hover:bg-gray-100 transition-colors text-gray-600">
                  <FiPlus size={13} />
                </button>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</div>
                <button onClick={() => removeItem(item._id)} className="text-red-400 hover:text-red-600 mt-1 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (18%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-3 border-t border-gray-100">
                <span>Total</span>
                <span className="text-brand-teal">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {user ? (
              <button onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                Proceed to Checkout <FiArrowRight />
              </button>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="btn-primary w-full py-3 text-base text-center block">
                  Login to Checkout
                </Link>
                <p className="text-xs text-gray-400 text-center">or <Link to="/register" className="text-brand-teal hover:underline">create an account</Link></p>
              </div>
            )}

            <Link to="/shop" className="block text-center text-sm text-gray-500 hover:text-brand-teal mt-3 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
