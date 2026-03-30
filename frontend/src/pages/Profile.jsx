import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiUser, FiPackage, FiLock } from 'react-icons/fi';

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', form);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    setLoading(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.put('/users/profile', { password: pwForm.password });
      toast.success('Password changed!');
      setPwForm({ password: '', confirm: '' });
    } catch { toast.error('Failed to change password'); }
    setLoading(false);
  };

  const tabs = [
    { id: 'info', label: 'Profile Info', icon: FiUser },
    { id: 'password', label: 'Password', icon: FiLock },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-brand-teal rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={user?.role === 'admin' ? 'badge-red' : 'badge-green'}>{user?.role}</span>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {tab === 'info' && (
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary py-2.5 px-6">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
              <input className="input" type="password" placeholder="Min. 6 characters" minLength={6} required
                value={pwForm.password} onChange={e => setPwForm({ ...pwForm, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
              <input className="input" type="password" placeholder="Repeat password" required
                value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary py-2.5 px-6">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/orders" className="btn-secondary flex items-center gap-2 text-sm">
          <FiPackage size={15} /> My Orders
        </Link>
        {isAdmin && (
          <Link to="/admin" className="btn-primary flex items-center gap-2 text-sm">
            Admin Panel →
          </Link>
        )}
      </div>
    </div>
  );
}
