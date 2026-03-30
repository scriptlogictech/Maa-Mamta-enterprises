import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash on Delivery', icon: '💵' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'card', label: 'Card', icon: '💳' },
];

export default function Checkout() {
  const { items, subtotal, gstAmount, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });

  const placeOrder = async () => {
    if (!address.street || !address.city || !address.pincode) {
      return toast.error('Please fill in delivery address');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
      });
      clearCart();
      toast.success(`Order placed! ${data.orderNumber}`);
      navigate(`/orders/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Address + Payment */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Delivery Address</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Street Address</label>
                <input className="input" placeholder="House no, Street, Area"
                  value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                  <input className="input" placeholder="City"
                    value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                  <input className="input" placeholder="State"
                    value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pincode</label>
                <input className="input" placeholder="6-digit pincode" maxLength={6}
                  value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === m.id ? 'border-brand-teal bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)} className="text-brand-teal" />
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-medium text-sm text-gray-900">{m.label}</span>
                  {paymentMethod === m.id && <FiCheck className="ml-auto text-brand-teal" size={16} />}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item._id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700 truncate mr-4">{item.name} × {item.quantity}</span>
                  <span className="font-medium flex-shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (18%)</span><span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-brand-teal">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={placeOrder} disabled={loading}
              className="btn-primary w-full py-3 text-base mt-5 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Placing Order...</>
              ) : (
                <><FiCheck size={18} /> Place Order — ₹{total.toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
