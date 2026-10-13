import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Building,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Trash2,
  Eye,
  Check,
  X,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingListings: 0,
    approvedListings: 0,
    rejectedListings: 0,
    reportedProperties: 0,
    totalEnquiries: 0,
  });

  // Data sets
  const [pendingListings, setPendingListings] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Rejection modal
  const [rejectModalProperty, setRejectModalProperty] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, allPropsRes, reportsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/properties/pending'),
        api.get('/admin/properties'),
        api.get('/reports/admin'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (pendingRes.data.success) {
        setPendingListings(pendingRes.data.properties);
      }
      if (allPropsRes.data.success) {
        setAllProperties(allPropsRes.data.properties);
      }
      if (reportsRes.data.success) {
        setReports(reportsRes.data.reports);
      }
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
      if (logsRes.data.success) {
        setAuditLogs(logsRes.data.logs);
      }
    } catch (err) {
      toast.error('Failed to load administrator console data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Approve Property
  const handleApprove = async (propertyId) => {
    try {
      setProcessing(true);
      const res = await api.patch(`/admin/properties/${propertyId}/approve`);
      if (res.data.success) {
        toast.success('Property approved and published to marketplace!');
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve property');
    } finally {
      setProcessing(false);
    }
  };

  // Reject Property
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalProperty || !rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      const res = await api.patch(`/admin/properties/${rejectModalProperty._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res.data.success) {
        toast.success('Property listing rejected.');
        setRejectModalProperty(null);
        setRejectionReason('');
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject property');
    } finally {
      setProcessing(false);
    }
  };

  // Delete Fraudulent Property
  const handleDeleteFraud = async (propertyId) => {
    if (!window.confirm('Are you sure you want to remove this listing for violation or fraud?')) return;
    try {
      const res = await api.delete(`/admin/properties/${propertyId}`);
      if (res.data.success) {
        toast.success('Property removed by moderator.');
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to remove property.');
    }
  };

  // Resolve Report
  const handleResolveReport = async (reportId, status) => {
    try {
      const res = await api.patch(`/reports/admin/${reportId}`, { status });
      if (res.data.success) {
        toast.success(`Report marked as ${status}`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to update report status.');
    }
  };

  // Toggle User Suspension
  const handleToggleSuspendUser = async (targetUser) => {
    const newStatus = targetUser.accountStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/status`, {
        accountStatus: newStatus,
      });
      if (res.data.success) {
        toast.success(`User account marked as ${newStatus}`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Toggle Verified Owner Status
  const handleToggleVerifyOwner = async (targetUser) => {
    const newStatus = targetUser.ownerVerificationStatus === 'verified' ? 'unverified' : 'verified';
    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/status`, {
        ownerVerificationStatus: newStatus,
      });
      if (res.data.success) {
        toast.success(`User verification status set to ${newStatus}`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to update verification status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500">
          Only authorized platform administrators may access this console.
        </p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading administrator moderation console..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">System Moderation & Audit</h1>
          <p className="text-xs text-slate-400">
            Real-time control over pending listings, reports, users, and compliance logs
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 w-fit"
        >
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
          <div className="text-xl font-black text-slate-900">{stats.totalUsers}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Listings</span>
          <div className="text-xl font-black text-slate-900">{stats.totalProperties}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Pending</span>
          <div className="text-xl font-black text-amber-600">{stats.pendingListings}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Approved</span>
          <div className="text-xl font-black text-emerald-600">{stats.approvedListings}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Rejected</span>
          <div className="text-xl font-black text-rose-600">{stats.rejectedListings}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Reports</span>
          <div className="text-xl font-black text-rose-600">{stats.reportedProperties}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Enquiries</span>
          <div className="text-xl font-black text-purple-600">{stats.totalEnquiries}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 transition-colors relative shrink-0 ${
            activeTab === 'pending' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Submissions ({pendingListings.length})
          {activeTab === 'pending' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('all-properties')}
          className={`pb-3 transition-colors relative shrink-0 ${
            activeTab === 'all-properties' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Listings ({allProperties.length})
          {activeTab === 'all-properties' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 transition-colors relative shrink-0 ${
            activeTab === 'reports' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Flagged Reports ({reports.length})
          {activeTab === 'reports' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors relative shrink-0 ${
            activeTab === 'users' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          User Accounts ({usersList.length})
          {activeTab === 'users' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors relative shrink-0 ${
            activeTab === 'audit' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Logs ({auditLogs.length})
          {activeTab === 'audit' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: PENDING SUBMISSIONS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No pending submissions</h3>
              <p className="text-xs text-slate-500">All submitted properties have been reviewed and moderated.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingListings.map((prop) => (
                <div
                  key={prop._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between shadow-xs"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={prop.images?.[0]?.url}
                      alt={prop.title}
                      className="w-24 h-24 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                          Pending Review
                        </span>
                        <span className="text-xs font-semibold text-blue-600">
                          {formatPrice(prop.price, prop.purpose)}
                        </span>
                        <span className="text-xs text-slate-400">• {prop.category}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{prop.title}</h4>
                      <p className="text-xs text-slate-500">
                        Location: {prop.address}, {prop.city}
                      </p>
                      <p className="text-xs text-slate-500">
                        Owner: <strong>{prop.owner?.name}</strong> ({prop.owner?.phone || 'No phone'}) •{' '}
                        {prop.owner?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <Link
                      to={`/properties/${prop._id}`}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Link>

                    <button
                      onClick={() => handleApprove(prop._id)}
                      disabled={processing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>

                    <button
                      onClick={() => {
                        setRejectModalProperty(prop);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL PROPERTIES */}
      {activeTab === 'all-properties' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allProperties.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{prop.title}</div>
                      <span className="text-[10px] text-slate-400">{prop.propertyType}</span>
                    </td>
                    <td className="p-4">{prop.city}</td>
                    <td className="p-4 font-bold text-slate-900">{formatPrice(prop.price, prop.purpose)}</td>
                    <td className="p-4">
                      <div>{prop.owner?.name || 'Owner'}</div>
                      <span className="text-[10px] text-slate-400">{prop.owner?.email}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          prop.approvalStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prop.approvalStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prop.approvalStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/properties/${prop._id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 inline-block"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteFraud(prop._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 inline-block"
                        title="Delete fraudulent listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FLAGGED REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No active reports</h3>
              <p className="text-xs text-slate-500">There are no flagged property listings currently awaiting review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Reason: {rep.reason}
                      </h4>
                    </div>
                    <span
                      className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        rep.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rep.status === 'dismissed'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{rep.description}"
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <div>
                      Reported property: <strong>{rep.property?.title || 'Property'}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep._id, 'resolved')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep._id, 'dismissed')}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Owner Verification</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-4 uppercase font-bold text-[10px] text-slate-500">{u.role}</td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.ownerVerificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.ownerVerificationStatus || 'unverified'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.accountStatus === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {u.role === 'owner' && (
                        <button
                          onClick={() => handleToggleVerifyOwner(u)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100"
                        >
                          {u.ownerVerificationStatus === 'verified' ? 'Revoke Verification' : 'Verify Owner'}
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleSuspendUser(u)}
                        disabled={u._id === user._id}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                          u.accountStatus === 'active'
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        } disabled:opacity-30`}
                      >
                        {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Administrative Action Audit Trail</h3>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log._id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 mr-2">
                    {log.action}
                  </span>
                  <span className="text-slate-700 font-medium">
                    {log.targetType} {log.targetId ? `(${log.targetId})` : ''}
                  </span>
                  {log.details && (
                    <span className="text-slate-500 block sm:inline sm:ml-2">
                      • {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </span>
                  )}
                </div>
                <div className="text-slate-400 shrink-0 text-[11px]">{formatDate(log.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Specify Rejection Reason</h3>
              <button
                onClick={() => setRejectModalProperty(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Please enter the specific reason why "{rejectModalProperty.title}" is being rejected so the owner can correct it.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please provide clear exterior photographs of the property and verify the exact street address."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalProperty(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
                >
                  {processing ? 'Submitting...' : 'Reject Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
