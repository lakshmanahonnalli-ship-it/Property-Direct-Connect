import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ReportModal = ({ isOpen, onClose, property }) => {
  const [reason, setReason] = useState('Misleading Information');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe why you are reporting this listing.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/reports', {
        propertyId: property._id,
        reason,
        description,
      });

      if (res.data.success) {
        toast.success('Thank you. Listing reported for administrative review.');
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Report Suspicious Listing</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Reporting</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="Misleading Information">Misleading Information</option>
              <option value="Duplicate Listing">Duplicate Listing</option>
              <option value="Fake Owner / Scammer">Fake Owner / Scammer</option>
              <option value="Incorrect Pricing">Incorrect Pricing</option>
              <option value="Already Sold or Rented">Already Sold or Rented</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Explanation</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about why this property should be reviewed or moderated..."
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-500/20 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
