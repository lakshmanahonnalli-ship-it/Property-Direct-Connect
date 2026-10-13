import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import BrowsePropertiesPage from './pages/BrowsePropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import PostPropertyPage from './pages/PostPropertyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoriteProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontSize: '13px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                },
              }}
            />

            {/* Top Navigation */}
            <Navbar />

            {/* Main Application Routes */}
            <main className="flex-grow">
              <Routes>
                {/* Home */}
                <Route path="/" element={<HomePage />} />

                {/* Browse & Filtered Search */}
                <Route path="/properties" element={<BrowsePropertiesPage />} />
                <Route
                  path="/buy"
                  element={<BrowsePropertiesPage defaultPurpose="sale" />}
                />
                <Route
                  path="/rent"
                  element={<BrowsePropertiesPage defaultPurpose="rent" />}
                />
                <Route
                  path="/commercial"
                  element={
                    <BrowsePropertiesPage defaultCategory="Commercial Buildings" />
                  }
                />

                {/* Property Details */}
                <Route path="/properties/:id" element={<PropertyDetailsPage />} />

                {/* Post Property Form */}
                <Route path="/post-property" element={<PostPropertyPage />} />

                {/* Favorites Shortcut */}
                <Route path="/favorites" element={<BuyerDashboardPage />} />

                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Dashboards */}
                <Route path="/dashboard/owner" element={<OwnerDashboardPage />} />
                <Route path="/dashboard/buyer" element={<BuyerDashboardPage />} />
                <Route path="/dashboard/admin" element={<AdminDashboardPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Bottom Footer */}
            <Footer />
          </div>
        </FavoriteProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
