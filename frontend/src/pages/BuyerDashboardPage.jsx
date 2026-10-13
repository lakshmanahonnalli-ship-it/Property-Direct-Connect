import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Mail,
  User,
  Key,
  Trash2,
  Eye,
  LogOut,
  Phone,
  ShieldCheck,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import { formatPrice, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const BuyerDashboardPage = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { favorites, fetchFavorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('favorites');
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    phoneDisplayConsent: user?.phoneDisplayConsent ?? true,
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/enquiries/my');
        if (res.data.success) {
          setEnquiries(res.data.enquiries);
        }
      } catch (err) {
        console.warn('Buyer data error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await updateProfile(profileData);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    const res = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    if (res?.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Buyer & Tenant Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View saved listings, tracking enquiries and manage your profile
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors w-fit"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'favorites' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Saved Properties ({favorites.length})
          {activeTab === 'favorites' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'enquiries' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Enquiries ({enquiries.length})
          {activeTab === 'enquiries' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'profile' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Account Settings
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-3">
              <Heart className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">You haven't saved any properties yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the heart icon on any property card to save it here for fast access and comparisons.
              </p>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => {
                const prop = fav.property;
                if (!prop) return null;
                const img = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

                return (
                  <div
                    key={fav._id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] bg-slate-100">
                      <img src={img} alt={prop.title} className="w-full h-full object-cover" />
                      <button
                        onClick={() => toggleFavorite(prop)}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-rose-500 text-white shadow-md hover:bg-rose-600"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-blue-600">
                          {formatPrice(prop.price, prop.purpose)} • {prop.city}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                          {prop.title}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Owner: {prop.owner?.name || 'Verified Owner'}
                        </span>
                        <Link
                          to={`/properties/${prop._id}`}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-3">
              <Mail className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No sent enquiries</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you send an enquiry from any property details page, your messages and their progress will appear here.
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
                        Property: {enq.property?.title || 'Property'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Owner: <strong>{enq.property?.owner?.name || 'Owner'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{formatDate(enq.createdAt)}</span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                          enq.enquiryStatus === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : enq.enquiryStatus === 'closed'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {enq.enquiryStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{enq.message}"
                  </p>

                  {enq.property?._id && (
                    <div className="pt-1 flex justify-end">
                      <Link
                        to={`/properties/${enq.property._id}`}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Property Listing
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCOUNT SETTINGS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Update Profile */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-blue-600" />
              Update Contact Profile
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Key className="w-5 h-5 text-indigo-600" />
              Change Account Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboardPage;
