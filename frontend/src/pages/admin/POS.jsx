import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiRefreshCw, FiPrinter, FiClock, FiShoppingCart } from 'react-icons/fi';
import { format } from 'date-fns';
import { generateInvoicePDF } from '../../utils/invoicePDF';
import "../../myownstyles/Pos.css"

const PAYMENT_METHODS = ['cash', 'upi', 'card', 'credit'];
const CATEGORIES = ['All', 'Cola', 'Orange', 'Lemon', 'Water', 'Other'];
const catImages = {
  Cola: '/images/cola.webp',
  Orange: '/images/orange.webp',
  Lemon: '/images/lemon.webp',
  Water: '/images/water.jpg',
  Other: '/images/other.jpg'
};

export default function POS() {
  const [activeTab, setActiveTab] = useState('billing');
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [cashierName, setCashierName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [lastCart, setLastCart] = useState([]);

  // Bill history
  const [bills, setBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billPage, setBillPage] = useState(1);
  const [billPages, setBillPages] = useState(1);
  const [billTotal, setBillTotal] = useState(0);

  useEffect(() => {
    api.get('/products/admin/all').then(({ data }) => {
      const active = data.filter(p => p.isActive && p.stock > 0);
      setProducts(active);
      setFiltered(active);
    });
  }, []);

  useEffect(() => {
    let res = products;
    if (category !== 'All') res = res.filter(p => p.category === category);
    if (search) res = res.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [search, category, products]);

  const loadBills = async (page = 1) => {
    setBillsLoading(true);
    try {
      const { data } = await api.get(`/orders?source=pos&page=${page}&limit=15`);
      setBills(data.orders);
      setBillPages(data.pages);
      setBillTotal(data.total);
      setBillPage(page);
    } catch { }
    setBillsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'history') loadBills(1);
  }, [activeTab]);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i._id === product._id);
      if (ex) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i._id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    );
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const paid = Number(paidAmount) || 0;
  const pending = total - paid;

  const processBill = async () => {
    if (!cart.length) return toast.error('Cart is empty');
    setLoading(true);
    try {
      const { data } = await api.post('/orders/pos', {
        items: cart.map(i => ({ product: i._id, quantity: i.qty })),
        paymentMethod,
        customerName,
        customerPhone,
        customerAddress,
        cashierName,
        paidAmount: paid,
      });
      const orderWithMeta = { ...data, customerName, customerPhone, customerAddress };
      setLastOrder(orderWithMeta);
      setLastCart([...cart]);
      toast.success(`Bill generated: ${data.orderNumber}`);
      // Auto print PDF
      await printBill(orderWithMeta, [...cart], paid, cashierName);
      // Reset
      setCart([]); setCustomerName(''); setCustomerPhone('');
      setCustomerAddress(''); setPaidAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    }
    setLoading(false);
  };

  const printBill = async (order, cartData, paidAmt, cashier) => {
    setPrinting(true);
    try {
      await generateInvoicePDF(order, cartData, paidAmt, cashier);
      toast.success('Invoice PDF downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF');
      console.error(err);
    }
    setPrinting(false);
  };

  return (
    <div className="pos-container flex flex-col min-h-screen bg-gray-50">

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2 flex-shrink-0 shadow-sm">
        <div className="font-display font-bold text-brand-dark text-lg mr-6">POS Billing</div>
        {[
          { id: 'billing', label: 'New Bill', icon: FiShoppingCart },
          { id: 'history', label: 'Bill History', icon: FiClock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-body transition-all ${activeTab === id ? 'bg-brand-teal text-white shadow-teal' : 'text-gray-500 hover:bg-gray-100'
              }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── BILLING TAB ── */}
      {activeTab === 'billing' && (
        <div className="pos-layout flex flex-1 overflow-hidden">

          {/* Products panel */}
          <div className="pos-products flex-1 flex flex-col overflow-hidden border-r border-gray-100">
            <div className="p-4 bg-white border-b border-gray-100 flex-shrink-0">
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input className="input pl-9 text-sm" placeholder="Search products..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all font-body ${category === c ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map(p => (
                  <button key={p._id} onClick={() => addToCart(p)}
                    className="card p-3 text-left hover:border-brand-teal hover:shadow-teal transition-all active:scale-95">
                    <div className="flex justify-center mb-2">
  <img
    src={catImages[p.category] || '/logo.jpg'}
    alt={p.category}
    className="w-10 h-10 object-contain"
  />
</div>
                    <div className="text-xs font-semibold text-gray-900 leading-tight mb-1 line-clamp-2 font-body">{p.name}</div>
                    <div className="text-sm font-bold text-brand-teal font-body">₹{p.price}</div>
                    <div className="text-xs text-gray-400 font-body">Stock: {p.stock}</div>
                  </button>
                ))}
                {!filtered.length && (
                  <div className="col-span-full text-center py-12 text-gray-400 text-sm font-body">No products found</div>
                )}
              </div>
            </div>
          </div>

          {/* Bill panel */}
          <div className="pos-bill w-80 xl:w-96 flex flex-col bg-white flex-shrink-0">

            {/* Customer details */}
            <div className="p-4 border-b border-gray-100 flex-shrink-0 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-semibold text-brand-dark text-sm">Customer Details</span>
                <button onClick={() => { setCart([]); setPaidAmount(''); }} className="text-gray-400 hover:text-red-500 transition-colors" title="Clear cart">
                  <FiRefreshCw size={14} />
                </button>
              </div>
              <input className="input text-sm" placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <input className="input text-sm" placeholder="Mobile number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              <input className="input text-sm" placeholder="Address (optional)" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
              <input className="input text-sm" placeholder="Cashier name" value={cashierName} onChange={e => setCashierName(e.target.value)} />
            </div>

            {/* Cart items */}
            <div className="pos-cart p-3 space-y-2">
              {!cart.length ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm font-body">
                  <div className="text-4xl mb-3">🛒</div>
                  <p>Tap products to add</p>
                </div>
              ) : cart.map(item => (
                <div key={item._id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate font-body">{item.name}</div>
                    <div className="text-xs text-gray-500 font-body">₹{item.price} each</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => changeQty(item._id, -1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-all">−</button>
                    <span className="text-sm font-bold w-5 text-center font-body">{item.qty}</span>
                    <button onClick={() => changeQty(item._id, 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-all">+</button>
                  </div>
                  <div className="text-sm font-bold text-brand-teal min-w-12 text-right font-body">₹{item.price * item.qty}</div>
                  <button onClick={() => setCart(prev => prev.filter(i => i._id !== item._id))}
                    className="text-gray-300 hover:text-red-500 transition-colors ml-0.5">
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary + payment */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-body whitespace-nowrap">Paid (₹)</span>
                <input className="input text-sm py-1.5" type="number" placeholder="Enter paid amount"
                  value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
              </div>

              <div className="space-y-1 text-sm font-body">
                <div className="flex justify-between text-gray-500"><span>Total</span><span>₹{total}</span></div>
                <div className="flex justify-between text-green-600 font-medium"><span>Paid</span><span>₹{paid}</span></div>
                <div className="flex justify-between text-red-500 font-medium"><span>Pending</span><span>₹{Math.max(0, pending)}</span></div>
              </div>

              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
                <span className="font-display">Total Amount</span>
                <span className="text-brand-teal">₹{total}</span>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {PAYMENT_METHODS.map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`py-1.5 rounded-lg text-xs font-medium capitalize font-body transition-all ${paymentMethod === m ? 'bg-brand-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-teal'
                      }`}>{m}</button>
                ))}
              </div>

              <button onClick={processBill} disabled={!cart.length || loading || printing}
                className="btn-primary w-full py-3 text-sm font-semibold">
                {loading ? 'Processing...' : printing ? 'Generating PDF...' : '🧾 Generate Bill & Print'}
              </button>

              {lastOrder && (
                <button onClick={() => printBill(lastOrder, lastCart, lastOrder.paidAmount, lastOrder.cashierName)}
                  disabled={printing}
                  className="btn-outline w-full py-2.5 text-sm flex items-center justify-center gap-2">
                  <FiPrinter size={15} />
                  {printing ? 'Generating...' : `Reprint — ${lastOrder.orderNumber}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-brand-dark text-xl">Bill History</h2>
              <p className="text-sm text-gray-500 font-body mt-0.5">{billTotal} POS bills total</p>
            </div>
            <button onClick={() => loadBills(billPage)} className="btn-secondary text-sm flex items-center gap-2">
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>

          {billsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-th">Invoice No</th>
                    <th className="table-th">Customer</th>
                    <th className="table-th">Mobile</th>
                    <th className="table-th">Items</th>
                    <th className="table-th">Payment</th>
                    <th className="table-th">Total</th>
                    <th className="table-th">Date & Time</th>
                    <th className="table-th">Print</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bills.map(bill => (
                    <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-td font-bold text-brand-teal font-body">{bill.orderNumber}</td>
                      <td className="table-td font-body font-medium">{bill.customerName || 'Walk-in'}</td>
                      <td className="table-td font-body text-gray-500">{bill.customerPhone || '—'}</td>
                      <td className="table-td font-body">{bill.items?.length} items</td>
                      <td className="table-td">
                        <span className={bill.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}>
                          {bill.paymentMethod?.toUpperCase()}
                        </span>
                      </td>
                      <td className="table-td font-bold font-body">₹{bill.totalAmount?.toFixed(0)}</td>
                      <td className="table-td text-gray-400 text-xs font-body">
                        <div>{format(new Date(bill.createdAt), 'dd MMM yyyy')}</div>
                        <div>{format(new Date(bill.createdAt), 'hh:mm aa')}</div>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => printBill(
                            bill,
                            bill.items?.map(i => ({ ...i, qty: i.quantity })),
                            bill.paidAmount || bill.totalAmount,
                            bill.cashierName || ''
                          )}
                          disabled={printing}
                          className="p-2 text-brand-teal hover:bg-brand-tealLight rounded-lg transition-colors"
                          title="Print Invoice">
                          <FiPrinter size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!bills.length && (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400 text-sm font-body">
                        No bills yet. Generate your first bill!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {billPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-body">Page {billPage} of {billPages}</span>
                  <div className="flex gap-2">
                    <button disabled={billPage === 1} onClick={() => loadBills(billPage - 1)}
                      className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Prev</button>
                    <button disabled={billPage === billPages} onClick={() => loadBills(billPage + 1)}
                      className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
