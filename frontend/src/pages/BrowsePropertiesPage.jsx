import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import PropertyFilterBar from '../components/PropertyFilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BrowsePropertiesPage = ({ defaultPurpose, defaultCategory }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Initialize filters from searchParams or defaults
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    purpose: defaultPurpose || searchParams.get('purpose') || '',
    category: defaultCategory || searchParams.get('category') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnishingStatus: searchParams.get('furnishingStatus') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  // Sync state if defaultPurpose changes (e.g. user navigates between /buy and /rent)
  useEffect(() => {
    if (defaultPurpose) {
      setFilters((prev) => ({ ...prev, purpose: defaultPurpose, page: 1 }));
    }
  }, [defaultPurpose, location.pathname]);

  // Fetch properties whenever filters change
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.city) params.append('city', filters.city);
        if (filters.purpose) params.append('purpose', filters.purpose);
        if (filters.category) params.append('category', filters.category);
        if (filters.propertyType) params.append('propertyType', filters.propertyType);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
        if (filters.furnishingStatus) params.append('furnishingStatus', filters.furnishingStatus);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        params.append('page', filters.page.toString());
        params.append('limit', '12');

        const res = await api.get(`/properties?${params.toString()}`);
        if (res.data.success) {
          setProperties(res.data.properties);
          setTotalCount(res.data.total);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.warn('Failed to load properties:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      city: '',
      purpose: defaultPurpose || '',
      category: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      furnishingStatus: '',
      sortBy: 'newest',
      page: 1,
    });
  };

  const getPageTitle = () => {
    if (defaultPurpose === 'sale') return 'Properties For Sale';
    if (defaultPurpose === 'rent') return 'Rental Properties';
    if (defaultCategory === 'Commercial Buildings') return 'Commercial Real Estate';
    return 'Browse Property Listings';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getPageTitle()}</h1>
        <p className="text-sm text-slate-500">
          Showing direct owner listings with verified phone numbers and zero brokerage
        </p>
      </div>

      {/* Filter Component */}
      <PropertyFilterBar
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        totalCount={totalCount}
      />

      {/* Results Grid */}
      {loading ? (
        <LoadingSpinner message="Searching marketplace listings..." />
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties match your search"
          description="We couldn't find any listings matching all your criteria. Try adjusting your filters or price range."
          onReset={handleResetFilters}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-semibold text-slate-700 px-4">
                Page {filters.page} of {totalPages}
              </span>

              <button
                disabled={filters.page >= totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowsePropertiesPage;
