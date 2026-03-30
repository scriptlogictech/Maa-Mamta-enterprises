import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiPackage, FiStar, FiPhone } from 'react-icons/fi';

const categories = [
  {
    name: 'Cola',
    image: '/images/cola.webp',
    desc: 'The classic taste of Campa Cola',
    bg: 'from-teal-50 to-teal-100',
    border: 'border-teal-200',
    text: 'text-brand-teal'
  },
  {
    name: 'Orange',
    image: '/images/orange.webp',
    desc: 'Refreshing orange flavour',
    bg: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-700'
  },
  {
    name: 'Lemon',
    image: '/images/lemon.webp',
    desc: 'Tangy lemon soda, crisp & fresh',
    bg: 'from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-700'
  },
  {
    name: 'Water',
    image: '/images/water.jpg',
    desc: 'Pure & safe packaged water',
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-700'
  }
];

const features = [
  { icon: FiTruck, title: 'Same Day Delivery', desc: 'Fast delivery for bulk orders within city limits. Reliable and on time.' },
  { icon: FiShield, title: '100% Genuine Stock', desc: 'Direct from the source. Every bottle authentic, every batch fresh.' },
  { icon: FiPackage, title: 'Bulk Pricing', desc: 'Wholesale rates for retailers, hotels, restaurants and events.' },
  { icon: FiStar, title: 'Trusted Since 2020', desc: 'Thousands of happy customers across the city trust us every day.' },
];

const testimonials = [
  { name: 'Ramesh Sharma', role: 'Grocery Store Owner', text: 'Best distributor in town! Always on time and products are always fresh.', rating: 5 },
  { name: 'Priya Hotel', role: 'Hotel Manager', text: 'Bulk orders handled seamlessly. The online portal makes ordering very easy.', rating: 5 },
  { name: 'Suresh Traders', role: 'Wholesale Buyer', text: 'Competitive pricing and genuine Campa Cola products. Highly recommended!', rating: 5 },
];

export default function Home() {
  return (
    <div className="font-body">

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a2e2e 0%, #1a6b6b 50%, #0f4444 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c9973a, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c9973a, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div>
              <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
                🌸 Authorised Distributor
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-2">Maa Mamta</h1>
              <h2 className="text-3xl lg:text-4xl font-semibold text-brand-gold mb-6">Enterprises</h2>

              <p className="text-teal-200 text-lg mb-3 max-w-md">
                Your trusted <span className="text-white font-semibold">Campa Cola distributor</span> — delivering freshness, quality, and reliability.
              </p>

              <div className="flex gap-3 mt-6">
                <Link to="/shop" className="bg-brand-gold text-white px-6 py-3 rounded-xl flex items-center gap-2">
                  Order Now <FiArrowRight />
                </Link>

                <Link to="/register" className="border border-white text-white px-6 py-3 rounded-xl">
                  Create Account
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <img src="/logo.jpg" alt="Logo" className="w-72 h-72 rounded-full object-cover border-4 border-brand-gold shadow-xl" />
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <p className="text-gray-500 mt-2">Browse our beverage range</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${cat.name}`}
              className={`bg-gradient-to-br ${cat.bg} border ${cat.border} rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 group`}
            >
              
              {/* IMAGE */}
              <div className="mb-4 flex justify-center">
                <div className="bg-white p-3 rounded-full shadow-md group-hover:shadow-lg transition">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 object-contain group-hover:scale-110 transition"
                  />
                </div>
              </div>

              <h3 className={`font-bold text-lg ${cat.text}`}>{cat.name}</h3>
              <p className="text-gray-500 text-sm">{cat.desc}</p>

              <div className={`mt-2 text-sm font-semibold ${cat.text}`}>
                Shop Now →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6 bg-white rounded-xl shadow">
              <f.icon className="mx-auto mb-3 text-2xl text-brand-teal" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-10">Testimonials</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 bg-white shadow rounded-xl">
              <div className="text-yellow-500">{'★'.repeat(t.rating)}</div>
              <p className="italic text-gray-600 mt-2">"{t.text}"</p>
              <h4 className="mt-4 font-semibold">{t.name}</h4>
              <p className="text-sm text-gray-400">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-teal text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to Order?</h2>
        <Link to="/shop" className="bg-brand-gold px-6 py-3 rounded-xl inline-flex items-center gap-2">
          Shop Now <FiArrowRight />
        </Link>
      </section>

    </div>
  );
}