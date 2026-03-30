import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(form.email, form.password).catch(() => null);
    if (user) navigate(user.role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a2e2e 0%, #1a6b6b 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col items-center justify-center px-12 text-white">
        <img src="/logo.jpg" alt="Maa Mamta Enterprises" className="w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-brand-gold mb-8" />
        <h1 className="font-display text-4xl font-bold text-white mb-2">Maa Mamta</h1>
        <h2 className="font-display text-2xl font-semibold text-brand-gold mb-4">Enterprises</h2>
        <p className="text-teal-200 text-center font-body max-w-sm leading-relaxed">
          Your trusted Campa Cola distributor — delivering quality and freshness to every doorstep.
        </p>
        <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
          {['Genuine Campa Cola Products', 'Fast & Reliable Delivery', 'Best Wholesale Prices', 'Trusted Since 2020'].map(item => (
            <div key={item} className="flex items-center gap-3 text-teal-200 text-sm font-body">
              <div className="w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.jpg" alt="Maa Mamta" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-brand-gold shadow-xl" />
            <div className="font-display text-xl font-bold text-white">Maa Mamta Enterprises</div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm font-body mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 font-body uppercase tracking-wide">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 font-body uppercase tracking-wide">Password</label>
                <input className="input" type="password" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-brand-teal hover:bg-brand-tealDark text-white font-semibold rounded-xl transition-all font-body text-base shadow-teal disabled:opacity-60 mt-2">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <span className="text-sm text-gray-500 font-body">Don't have an account? </span>
              <Link to="/register" className="text-sm text-brand-teal font-semibold hover:text-brand-tealDark font-body">Create one free</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
