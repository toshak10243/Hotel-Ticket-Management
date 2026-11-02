import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  CheckCircle,
  Copy,
  Clock,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import Swal from 'sweetalert2';

export const RequestConfirmationPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId') || location.state?.request?.ticketId;

  const [request, setRequest] = useState(location.state?.request || null);
  const [loading, setLoading] = useState(!location.state?.request);

  const fetchDetails = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await api.get(`/requests/track/${ticketId}`);
      setRequest(res.data.request);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.state?.request && ticketId) {
      fetchDetails();
    }
  }, [ticketId]);

  const copyTicketId = () => {
    if (ticketId) {
      navigator.clipboard.writeText(ticketId);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Ticket ID copied to clipboard',
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  if (!ticketId) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No Ticket Provided</h2>
        <p className="text-slate-600 text-sm mt-2">
          Please submit a new request or use the tracking page to look up an existing ticket.
        </p>
        <Link
          to="/guest/request"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Submit Request
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Request Successfully Received</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
          Our front desk and maintenance team have received your request and will attend to Room {request?.roomNumber || 'your room'} shortly.
        </p>

        {/* Ticket ID Highlight Box */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Your Ticket ID</span>
            <span className="text-xl font-mono font-bold text-blue-700">{ticketId}</span>
          </div>
          <button
            onClick={copyTicketId}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>
      </div>

      {/* Submitted Details Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Submitted Request Summary</h2>
          <button
            onClick={fetchDetails}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-sm">Loading details...</div>
        ) : request ? (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Room</span>
                <span className="font-semibold text-slate-800 text-sm">Room {request.roomNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Current Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={request.status} />
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Department</span>
                <span className="font-semibold text-slate-800 text-sm">{request.category}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Priority</span>
                <div className="mt-0.5">
                  <PriorityBadge priority={request.priority} />
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block font-medium mb-1">Details & Remarks</span>
              <p className="text-sm text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed">
                {request.description}
              </p>
            </div>

            {request.assignedDepartment && (
              <div className="text-xs text-slate-600 bg-blue-50/60 border border-blue-100 p-3 rounded-lg">
                <span className="font-semibold text-blue-900">Assigned Department: </span>
                {request.assignedDepartment}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm">Could not find request data.</div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <Link
            to={`/guest/track?ticketId=${ticketId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            Live Tracking View
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/guest/request"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Submit Another Request
          </Link>
        </div>
      </div>
    </div>
  );
};

