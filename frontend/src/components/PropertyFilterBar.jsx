import React from 'react';
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  Home,
  IndianRupee,
  Layers,
  Sparkles,
} from 'lucide-react';

const PropertyFilterBar = ({ filters, setFilters, onReset, totalCount }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const categories = [
    'Houses',
    'Apartments',
    'Residential Plots',
    'Commercial Buildings',
    'Shops and Offices',
    'Agricultural Land',
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
      {/* Top Search Line & Purpose Switch */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Search by title, locality or landmark..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 hover:bg-white"
          />
        </div>

        {/* City Input */}
        <div className="relative w-full md:w-56">
          <input
            type="text"
            name="city"
            value={filters.city || ''}
            onChange={handleChange}
            placeholder="City (e.g. Bengaluru, Hassan)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 hover:bg-white"
          />
        </div>

        {/* Purpose Buttons */}
        <div className="flex p-1 bg-slate-100 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, purpose: '', page: 1 }))}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !filters.purpose ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, purpose: 'sale', page: 1 }))}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.purpose === 'sale' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, purpose: 'rent', page: 1 }))}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.purpose === 'rent' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Rent
          </button>
        </div>
      </div>

      {/* Second Line: Category, Price, Bedrooms, Furnishing, Sort */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Category */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Category</label>
          <select
            name="category"
            value={filters.category || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Min Budget */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Min Price (₹)</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice || ''}
            onChange={handleChange}
            placeholder="Min Budget"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Max Budget */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Max Price (₹)</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice || ''}
            onChange={handleChange}
            placeholder="Max Budget"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Bedrooms</label>
          <select
            name="bedrooms"
            value={filters.bedrooms || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Any BHK</option>
            <option value="1">1+ BHK</option>
            <option value="2">2+ BHK</option>
            <option value="3">3+ BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        {/* Furnishing */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Furnishing</label>
          <select
            name="furnishingStatus"
            value={filters.furnishingStatus || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All</option>
            <option value="Furnished">Furnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Sort By</label>
          <select
            name="sortBy"
            value={filters.sortBy || 'newest'}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips & Clear Action */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-900">{totalCount || 0}</strong> verified properties
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear All Filters</span>
        </button>
      </div>
    </div>
  );
};

export default PropertyFilterBar;
