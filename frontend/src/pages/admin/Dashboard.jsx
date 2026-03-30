import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../api/axios';
import { FiTrendingUp, FiShoppingCart, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns';

const COLORS = ['#1B7A7A', '#C9A84C', '#2a9090', '#0d3d3d', '#4db2b2'];

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const StatCard = ({ label, value, delta, icon: Icon, color }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <div className="text-2xl font-display font-bold text-brand-dark">{value}</div>
    {delta && <div className="text-xs text-green-600 mt-1 font-medium">{delta}</div>}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, cat, top, recent] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/category-sales'),
          api.get('/dashboard/top-products'),
          api.get('/dashboard/recent-orders'),
        ]);
        setStats(s.data);
        setCategoryData(cat.data.map(d => ({ name: d._id, value: d.total })));
        setTopProducts(top.data);
        setRecentOrders(recent.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadChart = async () => {
      try {
        const { data } = await api.get(`/dashboard/sales-chart?period=${period}`);
        const formatted = data.map((d) => ({
          label: period === 'daily'
            ? `${d._id.day}/${d._id.month}`
            : period === 'weekly'
            ? `Wk ${d._id.week}`
            : `${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d._id.month]}`,
          total: Math.round(d.total),
          orders: d.count,
        }));
        setChartData(formatted);
      } catch {}
    };
    loadChart();
  }, [period]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full" />
    </div>
  );

  const statusColor = { delivered: 'badge-green', placed: 'badge-blue', processing: 'badge-yellow', cancelled: 'badge-red', shipped: 'badge-blue' };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-dark">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={fmt(stats?.today?.sales)} delta={`${stats?.today?.orders || 0} orders`} icon={FiTrendingUp} color="bg-brand-teal" />
        <StatCard label="This Week" value={fmt(stats?.week?.sales)} delta={`${stats?.week?.orders || 0} orders`} icon={FiShoppingCart} color="bg-orange-500" />
        <StatCard label="This Month" value={fmt(stats?.month?.sales)} delta={`${stats?.month?.orders || 0} orders`} icon={FiTrendingUp} color="bg-blue-500" />
        <StatCard label="Low Stock Items" value={stats?.lowStockCount || 0} delta={`${stats?.totalUsers || 0} customers`} icon={FiAlertTriangle} color="bg-yellow-500" />
      </div>

      {/* Sales chart + category pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Sales Overview</h2>
            <div className="flex gap-1">
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                    period === p ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} labelStyle={{ fontWeight: 600 }} />
              <Bar dataKey="total" fill="#1B7A7A" radius={[4, 4, 0, 0]} name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Category Sales</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {categoryData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-medium">{fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top Products (This Month)</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-50 text-brand-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-body font-medium text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.totalQty} units</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{fmt(p.totalRevenue)}</div>
              </div>
            ))}
            {!topProducts.length && <p className="text-sm text-gray-400 text-center py-6">No sales data yet</p>}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-2">
            {recentOrders.slice(0, 7).map((o) => (
              <div key={o._id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-body font-medium text-gray-900">{o.orderNumber}</div>
                  <div className="text-xs text-gray-500">{o.user?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{fmt(o.totalAmount)}</div>
                  <span className={statusColor[o.orderStatus] || 'badge-blue'}>{o.orderStatus}</span>
                </div>
              </div>
            ))}
            {!recentOrders.length && <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
