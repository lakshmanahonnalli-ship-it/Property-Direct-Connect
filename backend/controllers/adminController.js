import User from '../models/User.js';
import Property from '../models/Property.js';
import PropertyReport from '../models/PropertyReport.js';
import Enquiry from '../models/Enquiry.js';
import AdminAuditLog from '../models/AdminAuditLog.js';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from '../services/dbStore.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const [
        totalUsers,
        totalProperties,
        pendingListings,
        approvedListings,
        rejectedListings,
        reportedProperties,
        totalEnquiries,
        recentLogs,
      ] = await Promise.all([
        User.countDocuments(),
        Property.countDocuments(),
        Property.countDocuments({ approvalStatus: 'pending' }),
        Property.countDocuments({ approvalStatus: 'approved' }),
        Property.countDocuments({ approvalStatus: 'rejected' }),
        PropertyReport.countDocuments({ status: 'pending' }),
        Enquiry.countDocuments(),
        AdminAuditLog.find().populate('admin', 'name email').sort({ createdAt: -1 }).limit(10),
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalProperties,
          pendingListings,
          approvedListings,
          rejectedListings,
          reportedProperties,
          totalEnquiries,
        },
        recentLogs,
      });
    }

    const totalUsers = inMemoryStore.users.length;
    const totalProperties = inMemoryStore.properties.length;
    const pendingListings = inMemoryStore.properties.filter((p) => p.approvalStatus === 'pending').length;
    const approvedListings = inMemoryStore.properties.filter((p) => p.approvalStatus === 'approved').length;
    const rejectedListings = inMemoryStore.properties.filter((p) => p.approvalStatus === 'rejected').length;
    const reportedProperties = inMemoryStore.reports.filter((r) => r.status === 'pending').length;
    const totalEnquiries = inMemoryStore.enquiries.length;
    const recentLogs = inMemoryStore.auditLogs.slice(0, 10);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        pendingListings,
        approvedListings,
        rejectedListings,
        reportedProperties,
        totalEnquiries,
      },
      recentLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (role) filter.role = role;
      if (status) filter.accountStatus = status;
      if (search) {
        const reg = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: reg }, { email: reg }, { phone: reg }];
      }

      const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: users.length, users });
    }

    let users = inMemoryStore.users.map((u) => {
      const clone = { ...u };
      delete clone.passwordHash;
      return clone;
    });

    if (role) users = users.filter((u) => u.role === role);
    if (status) users = users.filter((u) => u.accountStatus === status);
    if (search) {
      const q = search.trim().toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q)
      );
    }

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus, ownerVerificationStatus } = req.body;

    if (isDbConnected()) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (user._id.toString() === req.user._id.toString() && accountStatus === 'suspended') {
        return res.status(400).json({ success: false, message: 'Cannot suspend your own admin account' });
      }

      if (accountStatus) user.accountStatus = accountStatus;
      if (ownerVerificationStatus) user.ownerVerificationStatus = ownerVerificationStatus;
      await user.save();

      await AdminAuditLog.create({
        admin: req.user._id,
        action: 'UPDATE_USER_STATUS',
        targetType: 'User',
        targetId: user._id,
        details: { accountStatus, ownerVerificationStatus, email: user.email },
      });

      return res.status(200).json({ success: true, message: 'User updated successfully', user });
    }

    const user = inMemoryStore.users.find((u) => u._id.toString() === id.toString());
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user._id.toString() === req.user._id.toString() && accountStatus === 'suspended') {
      return res.status(400).json({ success: false, message: 'Cannot suspend your own admin account' });
    }

    if (accountStatus) user.accountStatus = accountStatus;
    if (ownerVerificationStatus) user.ownerVerificationStatus = ownerVerificationStatus;

    inMemoryStore.auditLogs.unshift({
      _id: `66400000000000000000000${inMemoryStore.auditLogs.length + 10}`,
      admin: req.user,
      action: 'UPDATE_USER_STATUS',
      targetType: 'User',
      targetId: user._id,
      details: { accountStatus, ownerVerificationStatus, email: user.email },
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const getPendingProperties = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const pending = await Property.find({ approvalStatus: 'pending' })
        .populate('owner', 'name email phone ownerVerificationStatus createdAt')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: pending.length, properties: pending });
    }

    const pending = inMemoryStore.properties.filter((p) => p.approvalStatus === 'pending');
    res.status(200).json({ success: true, count: pending.length, properties: pending });
  } catch (error) {
    next(error);
  }
};

