import mongoose from 'mongoose';

const propertyReportSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reporterEmail: {
      type: String,
      trim: true,
      default: '',
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: [
        'Misleading Information',
        'Duplicate Listing',
        'Fake Owner / Scammer',
        'Incorrect Pricing',
        'Already Sold or Rented',
        'Inappropriate Content',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

propertyReportSchema.index({ property: 1 });
propertyReportSchema.index({ status: 1 });

const PropertyReport = mongoose.model('PropertyReport', propertyReportSchema);
export default PropertyReport;
