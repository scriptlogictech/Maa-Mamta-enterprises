import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiEye, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUS = ['pending', 'paid', 'failed'];

const statusColor = {
  placed: 'badge-blue', confirmed: 'badge-blue', processing: 'badge-yellow',
  shipped: 'badge-yellow', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const params = new URLSearchParams({ page, limit: 20 });
    if (filterStatus) params.append('status', filterStatus);
    if (filterSource) params.append('source', filterSource);
    const { data } = await api.get(`/orders?${params}`);
    setOrders(data.orders);
    setTotal(data.total);
    setPages(data.pages);
  };

  useEffect(() => { load(); }, [page, filterStatus, filterSource]);

  const updateStatus = async (id, status, paymentStatus) => {
    try {
      await api.put(`/orders/${id}/status`, { status, paymentStatus });
      toast.success('Order updated');
      load();
      setSelected(prev => prev ? { ...prev, orderStatus: status || prev.orderStatus, paymentStatus: paymentStatus || prev.paymentStatus } : null);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders <span className="text-base font-normal text-gray-400">({total})</span></h1>
        <div className="flex gap-2">
          <select className="input w-auto text-sm" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="">All Sources</option>
            <option value="online">Online</option>
            <option value="pos">POS</option>
          </select>
          <select className="input w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Order #</th>
              <th className="table-th">Customer</th>
              <th className="table-th">Source</th>
              <th className="table-th">Amount</th>
              <th className="table-th">Payment</th>
              <th className="table-th">Status</th>
              <th className="table-th">Date</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(o => (
              <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                <td className="table-td font-semibold text-brand-teal">{o.orderNumber}</td>
                <td className="table-td">{o.user?.name || 'N/A'}</td>
                <td className="table-td">
                  <span className={o.source === 'pos' ? 'badge-blue' : 'badge-green'}>{o.source?.toUpperCase()}</span>
                </td>
                <td className="table-td font-semibold">₹{o.totalAmount?.toFixed(0)}</td>
                <td className="table-td">
                  <span className={o.paymentStatus === 'paid' ? 'badge-green' : o.paymentStatus === 'failed' ? 'badge-red' : 'badge-yellow'}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="table-td">
                  <span className={statusColor[o.orderStatus] || 'badge-blue'}>{o.orderStatus}</span>
                </td>
                <td className="table-td text-gray-400 text-xs">{format(new Date(o.createdAt), 'dd MMM yy')}</td>
                <td className="table-td">
                  <button onClick={() => setSelected(o)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <FiEye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Prev</button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold">{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{selected.user?.name}</span></div>
                <div><span className="text-gray-500">Source:</span> <span className="font-medium uppercase">{selected.source}</span></div>
                <div><span className="text-gray-500">Payment:</span> <span className="font-medium capitalize">{selected.paymentMethod}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{format(new Date(selected.createdAt), 'dd MMM yyyy')}</span></div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h3>
                <div className="space-y-1">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{selected.subtotal?.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>GST</span><span>₹{selected.gstAmount?.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-brand-teal">₹{selected.totalAmount?.toFixed(2)}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Order Status</label>
                  <select className="input text-sm" value={selected.orderStatus}
                    onChange={e => updateStatus(selected._id, e.target.value, null)}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Status</label>
                  <select className="input text-sm" value={selected.paymentStatus}
                    onChange={e => updateStatus(selected._id, null, e.target.value)}>
                    {PAYMENT_STATUS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
