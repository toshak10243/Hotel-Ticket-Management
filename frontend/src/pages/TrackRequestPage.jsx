import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  Search,
  History,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TrackRequestPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const [ticketInput, setTicketInput] = useState(searchParams.get('ticketId') || '');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (ticket) => {
    const idToSearch = ticket || ticketInput;
    if (!idToSearch.trim()) {
      setError('Please enter your Ticket ID.');
      return;
    }

    setLoading(true);
    setError('');
    setRequest(null);

    try {
      const res = await api.get(`/requests/track/${idToSearch.trim()}`);
      setRequest(res.data.request);
      setSearchParams({ ticketId: idToSearch.trim() });
    } catch (err) {
      console.error('Track error:', err);
      setError(
        err.response?.data?.error || 'No matching request found. Please verify your Ticket ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialTicket = searchParams.get('ticketId');
    if (initialTicket) {
      setTicketInput(initialTicket);
      handleSearch(initialTicket);
    }
  }, []);

  const getStatusStepIndex = (status) => {
    const steps = ['Pending', 'Assigned', 'InProgress', 'Resolved', 'Closed'];
    return steps.indexOf(status);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('trackTitle')}</h1>
        <p className="mt-1 text-slate-600 text-sm">
          {t('trackSubtitle')}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Enter Ticket ID (e.g. AN-2026-1011)"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Search className="w-4 h-4" />
                {t('trackBtn')}
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {request && (
        <div className="space-y-6">
          {/* Main Request Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {t('ticketRef')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono font-bold text-blue-700">{request.ticketId}</span>
                  {request.isEscalated && (
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Escalated (30-min SLA)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
              </div>
            </div>

            {/* Stepper Timeline Visualizer */}
            <div className="py-6 border-b border-slate-100">
              <div className="grid grid-cols-5 text-center text-xs">
                {['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((step, idx) => {
                  const currentIdx = getStatusStepIndex(request.status);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`font-medium truncate max-w-[70px] sm:max-w-none ${
                          isDone ? 'text-slate-900 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Room Number</span>
                <span className="text-base font-bold text-slate-900">Room {request.roomNumber}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Category</span>
                <span className="text-base font-bold text-slate-900">{request.category}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Assigned Dept</span>
                <span className="text-base font-bold text-slate-900">
                  {request.assignedDepartment || 'Pending Assignment'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Description</span>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-800 text-sm leading-relaxed">
                {request.description}
              </div>
            </div>
          </div>

          {/* Activity / Timestamp Progress Log (Carried-over Sprint 1 to Sprint 2 requirement) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">{t('progressLog')}</h2>
            </div>

            {request.history && request.history.length > 0 ? (
              <div className="space-y-4">
                {request.history.map((hist, index) => (
                  <div
                    key={hist.id || index}
                    className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/60"
                  >
                    <div className="w-2 rounded-full bg-blue-500 shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">
                          Status: <span className="text-blue-600 font-bold">{hist.newStatus}</span>
                        </span>
                        <span className="font-mono">{new Date(hist.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">
                        {hist.remarks || 'Status updated by hotel personnel.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No history updates logged yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
