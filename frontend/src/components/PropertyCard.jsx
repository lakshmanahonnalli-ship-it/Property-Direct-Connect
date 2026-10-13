import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Heart,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { useFavorites } from '../context/FavoriteContext';

const PropertyCard = ({ property }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property._id);

  const mainImage =
    property.images && property.images.length > 0
      ? property.images[0].url
      : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  const isVerifiedOwner = property.owner?.ownerVerificationStatus === 'verified';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm ${
              property.purpose === 'rent'
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {property.purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          <span className="bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-medium">
            {property.propertyType}
          </span>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md transition-all shadow-md ${
            favorited
              ? 'bg-rose-500 text-white shadow-rose-500/30'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500 hover:scale-110'
          }`}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Availability tag if Sold / Rented */}
        {property.availabilityStatus !== 'available' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold uppercase tracking-wider text-sm px-4 py-1.5 rounded-xl shadow-lg">
              {property.availabilityStatus === 'sold' ? 'Sold Out' : 'Already Rented'}
            </span>
          </div>
        )}

        {/* Price Tag in Bottom Right of image */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl font-black text-lg shadow-md border border-white/10">
          {formatPrice(property.price, property.purpose)}
          {property.isNegotiable && (
            <span className="text-[10px] font-semibold text-emerald-400 block -mt-1">
              Negotiable
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center text-xs font-medium text-slate-500 gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">
              {property.locality ? `${property.locality}, ` : ''}
              <strong className="text-slate-700">{property.city}</strong>
            </span>
          </div>

          {/* Title */}
          <Link to={`/properties/${property._id}`}>
            <h3 className="font-bold text-slate-900 text-base line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Specs Highlights */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600">
          {property.bedrooms > 0 ? (
            <div className="flex items-center gap-1.5" title={`${property.bedrooms} Bedrooms`}>
              <BedDouble className="w-4 h-4 text-slate-400" />
              <span>{property.bedrooms} BHK</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5" title="Category">
              <Tag className="w-4 h-4 text-slate-400" />
              <span className="truncate">{property.category}</span>
            </div>
          )}

          {property.bathrooms > 0 ? (
            <div className="flex items-center gap-1.5" title={`${property.bathrooms} Bathrooms`}>
              <Bath className="w-4 h-4 text-slate-400" />
              <span>{property.bathrooms} Baths</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5" title="Furnishing">
              <span className="text-slate-500">{property.furnishingStatus}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5" title="Built-up / Plot Area">
            <Maximize2 className="w-4 h-4 text-slate-400" />
            <span className="truncate">
              {property.builtUpArea > 0
                ? `${property.builtUpArea} sq.ft`
                : property.plotArea > 0
                ? `${property.plotArea} sq.ft`
                : 'Plot site'}
            </span>
          </div>
        </div>

        {/* Owner Info & Details Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              {property.owner?.name ? property.owner.name.charAt(0) : 'O'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[100px]">
                {property.owner?.name || 'Owner'}
              </span>
              {isVerifiedOwner ? (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">Direct Owner</span>
              )}
            </div>
          </div>

          <Link
            to={`/properties/${property._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