export const getAllPropertiesAdmin = async (req, res, next) => {
  try {
    const { status, purpose, category } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (status) filter.approvalStatus = status;
      if (purpose) filter.purpose = purpose;
      if (category) filter.category = category;

      const properties = await Property.find(filter)
        .populate('owner', 'name email phone ownerVerificationStatus')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: properties.length, properties });
    }

    let properties = inMemoryStore.properties;
    if (status) properties = properties.filter((p) => p.approvalStatus === status);
    if (purpose) properties = properties.filter((p) => p.purpose === purpose);
    if (category) properties = properties.filter((p) => p.category === category);

    res.status(200).json({ success: true, count: properties.length, properties });
  } catch (error) {
    next(error);
  }
};

export const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const property = await Property.findById(id);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

      property.approvalStatus = 'approved';
      property.rejectionReason = '';
      await property.save();

      await AdminAuditLog.create({
        admin: req.user._id,
        action: 'APPROVE_PROPERTY',
        targetType: 'Property',
        targetId: property._id,
        details: { title: property.title },
      });

      return res.status(200).json({ success: true, message: 'Property approved and published to marketplace.', property });
    }

    const property = inMemoryStore.properties.find((p) => p._id.toString() === id.toString());
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    property.approvalStatus = 'approved';
    property.rejectionReason = '';

    inMemoryStore.auditLogs.unshift({
      _id: `66400000000000000000000${inMemoryStore.auditLogs.length + 10}`,
      admin: req.user,
      action: 'APPROVE_PROPERTY',
      targetType: 'Property',
      targetId: id,
      details: { title: property.title },
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'Property approved and published to marketplace.', property });
  } catch (error) {
    next(error);
  }
};

export const rejectProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    if (isDbConnected()) {
      const property = await Property.findById(id);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

      property.approvalStatus = 'rejected';
      property.rejectionReason = rejectionReason.trim();
      await property.save();

      await AdminAuditLog.create({
        admin: req.user._id,
        action: 'REJECT_PROPERTY',
        targetType: 'Property',
        targetId: property._id,
        details: { title: property.title, rejectionReason },
      });

      return res.status(200).json({ success: true, message: 'Property rejected.', property });
    }

    const property = inMemoryStore.properties.find((p) => p._id.toString() === id.toString());
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    property.approvalStatus = 'rejected';
    property.rejectionReason = rejectionReason.trim();

    inMemoryStore.auditLogs.unshift({
      _id: `66400000000000000000000${inMemoryStore.auditLogs.length + 10}`,
      admin: req.user,
      action: 'REJECT_PROPERTY',
      targetType: 'Property',
      targetId: id,
      details: { title: property.title, rejectionReason },
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'Property rejected.', property });
  } catch (error) {
    next(error);
  }
};

export const deletePropertyAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const property = await Property.findById(id);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

      await Property.findByIdAndDelete(id);

      await AdminAuditLog.create({
        admin: req.user._id,
        action: 'DELETE_PROPERTY_MODERATION',
        targetType: 'Property',
        targetId: id,
        details: { title: property.title },
      });

      return res.status(200).json({ success: true, message: 'Property deleted by administrator.' });
    }

    const index = inMemoryStore.properties.findIndex((p) => p._id.toString() === id.toString());
    if (index === -1) return res.status(404).json({ success: false, message: 'Property not found' });

    const prop = inMemoryStore.properties[index];
    inMemoryStore.properties.splice(index, 1);

    inMemoryStore.auditLogs.unshift({
      _id: `66400000000000000000000${inMemoryStore.auditLogs.length + 10}`,
      admin: req.user,
      action: 'DELETE_PROPERTY_MODERATION',
      targetType: 'Property',
      targetId: id,
      details: { title: prop.title },
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'Property deleted by administrator.' });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const logs = await AdminAuditLog.find()
        .populate('admin', 'name email role')
        .sort({ createdAt: -1 })
        .limit(50);
      return res.status(200).json({ success: true, count: logs.length, logs });
    }

    res.status(200).json({
      success: true,
      count: inMemoryStore.auditLogs.length,
      logs: inMemoryStore.auditLogs,
    });
  } catch (error) {
    next(error);
  }
};
