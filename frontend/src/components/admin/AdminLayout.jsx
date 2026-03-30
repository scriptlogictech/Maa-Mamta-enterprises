import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiShoppingBag, FiClipboard, FiUsers, FiArchive, FiLogOut, FiMenu, FiExternalLink } from 'react-icons/fi';
import { MdPointOfSale } from 'react-icons/md';
import { useState } from 'react';

const navItems = [
  { to: '/admin',           label: 'Dashboard',   icon: FiGrid,        end: true },
  { to: '/admin/pos',       label: 'POS Billing',  icon: MdPointOfSale },
  { to: '/admin/products',  label: 'Products',    icon: FiShoppingBag },
  { to: '/admin/orders',    label: 'Orders',      icon: FiClipboard },
  { to: '/admin/users',     label: 'Users',       icon: FiUsers },
  { to: '/admin/inventory', label: 'Inventory',   icon: FiArchive },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 flex-shrink-0" style={{ background: 'linear-gradient(180deg, #0a2e2e 0%, #1a6b6b 100%)' }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-teal-700/50">
        <div className="flex items-center gap-3 mb-1">
          <img src="/logo.jpg" alt="Logo" className="w-11 h-11 rounded-full object-cover border-2 border-brand-gold shadow-md flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-display font-bold text-white text-sm leading-tight truncate">Maa Mamta</div>
            <div className="text-brand-gold text-xs font-body font-medium">Enterprises</div>
          </div>
        </div>
        <div className="mt-3 bg-brand-gold/20 border border-brand-gold/30 rounded-lg px-3 py-1.5 text-center">
          <span className="text-brand-gold text-xs font-body font-semibold uppercase tracking-widest">Admin Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium font-body transition-all ${
                isActive
                  ? 'bg-brand-gold text-white shadow-gold'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setSidebarOpen(false)}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-teal-700/50 pt-3">
        <NavLink to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-teal-300 hover:text-white hover:bg-white/10 transition-all font-body mb-1">
          <FiExternalLink size={14} /> View Website
        </NavLink>
        <div className="flex items-center gap-3 px-4 py-2 mb-1">
          <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-xs font-bold text-white font-display flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate font-body">{user?.name}</div>
            <div className="text-xs text-teal-400 truncate font-body">{user?.role}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all font-body">
          <FiLogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-brand-teal">
            <FiMenu size={22} />
          </button>
          <img src="/logo.jpg" alt="" className="w-8 h-8 rounded-full object-cover border border-brand-gold" />
          <span className="font-display font-bold text-brand-dark text-sm">Maa Mamta Enterprises</span>
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50"><Outlet /></main>
      </div>
    </div>
  );
}
