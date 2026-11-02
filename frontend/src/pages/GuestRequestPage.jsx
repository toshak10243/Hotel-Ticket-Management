import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import {
  Send,
  Building2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Bed,
  CheckCircle2
} from 'lucide-react';

export const GuestRequestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    roomNumber: '',
    category: 'Housekeeping',
    requestType: 'ServiceRequest',
    description: '',
    priority: 'Low',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roomFromUrl = searchParams.get('room');
    if (roomFromUrl) {
      setFormData((prev) => ({ ...prev, roomNumber: roomFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roomNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Room Number Required',
        text: 'Please specify your hotel room number.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Description Required',
        text: 'Please describe the service you require or the issue you are facing.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/requests', formData);
      const createdRequest = response.data.request;

      Swal.fire({
        icon: 'success',
        title: 'Request Registered!',
        text: `Ticket ID: ${createdRequest.ticketId}. Our staff has been alerted.`,
        confirmButtonColor: '#2563eb',
      }).then(() => {
        navigate(`/guest/confirmation?ticketId=${createdRequest.ticketId}`, {
          state: { request: createdRequest },
        });
      });
    } catch (error) {
      console.error('Submission failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.error || 'Could not connect to the hotel server. Please try again.',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Guest Self-Service Portal
          </span>
          <span className="text-xs text-slate-500 font-medium">Hotel Arya Niwas, Jaipur</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          How May We Assist You Today?
        </h1>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          Submit your room service request or maintenance complaint directly to our hotel department. 
          Our staff receives instant notifications to attend to your room.
        </p>
      </div>

      {/* Main Request Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Room Number */}
        <div>
          <label htmlFor="roomNumber" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Room Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="e.g. 101, 204, 305"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
            <Bed className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            If you scanned the QR code from your room table, this is pre-filled automatically.
          </p>
        </div>

        {/* Request Nature: Request vs Complaint */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Request Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, requestType: 'ServiceRequest' })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                formData.requestType === 'ServiceRequest'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">Service Request</span>
                {formData.requestType === 'ServiceRequest' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Linen, cleaning, amenities, water, food orders</p>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, requestType: 'Complaint' })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                formData.requestType === 'Complaint'
                  ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">Complaint</span>
                {formData.requestType === 'Complaint' && (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Broken appliance, AC issue, plumbing fault, noise</p>
            </button>
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Department / Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
          >
            <option value="Housekeeping">Housekeeping (Cleaning, towels, bed linen, toiletries)</option>
            <option value="Maintenance">Maintenance (Air conditioner, TV, electrical, plumbing)</option>
            <option value="RoomService">Room Service (Food delivery, tea/coffee, cutlery)</option>
            <option value="FrontOffice">Front Office (Wake up calls, luggage assistance, billing)</option>
            <option value="Other">Other / General inquiry</option>
          </select>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Low', label: 'Low', desc: 'Can wait a while' },
              { id: 'Medium', label: 'Medium', desc: 'Standard turnaround' },
              { id: 'High', label: 'High', desc: 'Urgent attention' },
            ].map((p) => (
              <label
                key={p.id}
                className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
                  formData.priority === p.id
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={p.id}
                  checked={formData.priority === p.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{p.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Details / Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please detail your request or describe any issue in detail..."
            required
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

