import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiSettings, FiPackage, FiMenu, FiX, FiPhone } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function ShopLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">

      {/* Top info bar */}
      <div className="bg-brand-tealDark text-teal-200 text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span>🌸 Authorised Campa Cola Distributor — Serving with trust since 2020</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><FiPhone size={11} /> +91 98765 43210</span>
            <span>📍 Your City, India</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg border-b border-gray-100' : 'bg-white/95 backdrop-blur-md border-b border-brand-goldLight'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img
                src="/logo.jpg"
                alt="Maa Mamta Enterprises"
                className="h-14 w-14 rounded-full object-cover shadow-gold border-2 border-brand-gold"
              />
              <div className="hidden sm:block">
                <div className="font-display font-bold text-brand-dark text-lg leading-tight">Maa Mamta</div>
                <div className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase">Enterprises</div>
                <div className="font-body text-gray-400 text-[10px] tracking-wide">Campa Cola Distributor</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { to: '/', label: 'Home', end: true },
                { to: '/shop', label: 'Shop' },
                { to: '/orders', label: 'My Orders' },
              ].map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) =>
                    `font-body text-sm font-medium transition-colors pb-1 border-b-2 ${
                      isActive
                        ? 'text-brand-teal border-brand-gold'
                        : 'text-gray-600 border-transparent hover:text-brand-teal hover:border-brand-gold/50'
                    }`
                  }>
                  {label}
                </NavLink>
              ))}
              {isAdmin && (
                <Link to="/admin"
                  className="font-body text-sm font-semibold text-white bg-brand-teal px-4 py-2 rounded-lg hover:bg-brand-tealDark transition-colors shadow-teal">
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 text-gray-600 hover:text-brand-teal hover:bg-brand-tealLight rounded-xl transition-all">
                <FiShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-gold text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-tealLight hover:bg-teal-100 border border-brand-teal/20 transition-all">
                    <div className="w-7 h-7 bg-brand-teal rounded-full flex items-center justify-center text-white text-xs font-bold font-display">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-brand-tealDark max-w-24 truncate font-body">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <div className="text-sm font-semibold text-gray-900 font-display">{user.name}</div>
                        <div className="text-xs text-gray-400 font-body">{user.email}</div>
                      </div>
                      {[
                        { to: '/orders', icon: FiPackage, label: 'My Orders' },
                        { to: '/profile', icon: FiUser, label: 'Profile' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-tealLight hover:text-brand-teal transition-colors font-body">
                          <Icon size={15} /> {label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-teal font-semibold hover:bg-brand-tealLight transition-colors font-body">
                          <FiSettings size={15} /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-body">
                          <FiLogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-outline text-xs py-2 px-4 hidden sm:flex">Login</Link>
                  <Link to="/register" className="btn-primary text-xs py-2 px-4">Register</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-2 text-gray-600 hover:text-brand-teal transition-colors ml-1">
                {mobileNav ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNav && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/shop', label: 'Shop' },
              { to: '/cart', label: `Cart (${itemCount})` },
              { to: '/orders', label: 'My Orders' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileNav(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-tealLight hover:text-brand-teal font-body transition-colors">
                {label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileNav(false)} className="btn-outline flex-1 text-sm">Login</Link>
                <Link to="/register" onClick={() => setMobileNav(false)} className="btn-primary flex-1 text-sm">Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-teal-300 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.jpg" alt="Maa Mamta" className="w-12 h-12 rounded-full border-2 border-brand-gold object-cover" />
                <div>
                  <div className="font-display font-bold text-white text-base">Maa Mamta Enterprises</div>
                  <div className="text-brand-gold text-xs font-body">Authorised Distributor</div>
                </div>
              </div>
              <p className="text-teal-400 text-sm font-body leading-relaxed">
                Your trusted partner for Campa Cola beverages. Quality products, reliable service.
              </p>
            </div>
            {/* Links */}
            <div>
              <div className="font-display font-semibold text-white mb-3">Quick Links</div>
              <div className="space-y-2">
                {[['/', 'Home'], ['/shop', 'Shop'], ['/orders', 'My Orders'], ['/login', 'Login']].map(([to, label]) => (
                  <Link key={to} to={to} className="block text-sm text-teal-400 hover:text-brand-gold transition-colors font-body">{label}</Link>
                ))}
              </div>
            </div>
            {/* Contact */}
            <div>
              <div className="font-display font-semibold text-white mb-3">Contact Us</div>
              <div className="space-y-2 text-sm text-teal-400 font-body">
                <div>📞 +91 98765 43210</div>
                <div>📧 info@maamамта.com</div>
                <div>📍 Your City, Maharashtra, India</div>
              </div>
            </div>
          </div>
          <div className="border-t border-teal-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-teal-600 text-xs font-body">© 2024 Maa Mamta Enterprises. All rights reserved.</div>
            <div className="text-brand-gold text-xs font-body">Authorised Campa Cola Distributor</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
