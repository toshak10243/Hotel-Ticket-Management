import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  ShieldAlert,
  AlertOctagon,
  Clock,
  CheckCircle2,
  RefreshCw,
  BellRing,
  CheckCheck
} from 'lucide-react';
import Swal from 'sweetalert2';

export const ManagerMonitoringPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCriticalRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Manager fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriticalRequests();
  }, []);

  // US10: 30-minute escalation alerts and high priority items
  const escalatedOrHigh = requests.filter(
    (r) => (r.priority === 'High' || r.isEscalated) && r.status !== 'Closed'
  );

  // US11: Complaints & requests resolved by staff awaiting formal manager sign-off
  const readyForSignOff = requests.filter((r) => r.status === 'Resolved');

  const handleEscalateNotice = async (reqId, currentTicket) => {
    const { value: remarks } = await Swal.fire({
      title: `Escalate Ticket ${currentTicket}`,
      input: 'textarea',
      inputLabel: 'Manager Escalation Notice',
      inputPlaceholder: 'Enter urgent instructions for department supervisor...',
      inputValidator: (value) => {
        if (!value) {
          return 'Please write an escalation remark.';
        }
      },
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Escalate Immediately',
    });

    if (remarks) {
      try {
        await api.patch(`/requests/${reqId}`, {
          priority: 'High',
          isEscalated: true,
          escalationReason: remarks,
          remarks: `[MANAGER ESCALATION]: ${remarks}`,
        });

        Swal.fire({
          icon: 'success',
          title: 'Ticket Escalated',
          text: 'Priority raised to High and escalation notice logged in history.',
          confirmButtonColor: '#2563eb',
        });

        fetchCriticalRequests();
      } catch (err) {
        console.error('Escalation error:', err);
        Swal.fire('Error', 'Failed to escalate ticket.', 'error');
      }
    }
  };

  // US11: Formal complaint sign-off
  const handleSignOffAndClose = async (reqId, currentTicket) => {
    const result = await Swal.fire({
      title: 'Formal Manager Sign-off',
      text: `Do you confirm resolution quality for ${currentTicket} and execute closure?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'Yes, Sign-Off & Close',
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/requests/${reqId}`, {
          status: 'Closed',
          remarks: '[MANAGER FORMAL SIGN-OFF]: Verified resolution quality and closed complaint.',
        });

        Swal.fire({
          icon: 'success',
          title: 'Sign-off Completed',
          text: 'Ticket has been formally signed off and closed.',
          timer: 1500,
          showConfirmButton: false,
        });

        fetchCriticalRequests();
      } catch (err) {
        console.error('Sign-off error:', err);
        Swal.fire('Error', 'Failed to sign-off ticket.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manager Oversight & Sign-Off</h1>
          <p className="text-sm text-slate-500">
            Monitor 30-minute SLA escalations (US10), assign department supervisors, and execute formal complaint sign-offs (US11).
          </p>
        </div>
        <button
          onClick={fetchCriticalRequests}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Highlights Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-rose-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              30m Escalations & High Priority (US10)
            </span>
            <AlertOctagon className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{escalatedOrHigh.length}</div>
          <p className="text-xs text-slate-500 mt-1">SLA breach or urgent items requiring management attention</p>
        </div>

        <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Awaiting Manager Sign-Off (US11)
            </span>
            <CheckCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{readyForSignOff.length}</div>
          <p className="text-xs text-slate-500 mt-1">Resolved by staff, awaiting final closure validation</p>
        </div>
      </div>

      {/* Section 1: 30-Minute Escalation & High Priority Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <BellRing className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold text-slate-900">30-Minute Escalation Alerts & Urgent Issues</h2>
        </div>

        {escalatedOrHigh.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No escalated or high priority issues currently active.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Assigned Staff</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Manager Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {escalatedOrHigh.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-600 text-xs">{req.ticketId}</span>
                      {req.isEscalated && (
                        <span className="block text-[10px] text-rose-700 font-bold">
                          30m Auto-Escalated
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      Room {req.roomNumber}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{req.category}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap font-medium">
                      {req.assignedToStaff || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEscalateNotice(req.id, req.ticketId)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                      >
                        Add Notice
                      </button>
                      <Link
                        to={`/dashboard/requests/${req.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                      >
                        Assign / Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Manager Sign-off Queue (US11) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Complaint Sign-Off by Manager (US11)</h2>
        </div>

        {readyForSignOff.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No resolved requests waiting for manager sign-off.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Resolved By Staff</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Sign-Off Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {readyForSignOff.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 text-xs whitespace-nowrap">
                      {req.ticketId}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      Room {req.roomNumber}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{req.category}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap font-medium text-slate-700">
                      {req.assignedToStaff || 'Duty Staff'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleSignOffAndClose(req.id, req.ticketId)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Sign-Off & Close
                      </button>
                      <Link
                        to={`/dashboard/requests/${req.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
