import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiEdit2, FiX } from 'react-icons/fi';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/users').then(({ data }) => setUsers(data));
  useEffect(() => { load(); }, []);

  const toggleActive = async (u) => {
    await api.put(`/users/${u._id}`, { isActive: !u.isActive });
    toast.success(u.isActive ? 'User deactivated' : 'User activated');
    load();
  };

  const setRole = async (u, role) => {
    await api.put(`/users/${u._id}`, { role });
    toast.success('Role updated');
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users <span className="text-base font-normal text-gray-400">({users.length})</span></h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Name</th>
              <th className="table-th">Email</th>
              <th className="table-th">Phone</th>
              <th className="table-th">Role</th>
              <th className="table-th">Status</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                <td className="table-td font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.name[0].toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="table-td text-gray-500">{u.email}</td>
                <td className="table-td text-gray-500">{u.phone || '—'}</td>
                <td className="table-td">
                  <select className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white" value={u.role}
                    onChange={e => setRole(u, e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="table-td">
                  <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="table-td">
                  <button onClick={() => toggleActive(u)}
                    className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${u.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [editStock, setEditStock] = useState(null);
  const [qty, setQty] = useState('');

  const load = () => api.get('/products/admin/all').then(({ data }) => setProducts(data));
  useEffect(() => { load(); }, []);

  const updateStock = async (operation) => {
    if (!qty) return;
    await api.patch(`/products/${editStock._id}/stock`, { quantity: Number(qty), operation });
    toast.success('Stock updated');
    setEditStock(null);
    setQty('');
    load();
  };

  const stockColor = (p) => {
    if (p.stock <= 0) return 'text-red-600 font-bold';
    if (p.stock <= p.reorderLevel) return 'text-yellow-600 font-semibold';
    return 'text-green-700 font-medium';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Product</th>
              <th className="table-th">Category</th>
              <th className="table-th">Current Stock</th>
              <th className="table-th">Reorder Level</th>
              <th className="table-th">Status</th>
              <th className="table-th">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                <td className="table-td font-medium text-gray-900">{p.name}</td>
                <td className="table-td text-gray-500">{p.category}</td>
                <td className={`table-td ${stockColor(p)}`}>{p.stock} units</td>
                <td className="table-td text-gray-500">{p.reorderLevel} units</td>
                <td className="table-td">
                  {p.stock <= 0 ? <span className="badge-red">Out of Stock</span>
                    : p.stock <= p.reorderLevel ? <span className="badge-yellow">Reorder Now</span>
                    : <span className="badge-green">OK</span>}
                </td>
                <td className="table-td">
                  <button onClick={() => { setEditStock(p); setQty(''); }}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <FiEdit2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Update Stock</h3>
              <button onClick={() => setEditStock(null)} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-1">{editStock.name}</p>
            <p className="text-xs text-gray-400 mb-4">Current stock: <strong>{editStock.stock}</strong> units</p>
            <input className="input mb-4" type="number" placeholder="Quantity" value={qty} onChange={e => setQty(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => updateStock('add')} className="btn-primary text-sm py-2">+ Add Stock</button>
              <button onClick={() => updateStock('set')} className="btn-secondary text-sm py-2">Set to Value</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
