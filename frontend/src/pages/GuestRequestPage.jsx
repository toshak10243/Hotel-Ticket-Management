import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import {
  Send,
  AlertCircle,
  Bed,
  CheckCircle2,
  Wrench,
  Shield,
  Utensils,
  Sparkles,
  PhoneCall,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const GuestRequestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // US05: Remember room number in sessionStorage
  const [formData, setFormData] = useState(() => {
    const savedRoom = sessionStorage.getItem('arya_room_number') || '';
    return {
      roomNumber: savedRoom,
      category: 'Housekeeping',
      requestType: 'ServiceRequest',
      description: '',
      priority: 'Low',
    };
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roomFromUrl = searchParams.get('room');
    if (roomFromUrl) {
      setFormData((prev) => ({ ...prev, roomNumber: roomFromUrl }));
      sessionStorage.setItem('arya_room_number', roomFromUrl);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'roomNumber') {
        sessionStorage.setItem('arya_room_number', value);
      }
      return updated;
    });
  };

  const handleCategorySelect = (catKey) => {
    setFormData((prev) => ({ ...prev, category: catKey }));
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
      const estimatedTime = response.data.estimatedResponseTime || '30 minutes';

      Swal.fire({
        icon: 'success',
        title: 'Request Registered!',
        text: `Ticket ID: ${createdRequest.ticketId}. Expected response within ${estimatedTime}.`,
        confirmButtonColor: '#2563eb',
      }).then(() => {
        navigate(`/guest/confirmation?ticketId=${createdRequest.ticketId}`, {
          state: { request: createdRequest, estimatedResponseTime: estimatedTime },
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

  // Category Selector Cards with Explicit Text Labels + Icons (Resolves Pilot Guest Confusion Feedback)
  const categoryCards = [
    { id: 'Housekeeping', label: 'Housekeeping', desc: 'Cleaning, linen & towels', icon: Sparkles },
    { id: 'Maintenance', label: 'Maintenance', desc: 'AC, plumbing & electricity', icon: Wrench },
    { id: 'Food', label: 'Food & Dining', desc: 'Room service & beverages', icon: Utensils },
    { id: 'Safety', label: 'Safety & Security', desc: 'Door locks, keycard & safety', icon: Shield },
    { id: 'FrontOffice', label: 'Front Office', desc: 'Luggage & wake-up calls', icon: PhoneCall },
    { id: 'Other', label: 'Other Inquiries', desc: 'General assistance', icon: HelpCircle },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {t('portalTag')}
          </span>
          <span className="text-xs text-slate-500 font-medium">{t('hotelName')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {t('howMayWeHelp')}
        </h1>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          {t('formSubtitle')}
        </p>
      </div>

      {/* Main Request Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Room Number (US05: Session remembered) */}
        <div>
          <label htmlFor="roomNumber" className="block text-sm font-semibold text-slate-800 mb-1.5">
            {t('roomNumber')} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder={t('roomPlaceholder')}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
            />
            <Bed className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {t('roomHelp')}
          </p>
        </div>

        {/* Request Type: Service Request vs Complaint */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            {t('requestType')} <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, requestType: 'ServiceRequest' })}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                formData.requestType === 'ServiceRequest'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">{t('serviceRequest')}</span>
                {formData.requestType === 'ServiceRequest' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{t('serviceDesc')}</p>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, requestType: 'Complaint' })}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                formData.requestType === 'Complaint'
                  ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">{t('complaint')}</span>
                {formData.requestType === 'Complaint' && (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{t('complaintDesc')}</p>
            </button>
          </div>
        </div>

        {/* US02: Category Selector with Clear Text Labels (Week 5 Feedback Solution) */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            {t('categoryDept')} <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categoryCards.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900 leading-tight">
                      {cat.label}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {cat.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            {t('priorityLevel')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Low', label: t('low'), desc: t('lowDesc') },
              { id: 'Medium', label: t('medium'), desc: t('mediumDesc') },
              { id: 'High', label: t('high'), desc: t('highDesc') },
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
            {t('description')} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('descPlaceholder')}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('submitting')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t('submitBtn')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
