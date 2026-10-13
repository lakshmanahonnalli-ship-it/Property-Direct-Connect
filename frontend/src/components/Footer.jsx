import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldAlert, PhoneCall, Mail, MapPin, Heart, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Safety & Trust Disclaimer Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-14 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-sm space-y-1">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              Buyer & Tenant Safety Advisory
              <span className="text-xs bg-slate-800 text-slate-300 font-normal px-2 py-0.5 rounded-full">Notice</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              PropertyConnect connects buyers and tenants directly with genuine property owners with zero intermediary brokerage. Always physically inspect properties and independently verify legal ownership title deeds with a qualified legal professional before making any financial token or advance payments.
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Property<span className="text-blue-400">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              India's transparent peer-to-peer real estate marketplace. Direct buyer-to-owner connections with zero brokerage, verified contact numbers, and legitimate listings across Karnataka and beyond.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> 100% Direct Owners
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 0% Brokerage Commission
              </span>
            </div>
          </div>

          {/* Quick Browse */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider">Browse Properties</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/buy?category=Houses" className="hover:text-blue-400 transition-colors">
                  Independent Houses
                </Link>
              </li>
              <li>
                <Link to="/buy?category=Apartments" className="hover:text-blue-400 transition-colors">
                  Apartments & Flats
                </Link>
              </li>
              <li>
                <Link to="/buy?category=Residential Plots" className="hover:text-blue-400 transition-colors">
                  Residential Plots / Sites
                </Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-blue-400 transition-colors">
                  Rental Homes
                </Link>
              </li>
              <li>
                <Link to="/commercial" className="hover:text-blue-400 transition-colors">
                  Commercial Shops & Offices
                </Link>
              </li>
              <li>
                <Link to="/buy?category=Agricultural Land" className="hover:text-blue-400 transition-colors">
                  Agricultural Land & Farms
                </Link>
              </li>
            </ul>
          </div>

          {/* For Property Owners */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider">For Property Owners</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/post-property" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
                  Post Your Property (Free)
                </Link>
              </li>
              <li>
                <Link to="/dashboard/owner" className="hover:text-blue-400 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">
                  Owner Login
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Direct WhatsApp Leads</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Document Verification Guide</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider">Support & Legal</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@propertyconnect.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Bengaluru & Hassan, Karnataka</span>
              </li>
              <li className="pt-2">
                <Link to="/terms" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-blue-400 transition-colors">
                  Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PropertyConnect Marketplace. Built as an academic full-stack mini-project.</p>
          <p className="flex items-center gap-1">
            Engineered with React, Node.js, Express, and MongoDB.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
