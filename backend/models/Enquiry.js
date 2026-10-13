import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    buyerName: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: [true, 'Buyer email is required'],
      trim: true,
      lowercase: true,
    },
    buyerPhone: {
      type: String,
      required: [true, 'Buyer phone is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
      trim: true,
    },
    enquiryStatus: {
      type: String,
      enum: ['pending', 'contacted', 'closed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({ property: 1 });
enquirySchema.index({ buyer: 1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
