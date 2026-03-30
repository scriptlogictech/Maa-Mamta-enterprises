import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { format } from 'date-fns';
import { FiPackage, FiArrowLeft } from 'react-icons/fi';

const statusColor = {
  placed: 'badge-blue', confirmed: 'badge-blue', processing: 'badge-yellow',
  shipped: 'badge-yellow', delivered: 'badge-green', cancelled: 'badge-red',
};

const statusStep = { placed: 1, confirmed: 2, processing: 3, shipped: 4, delivered: 5, cancelled: 0 };
const STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => { setOrders(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-24" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
      {!orders.length ? (
        <div className="text-center py-20">
          <FiPackage className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <Link to="/shop" className="btn-primary inline-block mt-4 px-8 py-2.5">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <Link key={o._id} to={`/orders/${o._id}`}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-all block">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🥤
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-brand-teal">{o.orderNumber}</span>
                  <span className={statusColor[o.orderStatus] || 'badge-blue'}>{o.orderStatus}</span>
                </div>
                <p className="text-sm text-gray-500">{o.items?.length} items · {format(new Date(o.createdAt), 'dd MMM yyyy')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-gray-900 text-lg">₹{o.totalAmount?.toFixed(0)}</div>
                <div className="text-xs text-gray-400 capitalize">{o.paymentMethod}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => { setOrder(data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const step = statusStep[order.orderStatus] || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-teal mb-6 transition-colors">
        <FiArrowLeft size={16} /> My Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm')}</p>
        </div>
        <span className={statusColor[order.orderStatus] || 'badge-blue'}>{order.orderStatus}</span>
      </div>

      {/* Tracker */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Order Tracking</h2>
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                  step > i ? 'bg-brand-teal text-white' : step === i ? 'bg-red-100 text-brand-teal border-2 border-brand-teal' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span className="text-xs text-gray-500 capitalize text-center leading-tight">{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-full -z-10 transition-all ${step > i ? 'bg-brand-teal' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price} × {item.quantity}</p>
              </div>
              <span className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{order.subtotal?.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-500"><span>GST</span><span>₹{order.gstAmount?.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-brand-teal">₹{order.totalAmount?.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Address & Payment */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivery Address</h3>
          {order.shippingAddress?.street ? (
            <p className="text-sm text-gray-700 leading-relaxed">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          ) : <p className="text-sm text-gray-400">POS Order</p>}
        </div>
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment</h3>
          <p className="text-sm font-medium capitalize">{order.paymentMethod}</p>
          <span className={`mt-1 inline-block ${order.paymentStatus === 'paid' ? 'badge-green' : order.paymentStatus === 'failed' ? 'badge-red' : 'badge-yellow'}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Orders;
