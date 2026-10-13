import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Phone,
  MessageCircle,
  Mail,
  Heart,
  Flag,
  Share2,
  ArrowLeft,
  Eye,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import { useFavorites } from '../context/FavoriteContext';
import MapComponent from '../components/MapComponent';
import EnquiryModal from '../components/EnquiryModal';
import ReportModal from '../components/ReportModal';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Modals
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const [res, simRes] = await Promise.all([
          api.get(`/properties/${id}`),
          api.get(`/properties/${id}/similar`),
        ]);

        if (res.data.success) {
          setProperty(res.data.property);
        }
        if (simRes.data.success) {
          setSimilarProperties(simRes.data.properties);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading complete property details..." />;
  }

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-slate-500">
          This listing might have been removed, sold, or is currently under administrative review.
        </p>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
        >
          Browse Active Properties
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80' }];
  const favorited = isFavorite(property._id);
  const isVerifiedOwner = property.owner?.ownerVerificationStatus === 'verified';

  // Format owner phone for direct WhatsApp and calling
  const ownerPhoneRaw = property.owner?.phone || '';
  const cleanPhoneDigits = ownerPhoneRaw.replace(/[^\d]/g, '');
  const whatsAppNumber = cleanPhoneDigits.startsWith('91')
    ? cleanPhoneDigits
    : `91${cleanPhoneDigits}`;

  const whatsAppText = encodeURIComponent(
    `Hello, I found your property "${property.title}" on PropertyConnect and would like to know more about it.`
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this direct owner property on PropertyConnect: ${property.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Listing URL copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button & Actions bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => toggleFavorite(property)}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors shadow-xs ${
              favorited
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current text-rose-500' : ''}`} />
            <span>{favorited ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-white px-3 py-2 rounded-xl border border-slate-200 transition-colors"
            title="Report this listing"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Main Details Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              property.purpose === 'rent'
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {property.purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </span>

          <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-xs font-semibold">
            {property.category} • {property.propertyType}
          </span>

          {property.isNegotiable && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">
              Price Negotiable
            </span>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <Eye className="w-3.5 h-3.5" />
            <span>{property.views || 1} views</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            {property.title}
          </h1>

          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shrink-0 shadow-lg border border-slate-800 text-right">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatPrice(property.price, property.purpose)}
            </div>
            {property.purpose === 'rent' && property.securityDeposit > 0 && (
              <div className="text-[11px] text-slate-400 font-medium">
                Deposit: ₹{property.securityDeposit.toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center text-sm font-medium text-slate-600 gap-2">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {property.address}, {property.locality}, <strong>{property.city}</strong>, {property.state} - {property.pinCode}
          </span>
        </div>
      </div>

      {/* Large Image Gallery */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="relative aspect-[16/9] max-h-[550px] w-full bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <img
            src={images[selectedImageIndex]?.url}
            alt={property.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl font-medium">
            Photo {selectedImageIndex + 1} of {images.length}
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-blue-600 scale-105 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout: Details on Left, Direct Contact on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT 2 COLUMNS: Specs, Description, Amenities, Map */}
        <div className="lg:col-span-2 space-y-10">
          {/* Key Specifications Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Property Overview & Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Bedrooms</span>
                    <span className="font-bold text-slate-800">{property.bedrooms} BHK</span>
                  </div>
                </div>
              )}

              {property.bathrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Bath className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Bathrooms</span>
                    <span className="font-bold text-slate-800">{property.bathrooms} Baths</span>
                  </div>
                </div>
              )}

              {property.builtUpArea > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Built-up Area</span>
                    <span className="font-bold text-slate-800">{property.builtUpArea} sq.ft</span>
                  </div>
                </div>
              )}

              {property.plotArea > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Plot Area</span>
                    <span className="font-bold text-slate-800">{property.plotArea} sq.ft</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Furnishing</span>
                  <span className="font-bold text-slate-800">{property.furnishingStatus}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Property Age</span>
                  <span className="font-bold text-slate-800">{property.propertyAge || 'Ready to Move'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Detailed Property Description
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Features & Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OpenStreetMap Location */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Neighborhood Map Location</h3>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                OpenStreetMap
              </span>
            </div>
            <div className="h-72 w-full rounded-2xl overflow-hidden">
              <MapComponent
                center={property.mapCoordinates || { lat: 12.9716, lng: 77.5946 }}
                zoom={14}
                title={property.title}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Direct Owner Contact Card */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-6">
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Direct Owner Listing
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {property.owner?.name ? property.owner.name.charAt(0) : 'O'}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 text-base">
                    {property.owner?.name || 'Property Owner'}
                  </h4>
                  {isVerifiedOwner ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Owner
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Owner Submitted</span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="space-y-3">
              {/* WhatsApp Button */}
              {property.owner?.phoneDisplayConsent && ownerPhoneRaw && (
                <a
                  href={`https://wa.me/${whatsAppNumber}?text=${whatsAppText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Owner</span>
                </a>
              )}

              {/* Direct Phone Call Button */}
              {property.owner?.phoneDisplayConsent && ownerPhoneRaw ? (
                <a
                  href={`tel:${ownerPhoneRaw}`}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {ownerPhoneRaw}</span>
                </a>
              ) : (
                <div className="text-xs text-slate-500 italic text-center p-2 bg-slate-50 rounded-xl">
                  Owner has chosen enquiry form contact
                </div>
              )}

              {/* Send Enquiry Button */}
              <button
                type="button"
                onClick={() => setEnquiryModalOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Send Direct Enquiry</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Zero Brokerage Guarantee</p>
              <p>
                No agents, no commission markup. Talk directly with the property owner and finalize deals without third-party fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-200">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900">Similar Properties in {property.city}</h3>
            <p className="text-xs text-slate-500">Explore comparable homes and spaces in the same area</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.map((sim) => (
              <PropertyCard key={sim._id} property={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        property={property}
      />
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        property={property}
      />
    </div>
  );
};

export default PropertyDetailsPage;
