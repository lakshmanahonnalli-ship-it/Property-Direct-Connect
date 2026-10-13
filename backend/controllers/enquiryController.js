import Enquiry from '../models/Enquiry.js';
import Property from '../models/Property.js';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from '../services/dbStore.js';

export const createEnquiry = async (req, res, next) => {
  try {
    const { propertyId, buyerName, buyerEmail, buyerPhone, message } = req.body;

    if (!propertyId || !buyerName || !buyerEmail || !buyerPhone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all enquiry fields' });
    }

    if (isDbConnected()) {
      const property = await Property.findById(propertyId);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

      const enquiry = await Enquiry.create({
        property: propertyId,
        buyer: req.user ? req.user._id : null,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim().toLowerCase(),
        buyerPhone: buyerPhone.trim(),
        message: message.trim(),
        enquiryStatus: 'pending',
      });

      return res.status(201).json({
        success: true,
        message: 'Your enquiry has been sent to the property owner successfully!',
        enquiry,
      });
    }

    const property = inMemoryStore.properties.find((p) => p._id.toString() === propertyId.toString());
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const enquiry = {
      _id: `66300000000000000000000${inMemoryStore.enquiries.length + 10}`,
      property,
      buyer: req.user ? req.user._id : null,
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim().toLowerCase(),
      buyerPhone: buyerPhone.trim(),
      message: message.trim(),
      enquiryStatus: 'pending',
      createdAt: new Date().toISOString(),
    };
    inMemoryStore.enquiries.push(enquiry);

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been sent to the property owner successfully!',
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedEnquiries = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
      const propertyIds = ownerProperties.map((p) => p._id);

      const enquiries = await Enquiry.find({ property: { $in: propertyIds } })
        .populate('property', 'title price city locality purpose images')
        .populate('buyer', 'name email phone')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: enquiries.length, enquiries });
    }

    const userPropIds = inMemoryStore.properties
      .filter((p) => (p.owner._id || p.owner).toString() === req.user._id.toString())
      .map((p) => p._id.toString());

    const enquiries = inMemoryStore.enquiries.filter((e) =>
      userPropIds.includes((e.property._id || e.property).toString())
    );

    res.status(200).json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    next(error);
  }
};

export const getMyEnquiries = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const enquiries = await Enquiry.find({ buyer: req.user._id })
        .populate({
          path: 'property',
          select: 'title price city locality purpose images owner',
          populate: { path: 'owner', select: 'name phone phoneDisplayConsent' },
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: enquiries.length, enquiries });
    }

    const enquiries = inMemoryStore.enquiries.filter(
      (e) => e.buyer && e.buyer.toString() === req.user._id.toString()
    );

    res.status(200).json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enquiryStatus } = req.body;

    if (!['pending', 'contacted', 'closed'].includes(enquiryStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (isDbConnected()) {
      const enquiry = await Enquiry.findById(id).populate('property');
      if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

      enquiry.enquiryStatus = enquiryStatus;
      await enquiry.save();
      return res.status(200).json({ success: true, message: `Enquiry marked as ${enquiryStatus}`, enquiry });
    }

    const enquiry = inMemoryStore.enquiries.find((e) => e._id.toString() === id.toString());
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    enquiry.enquiryStatus = enquiryStatus;
    res.status(200).json({ success: true, message: `Enquiry marked as ${enquiryStatus}`, enquiry });
  } catch (error) {
    next(error);
  }
};
