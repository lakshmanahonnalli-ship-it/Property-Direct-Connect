import PropertyReport from '../models/PropertyReport.js';
import Property from '../models/Property.js';
import AdminAuditLog from '../models/AdminAuditLog.js';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from '../services/dbStore.js';

export const createReport = async (req, res, next) => {
  try {
    const { propertyId, reason, description, reporterEmail } = req.body;

    if (!propertyId || !reason || !description) {
      return res.status(400).json({ success: false, message: 'Missing report fields' });
    }

    if (isDbConnected()) {
      const property = await Property.findById(propertyId);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

      const report = await PropertyReport.create({
        property: propertyId,
        reporter: req.user ? req.user._id : null,
        reporterEmail: reporterEmail || (req.user ? req.user.email : ''),
        reason,
        description: description.trim(),
        status: 'pending',
      });
      return res.status(201).json({ success: true, message: 'Report submitted.', report });
    }

    const property = inMemoryStore.properties.find((p) => p._id.toString() === propertyId.toString());
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const report = {
      _id: `66500000000000000000000${inMemoryStore.reports.length + 10}`,
      property,
      reporter: req.user ? req.user._id : null,
      reporterEmail: reporterEmail || (req.user ? req.user.email : ''),
      reason,
      description: description.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    inMemoryStore.reports.push(report);

    res.status(201).json({ success: true, message: 'Report submitted.', report });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (status) filter.status = status;
      const reports = await PropertyReport.find(filter)
        .populate('property', 'title price city locality approvalStatus availabilityStatus owner images')
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: reports.length, reports });
    }

    let reports = inMemoryStore.reports;
    if (status) reports = reports.filter((r) => r.status === status);

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isDbConnected()) {
      const report = await PropertyReport.findById(id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

      report.status = status;
      await report.save();

      await AdminAuditLog.create({
        admin: req.user._id,
        action: `REPORT_${status.toUpperCase()}`,
        targetType: 'PropertyReport',
        targetId: report._id,
        details: { status },
      });

      return res.status(200).json({ success: true, message: `Report marked as ${status}`, report });
    }

    const report = inMemoryStore.reports.find((r) => r._id.toString() === id.toString());
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = status;
    inMemoryStore.auditLogs.unshift({
      _id: `66400000000000000000000${inMemoryStore.auditLogs.length + 10}`,
      admin: req.user,
      action: `REPORT_${status.toUpperCase()}`,
      targetType: 'PropertyReport',
      targetId: id,
      details: { status },
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: `Report marked as ${status}`, report });
  } catch (error) {
    next(error);
  }
};
