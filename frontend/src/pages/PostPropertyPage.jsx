import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  X,
  Plus,
  MapPin,
  CheckCircle,
  AlertCircle,
  Home,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  Building2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import toast from 'react-hot-toast';

const PostPropertyPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    purpose: 'sale',
    category: 'Houses',
    propertyType: 'Independent House',
    price: '',
    monthlyRent: '',
    securityDeposit: '',
    isNegotiable: false,
    state: 'Karnataka',
    district: '',
    city: '',
    locality: '',
    address: '',
    pinCode: '',
    bedrooms: '',
    bathrooms: '',
    builtUpArea: '',
    plotArea: '',
    furnishingStatus: 'Semi-Furnished',
    parking: 'Open',
    propertyAge: '1-5 years',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  // Selected Amenities
  const [amenitiesList, setAmenitiesList] = useState([
    '24/7 Water Supply',
    'Covered Parking',
    'Power Backup',
  ]);

  // Uploaded Image Files & Previews
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    'Houses',
    'Apartments',
    'Residential Plots',
    'Commercial Buildings',
    'Shops and Offices',
    'Agricultural Land',
  ];

  const propertyTypes = [
    'Independent House',
    'Apartment',
    'Villa',
    'Plot',
    'Commercial Space',
    'Shop',
    'Office',
    'Agricultural Land',
  ];

  const availableAmenities = [
    '24/7 Water Supply',
    'Power Backup',
    'Covered Parking',
    'Private Garden',
    'Lift / Elevator',
    'Clubhouse',
    'Swimming Pool',
    'Gymnasium',
    'CCTV & 24/7 Security',
    'Solar Water Heater',
    'Rainwater Harvesting',
    'Pet Friendly',
    'Gated Society',
    'Vastu Compliant',
  ];

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Toggle Amenity
  const toggleAmenity = (item) => {
    setAmenitiesList((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  // Handle Image Selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate size (max 5MB)
    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        toast.error(`"${file.name}" is not a supported image format.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove Selected Image
  const handleRemoveImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.city || !formData.address) {
      toast.error('Please complete all mandatory property fields.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      // Append text fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append amenities array
      data.append('amenities', JSON.stringify(amenitiesList));

      // Append images
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      const res = await api.post('/properties', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Property submitted successfully! It is now pending administrative approval.', {
          duration: 5000,
        });
        navigate('/dashboard/owner');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit property.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
        <Building2 className="w-12 h-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Sign In to Post a Property</h2>
        <p className="text-sm text-slate-500">
          You need an active owner or buyer account on PropertyConnect to list your real estate.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            to="/login"
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const isPlotOrLand = formData.category === 'Residential Plots' || formData.category === 'Agricultural Land';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
          Zero Brokerage Platform
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Post Your Property Listing</h1>
        <p className="text-sm text-slate-500">
          List your home, plot or commercial property directly for free. New submissions are reviewed by moderators before appearing publicly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Basic Information */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Basic Property Information
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Spacious 3 BHK Independent Villa with Private Garden in Hassan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            {/* Purpose & Category & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                >
                  <option value="sale">Sell (For Sale)</option>
                  <option value="rent">Rent (For Rent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Property Type *
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                >
                  {propertyTypes.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe key features, nearby schools, hospital access, ventilation, water supply..."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-normal"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Pricing & Terms */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            Pricing & Commercials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {formData.purpose === 'rent' ? 'Monthly Rent (₹) *' : 'Total Price (₹) *'}
              </label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder={formData.purpose === 'rent' ? 'e.g. 25000' : 'e.g. 8500000'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            {formData.purpose === 'rent' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            )}

            <div className="flex items-center pt-6">
              <label className="relative flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNegotiable"
                  checked={formData.isNegotiable}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">Price is Negotiable</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: Location Details */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            Location & Address
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru, Hassan, Mysuru"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Hassan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Locality / Landmark
                </label>
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="e.g. Indiranagar, Sri Rama Layout"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Complete Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Door number, building name, cross, main road..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="e.g. 560038"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            {/* Interactive Map Picker */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Map Pin Placement (Click map to set exact coordinates)</span>
                <span>Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}</span>
              </div>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200">
                <MapComponent
                  center={{ lat: formData.latitude, lng: formData.longitude }}
                  interactive={true}
                  onPositionChange={(pos) =>
                    setFormData((prev) => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Specs & Amenities */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Specifications & Amenities
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {!isPlotOrLand && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bedrooms (BHK)
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      placeholder="e.g. 3"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      placeholder="e.g. 2"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Built-up Area (sq.ft)
                </label>
                <input
                  type="number"
                  name="builtUpArea"
                  value={formData.builtUpArea}
                  onChange={handleChange}
                  placeholder="e.g. 1850"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Plot Area (sq.ft)
                </label>
                <input
                  type="number"
                  name="plotArea"
                  value={formData.plotArea}
                  onChange={handleChange}
                  placeholder="e.g. 2400"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Furnishing Status
                </label>
                <select
                  name="furnishingStatus"
                  value={formData.furnishingStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                >
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="N/A">N/A (Plot/Land)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parking
                </label>
                <select
                  name="parking"
                  value={formData.parking}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                >
                  <option value="Covered">Covered Parking</option>
                  <option value="Open">Open Parking</option>
                  <option value="Both">Both (Multiple Cars)</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Property Age
                </label>
                <input
                  type="text"
                  name="propertyAge"
                  value={formData.propertyAge}
                  onChange={handleChange}
                  placeholder="e.g. 1-5 years, Ready to Move"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Available Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {availableAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      amenitiesList.includes(amenity)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 shrink-0 ${
                        amenitiesList.includes(amenity) ? 'text-blue-600' : 'text-slate-300'
                      }`}
                    />
                    <span className="truncate">{amenity}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Photos Upload */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            Property Photographs
          </h2>

          <div className="space-y-4">
            {/* File Dropzone */}
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/20">
              <Upload className="w-10 h-10 text-blue-600 mb-2" />
              <span className="text-sm font-bold text-slate-800">
                Click to upload multiple photographs
              </span>
              <span className="text-xs text-slate-500 mt-1">
                JPEG, PNG, or WebP up to 5MB each.
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>

            {/* Image Previews Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {imagePreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                  >
                    <img src={preview} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submission Actions */}
        <div className="flex items-center justify-between pt-4">
          <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{submitting ? 'Publishing Property...' : 'Submit Property Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostPropertyPage;
