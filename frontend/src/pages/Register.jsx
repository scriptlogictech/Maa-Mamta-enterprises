import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setError('');
    const user = await register(form.name, form.email, form.password, form.phone).catch(() => null);
    if (user) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #0a2e2e 0%, #1a6b6b 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Maa Mamta" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-brand-gold shadow-xl" />
          <div className="font-display text-xl font-bold text-white">Maa Mamta Enterprises</div>
          <div className="text-brand-gold text-xs font-body mt-1">Create your account</div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-brand-dark mb-1">Create Account</h2>
          <p className="text-gray-400 text-sm font-body mb-8">Join our distributor network today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name',      key: 'name',     type: 'text',     placeholder: 'Your full name' },
              { label: 'Email Address',  key: 'email',    type: 'email',    placeholder: 'you@example.com' },
              { label: 'Phone Number',   key: 'phone',    type: 'tel',      placeholder: '10-digit mobile number' },
              { label: 'Password',       key: 'password', type: 'password', placeholder: 'Min. 6 characters' },
              { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Repeat your password' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-2 font-body uppercase tracking-wide">{label}</label>
                <input className="input" type={type} placeholder={placeholder} required={key !== 'phone'} minLength={key === 'password' ? 6 : undefined}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl font-body border border-red-100">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-teal hover:bg-brand-tealDark text-white font-semibold rounded-xl transition-all font-body text-base shadow-teal disabled:opacity-60 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <span className="text-sm text-gray-500 font-body">Already have an account? </span>
            <Link to="/login" className="text-sm text-brand-teal font-semibold hover:text-brand-tealDark font-body">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
