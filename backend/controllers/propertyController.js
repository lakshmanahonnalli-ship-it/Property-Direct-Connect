import Property from '../models/Property.js';
import Favorite from '../models/Favorite.js';
import Enquiry from '../models/Enquiry.js';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from '../services/dbStore.js';
import { processUploadedFiles } from '../config/upload.js';

export const getProperties = async (req, res, next) => {
  try {
    const {
      purpose,
      category,
      propertyType,
      city,
      district,
      locality,
      search,
      minPrice,
      maxPrice,
      bedrooms,
      furnishingStatus,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    if (isDbConnected()) {
      const query = {
        approvalStatus: 'approved',
        availabilityStatus: 'available',
      };

      if (purpose) query.purpose = purpose.toLowerCase();
      if (category) query.category = category;
      if (propertyType) query.propertyType = propertyType;
      if (city) query.city = { $regex: new RegExp(city.trim(), 'i') };
      if (district) query.district = { $regex: new RegExp(district.trim(), 'i') };
      if (locality) query.locality = { $regex: new RegExp(locality.trim(), 'i') };
      if (furnishingStatus && furnishingStatus !== 'All') query.furnishingStatus = furnishingStatus;
      if (bedrooms && Number(bedrooms) > 0) query.bedrooms = { $gte: Number(bedrooms) };

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: searchRegex },
          { locality: searchRegex },
          { city: searchRegex },
          { description: searchRegex },
        ];
      }

      let sort = { createdAt: -1 };
      if (sortBy === 'price-asc') sort = { price: 1 };
      if (sortBy === 'price-desc') sort = { price: -1 };
      if (sortBy === 'oldest') sort = { createdAt: 1 };

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const total = await Property.countDocuments(query);
      const properties = await Property.find(query)
        .populate('owner', 'name phone phoneDisplayConsent ownerVerificationStatus profileImage createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: properties.length,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        properties,
      });
    }

    // Standalone In-Memory fallback
    let filtered = inMemoryStore.properties.filter(
      (p) => p.approvalStatus === 'approved' && p.availabilityStatus === 'available'
    );

    if (purpose) {
      filtered = filtered.filter((p) => p.purpose.toLowerCase() === purpose.toLowerCase());
    }
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (propertyType) {
      filtered = filtered.filter((p) => p.propertyType === propertyType);
    }
    if (city) {
      filtered = filtered.filter((p) => p.city.toLowerCase().includes(city.trim().toLowerCase()));
    }
    if (district) {
      filtered = filtered.filter((p) => p.district.toLowerCase().includes(district.trim().toLowerCase()));
    }
    if (locality) {
      filtered = filtered.filter((p) => p.locality.toLowerCase().includes(locality.trim().toLowerCase()));
    }
    if (furnishingStatus && furnishingStatus !== 'All') {
      filtered = filtered.filter((p) => p.furnishingStatus === furnishingStatus);
    }
    if (bedrooms && Number(bedrooms) > 0) {
      filtered = filtered.filter((p) => p.bedrooms >= Number(bedrooms));
    }
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
      currentPage: pageNum,
      properties: paginated,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProperties = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const featured = await Property.find({
        approvalStatus: 'approved',
        availabilityStatus: 'available',
      })
        .populate('owner', 'name phone phoneDisplayConsent ownerVerificationStatus profileImage')
        .sort({ createdAt: -1 })
        .limit(6);

      return res.status(200).json({
        success: true,
        count: featured.length,
        properties: featured,
      });
    }

    const featured = inMemoryStore.properties
      .filter((p) => p.approvalStatus === 'approved' && p.availabilityStatus === 'available')
      .slice(0, 6);

    res.status(200).json({
      success: true,
      count: featured.length,
      properties: featured,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const property = await Property.findById(id).populate(
        'owner',
        'name phone email phoneDisplayConsent ownerVerificationStatus profileImage createdAt'
      );

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const isOwner = req.user && req.user._id.toString() === property.owner._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (property.approvalStatus !== 'approved' && !isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This property listing is currently under review or not publicly available.',
        });
      }

      await Property.findByIdAndUpdate(id, { $inc: { views: 1 } });
      return res.status(200).json({ success: true, property });
    }

    const property = inMemoryStore.properties.find((p) => p._id.toString() === id.toString());
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isOwner = req.user && req.user._id.toString() === (property.owner._id || property.owner).toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (property.approvalStatus !== 'approved' && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'This property listing is currently under review or not publicly available.',
      });
    }

    property.views = (property.views || 0) + 1;
    res.status(200).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      purpose,
      category,
      propertyType,
      price,
      monthlyRent,
      securityDeposit,
      isNegotiable,
      address,
      locality,
      city,
      district,
      state,
      pinCode,
      bedrooms,
      bathrooms,
      builtUpArea,
      plotArea,
      furnishingStatus,
      parking,
      propertyAge,
      amenities,
      latitude,
      longitude,
    } = req.body;

    if (!title || !description || !purpose || !category || !propertyType || !price || !city || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory property details',
      });
    }

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = await processUploadedFiles(req.files, req);
    }

    if (uploadedImages.length === 0 && req.body.images) {
      try {
        const parsed = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(parsed)) uploadedImages = parsed;
      } catch {}
    }

    if (uploadedImages.length === 0) {
      uploadedImages.push({
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
        publicId: 'default-property',
      });
    }

    let parsedAmenities = [];
    if (amenities) {
      if (Array.isArray(amenities)) {
        parsedAmenities = amenities;
      } else if (typeof amenities === 'string') {
        try {
          parsedAmenities = JSON.parse(amenities);
        } catch {
          parsedAmenities = amenities.split(',').map((a) => a.trim()).filter(Boolean);
        }
      }
    }

    const lat = latitude ? parseFloat(latitude) : 12.9716;
    const lng = longitude ? parseFloat(longitude) : 77.5946;

    const propertyPayload = {
      title: title.trim(),
      description: description.trim(),
      purpose: purpose.toLowerCase(),
      category,
      propertyType,
      price: Number(price),
      monthlyRent: monthlyRent ? Number(monthlyRent) : 0,
      securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
      isNegotiable: isNegotiable === true || isNegotiable === 'true',
      address: address.trim(),
      locality: (locality || '').trim(),
      city: city.trim(),
      district: (district || city).trim(),
      state: (state || 'Karnataka').trim(),
      pinCode: (pinCode || '').trim(),
      bedrooms: bedrooms ? Number(bedrooms) : 0,
      bathrooms: bathrooms ? Number(bathrooms) : 0,
      builtUpArea: builtUpArea ? Number(builtUpArea) : 0,
      plotArea: plotArea ? Number(plotArea) : 0,
      furnishingStatus: furnishingStatus || 'Unfurnished',
      parking: parking || 'Open',
      propertyAge: propertyAge || 'Ready to Move',
      amenities: parsedAmenities,
      images: uploadedImages,
      mapCoordinates: { lat, lng },
      owner: req.user._id,
      approvalStatus: 'pending',
      availabilityStatus: 'available',
      views: 0,
    };

    if (isDbConnected()) {
      const newProperty = await Property.create(propertyPayload);
      return res.status(201).json({
        success: true,
        message: 'Property submitted successfully! It is currently pending administrator approval.',
        property: newProperty,
      });
    }

    const newProperty = {
      ...propertyPayload,
      _id: `66100000000000000000000${inMemoryStore.properties.length + 10}`,
      owner: req.user,
      createdAt: new Date().toISOString(),
    };
    inMemoryStore.properties.unshift(newProperty);

    res.status(201).json({
      success: true,
      message: 'Property submitted successfully! It is currently pending administrator approval.',
      property: newProperty,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const property = await Property.findById(id);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const isOwner = property.owner.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Not authorized.' });
      }

      const updateData = { ...req.body };
      if (req.files && req.files.length > 0) {
        const newImages = await processUploadedFiles(req.files, req);
        updateData.images = [...(property.images || []), ...newImages];
      }

      if (isOwner && !isAdmin && property.approvalStatus === 'approved') {
        updateData.approvalStatus = 'pending';
      }

      const updated = await Property.findByIdAndUpdate(id, updateData, { new: true });
      return res.status(200).json({ success: true, message: 'Property updated.', property: updated });
    }

    const property = inMemoryStore.properties.find((p) => p._id.toString() === id.toString());
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isOwner = (property.owner._id || property.owner).toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: Not authorized.' });
    }

    Object.assign(property, req.body);
    if (isOwner && !isAdmin && property.approvalStatus === 'approved') {
      property.approvalStatus = 'pending';
    }

    res.status(200).json({ success: true, message: 'Property updated.', property });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const property = await Property.findById(id);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const isOwner = property.owner.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Not authorized.' });
      }

      await Property.findByIdAndDelete(id);
      await Favorite.deleteMany({ property: id });
      await Enquiry.deleteMany({ property: id });

      return res.status(200).json({ success: true, message: 'Property deleted successfully.' });
    }

    const index = inMemoryStore.properties.findIndex((p) => p._id.toString() === id.toString());
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const property = inMemoryStore.properties[index];
    const isOwner = (property.owner._id || property.owner).toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: Not authorized.' });
    }

    inMemoryStore.properties.splice(index, 1);
    inMemoryStore.favorites = inMemoryStore.favorites.filter((f) => (f.property._id || f.property).toString() !== id.toString());
    inMemoryStore.enquiries = inMemoryStore.enquiries.filter((e) => (e.property._id || e.property).toString() !== id.toString());

    res.status(200).json({ success: true, message: 'Property deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: properties.length, properties });
    }

    const properties = inMemoryStore.properties.filter(
      (p) => (p.owner._id || p.owner).toString() === req.user._id.toString()
    );
    res.status(200).json({ success: true, count: properties.length, properties });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availabilityStatus } = req.body;

    if (!['available', 'sold', 'rented'].includes(availabilityStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid availability status' });
    }

    if (isDbConnected()) {
      const property = await Property.findById(id);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

      property.availabilityStatus = availabilityStatus;
      await property.save();
      return res.status(200).json({ success: true, message: `Status updated to ${availabilityStatus}`, property });
    }

    const property = inMemoryStore.properties.find((p) => p._id.toString() === id.toString());
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    property.availabilityStatus = availabilityStatus;
    res.status(200).json({ success: true, message: `Status updated to ${availabilityStatus}`, property });
  } catch (error) {
    next(error);
  }
};

export const getSimilarProperties = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const current = await Property.findById(id);
      if (!current) return res.status(404).json({ success: false, message: 'Property not found' });

      const similar = await Property.find({
        _id: { $ne: current._id },
        approvalStatus: 'approved',
        availabilityStatus: 'available',
        $or: [{ city: current.city }, { category: current.category }],
      })
        .limit(3)
        .populate('owner', 'name phone phoneDisplayConsent ownerVerificationStatus');

      return res.status(200).json({ success: true, properties: similar });
    }

    const current = inMemoryStore.properties.find((p) => p._id.toString() === id.toString());
    if (!current) return res.status(404).json({ success: false, message: 'Property not found' });

    const similar = inMemoryStore.properties
      .filter(
        (p) =>
          p._id.toString() !== current._id.toString() &&
          p.approvalStatus === 'approved' &&
          p.availabilityStatus === 'available' &&
          (p.city === current.city || p.category === current.category)
      )
      .slice(0, 3);

    res.status(200).json({ success: true, properties: similar });
  } catch (error) {
    next(error);
  }
};
