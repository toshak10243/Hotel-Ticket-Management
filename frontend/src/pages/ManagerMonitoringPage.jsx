import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  ShieldAlert,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Eye,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import Swal from 'sweetalert2';

export const ManagerMonitoringPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCriticalRequests = async () => {
    setLoading(true);
    try {
      // Get all requests
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

  // Filter for:
  // 1. High priority unresolved requests
  const highPriorityOpen = requests.filter(
    (r) => r.priority === 'High' && r.status !== 'Resolved' && r.status !== 'Closed'
  );

  // 2. Pending complaints (unassigned / unattended)
  const pendingComplaints = requests.filter(
    (r) => r.requestType === 'Complaint' && (r.status === 'Pending' || r.status === 'Assigned')
  );

  // 3. Resolved requests ready to be closed by manager
  const readyToClose = requests.filter((r) => r.status === 'Resolved');

  const handleEscalate = async (reqId, currentTicket) => {
    const { value: remarks } = await Swal.fire({
      title: `Escalate Ticket ${currentTicket}`,
      input: 'textarea',
      inputLabel: 'Manager Escalation Notice',
      inputPlaceholder: 'Enter urgent instructions for department head...',
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

  const handleClose = async (reqId, currentTicket) => {
    const result = await Swal.fire({
      title: 'Close Ticket?',
      text: `Do you want to confirm final resolution and mark ${currentTicket} as Closed?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'Yes, Close Ticket',
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/requests/${reqId}`, {
          status: 'Closed',
          remarks: '[MANAGER AUDIT]: Verified guest satisfaction and closed ticket.',
        });

        Swal.fire({
          icon: 'success',
          title: 'Ticket Closed',
          text: 'Ticket has been formally closed.',
          timer: 1500,
          showConfirmButton: false,
        });

        fetchCriticalRequests();
      } catch (err) {
        console.error('Close error:', err);
        Swal.fire('Error', 'Failed to close ticket.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manager Oversight & Control</h1>
          <p className="text-sm text-slate-500">
            Escalate unresolved guest issues, audit department SLAs, and formally close resolved tickets.
          </p>
        </div>
        <button
          onClick={fetchCriticalRequests}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Highlights Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-rose-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Urgent / High Priority Open
            </span>
            <AlertOctagon className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{highPriorityOpen.length}</div>
          <p className="text-xs text-slate-500 mt-1">Requires immediate supervisor intervention</p>
        </div>

        <div className="p-5 bg-white border border-amber-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending Complaints
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{pendingComplaints.length}</div>
          <p className="text-xs text-slate-500 mt-1">Complaints awaiting staff assignment</p>
        </div>

        <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Ready to Close
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{readyToClose.length}</div>
          <p className="text-xs text-slate-500 mt-1">Resolved by staff, awaiting manager sign-off</p>
        </div>
      </div>

      {/* Section 1: High Priority Unresolved */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <AlertOctagon className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold text-slate-900">High-Priority & Escalated Tickets</h2>
        </div>

        {highPriorityOpen.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No active high-priority complaints right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Manager Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {highPriorityOpen.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 text-xs">
                      {req.ticketId}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">Room {req.roomNumber}</td>
                    <td className="px-4 py-3 text-xs">{req.category}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">{req.description}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleEscalate(req.id, req.ticketId)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                      >
                        Add Escalation Note
                      </button>
                      <Link
                        to={`/dashboard/requests/${req.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Ready to Close */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Resolved Requests Awaiting Closure</h2>
        </div>

        {readyToClose.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No resolved requests waiting for manager closure.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Assigned Dept</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Manager Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {readyToClose.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 text-xs">
                      {req.ticketId}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">Room {req.roomNumber}</td>
                    <td className="px-4 py-3 text-xs">{req.category}</td>
                    <td className="px-4 py-3 text-xs">{req.assignedDepartment || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleClose(req.id, req.ticketId)}
                        className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                      >
                        Close Ticket
                      </button>
                      <Link
                        to={`/dashboard/requests/${req.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                      >
                        View
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

