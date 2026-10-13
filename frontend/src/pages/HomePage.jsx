import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Building,
  Home,
  Layers,
  Store,
  Trees,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero search form state
  const [heroSearch, setHeroSearch] = useState('');
  const [heroCity, setHeroCity] = useState('');
  const [heroPurpose, setHeroPurpose] = useState('sale');
  const [heroMinBudget, setHeroMinBudget] = useState('');
  const [heroMaxBudget, setHeroMaxBudget] = useState('');

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, allRes] = await Promise.all([
          api.get('/properties/featured'),
          api.get('/properties?limit=6&sortBy=newest'),
        ]);

        if (featRes.data.success) {
          setFeaturedProperties(featRes.data.properties);
        }
        if (allRes.data.success) {
          setRecentProperties(allRes.data.properties);
        }
      } catch (err) {
        console.warn('Error loading home data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.append('search', heroSearch.trim());
    if (heroCity.trim()) params.append('city', heroCity.trim());
    if (heroPurpose) params.append('purpose', heroPurpose);
    if (heroMinBudget) params.append('minPrice', heroMinBudget);
    if (heroMaxBudget) params.append('maxPrice', heroMaxBudget);

    navigate(`/properties?${params.toString()}`);
  };

  const categories = [
    {
      name: 'Houses',
      icon: Home,
      desc: 'Independent villas, duplexes & builder floors',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      name: 'Apartments',
      icon: Building,
      desc: 'Gated community flats & high-rise societies',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      name: 'Residential Plots',
      icon: Layers,
      desc: 'MUDA & BDA approved freehold sites',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      name: 'Commercial Buildings',
      icon: Building,
      desc: 'Standalone corporate buildings & complexes',
      color: 'from-amber-600 to-orange-600',
    },
    {
      name: 'Shops and Offices',
      icon: Store,
      desc: 'Prime retail frontage & business offices',
      color: 'from-rose-600 to-pink-600',
    },
    {
      name: 'Agricultural Land',
      icon: Trees,
      desc: 'Organic farm plots, estates & canal land',
      color: 'from-green-600 to-emerald-700',
    },
  ];

  const faqs = [
    {
      q: 'How does PropertyConnect connect buyers and owners without a broker?',
      a: 'PropertyConnect allows verified property owners to list their properties directly. As a buyer or tenant, you can call the owner on their mobile, initiate a WhatsApp chat, or send an enquiry form without any real estate agent or brokerage fees.',
    },
    {
      q: 'Is there any fee to post a property listing?',
      a: 'Posting a property on PropertyConnect is completely free for owners. Once submitted, your listing is reviewed by administrators for accuracy and immediately made available to thousands of prospective buyers and tenants.',
    },
    {
      q: 'How are properties approved and verified?',
      a: 'Every submitted listing undergoes moderation review before publishing. Listings with accurate documents and verified owner phone numbers receive a "Verified Owner" trust badge to foster transparency.',
    },
    {
      q: 'Can I negotiate the price directly with the owner?',
      a: 'Yes! Listings often indicate whether prices are negotiable. You can talk to the owner directly via phone or WhatsApp and finalize fair market terms without middlemen inflating the cost.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-indigo-600/15 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Brokerage • 100% Direct Owner Connections</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200">Perfect Property</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Buy, rent and sell properties directly with owners. Verified contact numbers, real photos, and no broker commissions.
          </p>

          {/* Search Box Card */}
          <div className="mt-8 bg-white/95 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-2xl border border-white/20 text-slate-900 text-left">
            {/* Purpose Selector Tab */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200/80 pb-3">
              <button
                type="button"
                onClick={() => setHeroPurpose('sale')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  heroPurpose === 'sale'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                Buy Property
              </button>
              <button
                type="button"
                onClick={() => setHeroPurpose('rent')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  heroPurpose === 'rent'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                Rent Property
              </button>
            </div>

            <form onSubmit={handleHeroSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search Term */}
                <div className="md:col-span-2 relative">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Location or Keyword
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="e.g. Indiranagar, Hassan, Villa..."
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={heroCity}
                      onChange={(e) => setHeroCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>
                </div>

                {/* Max Budget */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={heroMaxBudget}
                    onChange={(e) => setHeroMaxBudget(e.target.value)}
                    placeholder="e.g. 10000000"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Popular:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroCity('Bengaluru');
                    }}
                    className="hover:text-blue-600 underline"
                  >
                    Bengaluru
                  </button>
                  •
                  <button
                    type="button"
                    onClick={() => {
                      setHeroCity('Hassan');
                    }}
                    className="hover:text-blue-600 underline"
                  >
                    Hassan
                  </button>
                  •
                  <button
                    type="button"
                    onClick={() => {
                      setHeroCity('Mysuru');
                    }}
                    className="hover:text-blue-600 underline"
                  >
                    Mysuru
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Properties</span>
                  </button>

                  <Link
                    to="/post-property"
                    className="w-full sm:w-auto hidden sm:flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>Post Free Property</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* PROPERTY CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
              Explore Collections
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Browse by Property Category</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a category to view direct listings verified in that segment
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/properties?category=${encodeURIComponent(cat.name)}`}
                className="group relative bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex items-start gap-4"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                  <span className="inline-flex items-center text-xs font-semibold text-blue-600 pt-1 group-hover:translate-x-1 transition-transform">
                    Explore listings →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
              Handpicked Deals
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Featured Properties</h2>
            <p className="text-sm text-slate-500 mt-1">
              Popular approved listings with verified owners and direct negotiation
            </p>
          </div>
          <Link
            to="/buy"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>See more for sale</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching featured properties..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* DIRECT OWNER CONTACT EXPLANATION / HOW IT WORKS */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto shadow-xl">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-400/20">
            How PropertyConnect Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Connect Directly With Owners in 3 Simple Steps
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Say goodbye to high broker commissions, hidden markup fees, and unverified phone numbers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h3 className="font-bold text-lg text-white">Search & Filter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore verified houses, plots, apartments, and commercial shops across Karnataka with real photos and exact pricing.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h3 className="font-bold text-lg text-white">Direct Owner Connection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tap to call the owner directly, launch an instant WhatsApp conversation with prefilled property details, or submit an enquiry.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h3 className="font-bold text-lg text-white">Inspect & Finalize</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visit the site, inspect title deeds and government approvals, negotiate comfortably, and close your deal with 0% brokerage!
            </p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE PROPERTYCONNECT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                Our Value Proposition
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Why PropertyConnect is Different from Traditional Broker Portals
              </h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Most property platforms sell leads to multiple local brokers who flood your phone with unwanted calls. PropertyConnect empowers buyers and owners to communicate peer-to-peer with total privacy and transparency.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">0% Brokerage Commission</h4>
                  <p className="text-xs text-slate-500">Save lakhs of rupees in unnecessary broker fees on every transaction.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Direct WhatsApp & Mobile Calling</h4>
                  <p className="text-xs text-slate-500">
                    Connect immediately using valid, consented phone numbers and WhatsApp links.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Admin Moderated Listings</h4>
                  <p className="text-xs text-slate-500">
                    Submissions are verified by platform moderators before appearing in public searches.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                alt="Direct Property Connect"
                className="w-full h-[450px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 max-w-xs space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Zero Middlemen</span>
              <p className="text-xs font-semibold text-slate-800">
                Direct buyer-to-owner deals completed across Bengaluru, Hassan & Mysuru!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY ADDED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
              Fresh Listings
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Recently Added Properties</h2>
            <p className="text-sm text-slate-500 mt-1">
              Check out the latest properties approved on the platform
            </p>
          </div>
          <Link
            to="/rent"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>See more for rent</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map((prop) => (
            <PropertyCard key={prop._id} property={prop} />
          ))}
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
            Common Inquiries
          </span>
          <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500">
            Everything you need to know about navigating PropertyConnect safely
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION FOR OWNERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-md">
              Are you a property owner?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Sell or Rent Your Property Fast With Zero Commission
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Upload property photos, set your price, and start receiving direct calls and WhatsApp leads from verified buyers today.
            </p>
          </div>

          <Link
            to="/post-property"
            className="shrink-0 flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-950 font-black text-sm hover:bg-slate-100 shadow-xl transition-all transform hover:scale-105"
          >
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>Post Your Property Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
