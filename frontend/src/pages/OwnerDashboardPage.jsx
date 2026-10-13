import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Tag,
  Mail,
  PlusCircle,
  Trash2,
  Edit3,
  Eye,
  Phone,
  MessageCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deletePropertyId, setDeletePropertyId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [propsRes, enqRes] = await Promise.all([
        api.get('/properties/my-listings'),
        api.get('/enquiries/received'),
      ]);

      if (propsRes.data.success) {
        setProperties(propsRes.data.properties);
      }
      if (enqRes.data.success) {
        setEnquiries(enqRes.data.enquiries);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Summary Metrics calculations
  const totalListings = properties.length;
  const pendingListings = properties.filter((p) => p.approvalStatus === 'pending').length;
  const approvedListings = properties.filter((p) => p.approvalStatus === 'approved').length;
  const rejectedListings = properties.filter((p) => p.approvalStatus === 'rejected').length;
  const closedListings = properties.filter((p) => p.availabilityStatus !== 'available').length;
  const totalEnquiries = enquiries.length;

  // Toggle Availability Status (e.g. available <-> sold/rented)
  const handleToggleAvailability = async (id, currentStatus, purpose) => {
    const nextStatus = currentStatus === 'available' ? (purpose === 'rent' ? 'rented' : 'sold') : 'available';
    try {
      const res = await api.patch(`/properties/${id}/availability`, {
        availabilityStatus: nextStatus,
      });
      if (res.data.success) {
        toast.success(`Property marked as ${nextStatus.toUpperCase()}`);
        setProperties((prev) =>
          prev.map((p) => (p._id === id ? { ...p, availabilityStatus: nextStatus } : p))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  // Delete Property Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletePropertyId) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/properties/${deletePropertyId}`);
      if (res.data.success) {
        toast.success('Property deleted successfully.');
        setProperties((prev) => prev.filter((p) => p._id !== deletePropertyId));
        setDeletePropertyId(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeleting(false);
    }
  };

  // Update Enquiry Status
  const handleEnquiryStatusChange = async (enquiryId, status) => {
    try {
      const res = await api.patch(`/enquiries/${enquiryId}/status`, { enquiryStatus: status });
      if (res.data.success) {
        toast.success(`Enquiry marked as ${status}`);
        setEnquiries((prev) =>
          prev.map((e) => (e._id === enquiryId ? { ...e, enquiryStatus: status } : e))
        );
      }
    } catch (err) {
      toast.error('Could not update enquiry status');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading owner portal..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Owner Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome, {user?.name || 'Property Owner'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your real estate listings, approval status, and buyer enquiries
          </p>
        </div>

        <Link
          to="/post-property"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Property</span>
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalListings}</div>
          <p className="text-[10px] text-slate-500">Your total submissions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingListings}</div>
          <p className="text-[10px] text-slate-500">In review by admin</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{approvedListings}</div>
          <p className="text-[10px] text-slate-500">Public marketplace</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{rejectedListings}</div>
          <p className="text-[10px] text-slate-500">Requires correction</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sold/Rented</span>
            <Tag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{closedListings}</div>
          <p className="text-[10px] text-slate-500">Deals completed</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Enquiries</span>
            <Mail className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">{totalEnquiries}</div>
          <p className="text-[10px] text-slate-500">Direct buyer messages</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('properties')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'properties' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Properties ({totalListings})
          {activeTab === 'properties' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'enquiries' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Received Enquiries ({totalEnquiries})
          {activeTab === 'enquiries' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: MY PROPERTIES */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          {properties.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-4">
              <Building className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">You haven't posted any properties yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ready to sell or rent out your property without paying commission? Post your first listing for free.
              </p>
              <Link
                to="/post-property"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your First Property</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {properties.map((prop) => {
                const img = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';
                return (
                  <div
                    key={prop._id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-xs hover:shadow-md transition-shadow"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={img}
                        alt={prop.title}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Approval Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              prop.approvalStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prop.approvalStatus === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {prop.approvalStatus}
                          </span>

                          {/* Availability Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              prop.availabilityStatus === 'available'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {prop.availabilityStatus}
                          </span>

                          <span className="text-[10px] text-slate-400">
                            Posted {formatDate(prop.createdAt)}
                          </span>
                        </div>

                        <Link
                          to={`/properties/${prop._id}`}
                          className="font-bold text-slate-900 text-base line-clamp-1 hover:text-blue-600 transition-colors"
                        >
                          {prop.title}
                        </Link>

                        <div className="text-xs font-semibold text-slate-700">
                          {formatPrice(prop.price, prop.purpose)} •{' '}
                          <span className="text-slate-500 font-normal">
                            {prop.locality ? `${prop.locality}, ` : ''}{prop.city}
                          </span>
                        </div>

                        {/* Rejection reason explanation */}
                        {prop.approvalStatus === 'rejected' && prop.rejectionReason && (
                          <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-100 flex items-start gap-1.5 mt-1">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                            <span>
                              <strong>Rejection Reason:</strong> {prop.rejectionReason}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* Toggle Sold/Rented */}
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(prop._id, prop.availabilityStatus, prop.purpose)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                            prop.availabilityStatus === 'available'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {prop.availabilityStatus === 'available'
                            ? `Mark as ${prop.purpose === 'rent' ? 'Rented' : 'Sold'}`
                            : 'Mark as Available'}
                        </button>

                        {/* View Button */}
                        <Link
                          to={`/properties/${prop._id}`}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View public details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletePropertyId(prop._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECEIVED ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-3">
              <Mail className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No buyer enquiries received yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When buyers or tenants submit an inquiry form for any of your properties, their message and phone number will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {enquiries.map((enq) => (
                <div
                  key={enq._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Enquiry from {enq.buyerName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        For property: <strong>{enq.property?.title || 'Property'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(enq.createdAt)}</span>
                      <select
                        value={enq.enquiryStatus}
                        onChange={(e) => handleEnquiryStatusChange(enq._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          enq.enquiryStatus === 'contacted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : enq.enquiryStatus === 'closed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{enq.message}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        {enq.buyerPhone}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        {enq.buyerEmail}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${enq.buyerPhone}`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call Buyer
                      </a>
                      <a
                        href={`https://wa.me/91${enq.buyerPhone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletePropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Delete Property Listing?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete this listing and its enquiries? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletePropertyId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
