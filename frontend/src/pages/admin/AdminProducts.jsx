import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const CATEGORIES = ['Cola', 'Orange', 'Lemon', 'Independence', 'Sure', 'SunCrush', 'Raskik-Mango', 'Raskik Nimbu Pani', 'Other'];

const SIZES = [
  '125 ml',
  '150 ml',
  '180 ml',
  '185 ml',
  '200 ml',
  '250 ml',
  '330 ml',
  '500 ml',
  '750 ml',
  '1 l',
  '1.5 l',
  '2.25 l'
];

const emptyForm = {
  name: '',
  category: 'Cola',
  size: '500 ml', // ✅ FIXED (was 500ml)
  price: '',
  mrp: '',
  stock: '',
  reorderLevel: 50,
  gstPercent: 18,
  description: '',
  isActive: true
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/products/admin/all').then(({ data }) => setProducts(data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { 
    setForm(emptyForm); 
    setEditing(null); 
    setShowModal(true); 
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      category: p.category,
      size: p.size,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      reorderLevel: p.reorderLevel,
      gstPercent: p.gstPercent,
      description: p.description || '',
      isActive: p.isActive
    });
    setEditing(p._id);
    setShowModal(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      if (editing) await api.put(`/products/${editing}`, form);
      else await api.post('/products', form);

      toast.success(editing ? 'Product updated!' : 'Product created!');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setLoading(false);
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deactivated');
    load();
  };

  const stockBadge = (p) => {
    if (p.stock <= 0) return <span className="badge-red">Out of Stock</span>;
    if (p.stock <= p.reorderLevel) return <span className="badge-yellow">Low Stock</span>;
    return <span className="badge-green">In Stock</span>;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Product</th>
              <th className="table-th">Category</th>
              <th className="table-th">Price / MRP</th>
              <th className="table-th">Stock</th>
              <th className="table-th">Status</th>
              <th className="table-th">Active</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                <td className="table-td font-medium text-gray-900">{p.name}</td>
                <td className="table-td text-gray-500">{p.category} · {p.size}</td>
                <td className="table-td">
                  <span className="font-semibold">₹{p.price}</span>
                  <span className="text-gray-400 text-xs ml-1">/ ₹{p.mrp}</span>
                </td>
                <td className="table-td font-medium">{p.stock}</td>
                <td className="table-td">{stockBadge(p)}</td>
                <td className="table-td">
                  <span className={p.isActive ? 'badge-green' : 'badge-red'}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="table-td">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-1">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => deactivate(p._id)} className="p-1.5 text-red-400 hover:bg-teal-50 rounded-lg transition-colors">
                    <FiTrash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ FULL MODAL KEPT SAME */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Size</label>
                <select className="input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Selling Price (₹)</label>
                <input className="input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">MRP (₹)</label>
                <input className="input" type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Current Stock</label>
                <input className="input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reorder Level</label>
                <input className="input" type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                <label>Active</label>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={save} className="btn-primary flex-1">
                {editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}