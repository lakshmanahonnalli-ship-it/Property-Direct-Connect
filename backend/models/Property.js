import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['sale', 'rent'],
      required: [true, 'Property purpose (sale or rent) is required'],
    },
    category: {
      type: String,
      enum: [
        'Houses',
        'Apartments',
        'Residential Plots',
        'Commercial Buildings',
        'Shops and Offices',
        'Agricultural Land',
      ],
      required: [true, 'Property category is required'],
    },
    propertyType: {
      type: String,
      enum: [
        'Independent House',
        'Apartment',
        'Villa',
        'Plot',
        'Commercial Space',
        'Shop',
        'Office',
        'Agricultural Land',
      ],
      required: [true, 'Property type is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    monthlyRent: {
      type: Number,
      default: 0,
      min: [0, 'Monthly rent must be positive'],
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Security deposit must be positive'],
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: [true, 'Complete address is required'],
      trim: true,
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pinCode: {
      type: String,
      required: [true, 'PIN Code is required'],
      trim: true,
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    builtUpArea: {
      type: Number,
      default: 0,
      min: 0,
    },
    plotArea: {
      type: Number,
      default: 0,
      min: 0,
    },
    furnishingStatus: {
      type: String,
      enum: ['Furnished', 'Semi-Furnished', 'Unfurnished', 'N/A'],
      default: 'Unfurnished',
    },
    parking: {
      type: String,
      enum: ['Covered', 'Open', 'Both', 'None'],
      default: 'Open',
    },
    propertyAge: {
      type: String,
      default: 'Ready to Move',
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    mapCoordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'sold', 'rented'],
      default: 'available',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying
propertySchema.index({ approvalStatus: 1, availabilityStatus: 1, purpose: 1 });
propertySchema.index({ city: 1, locality: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ category: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ title: 'text', locality: 'text', city: 'text', description: 'text' });

const Property = mongoose.model('Property', propertySchema);
export default Property;
