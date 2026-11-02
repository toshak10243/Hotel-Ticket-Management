import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  History,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

export const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for updating request (US08: Manager assignment of tickets)
  const [status, setStatus] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [assignedToStaff, setAssignedToStaff] = useState('');
  const [priority, setPriority] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequestAndStaff = async () => {
    setLoading(true);
    try {
      const [reqRes, usersRes] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get('/users').catch(() => ({ data: { users: [] } })),
      ]);

      const data = reqRes.data.request;
      setRequest(data);
      setStatus(data.status);
      setAssignedDepartment(data.assignedDepartment || '');
      setAssignedToStaff(data.assignedToStaff || '');
      setPriority(data.priority);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Fetch request error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load request details',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestAndStaff();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {
        status,
        assignedDepartment: assignedDepartment || null,
        assignedToStaff: assignedToStaff || null,
        priority,
        remarks: remarks.trim() || undefined,
      };

      const res = await api.patch(`/requests/${id}`, payload);
      setRequest(res.data.request);
      setRemarks('');

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Request updated & history logged',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      console.error('Update request error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.error || 'Failed to update request',
      });
    } finally {
      setUpdating(false);
    }
  };

  // US11: Complaint sign-off by manager
  const handleManagerSignOff = async () => {
    const result = await Swal.fire({
      title: 'Formal Manager Sign-off',
      text: `Confirm that ticket ${request.ticketId} has been verified with guest satisfaction and mark as Closed?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'Sign-Off & Close Ticket',
    });

    if (result.isConfirmed) {
      try {
        const res = await api.patch(`/requests/${id}`, {
          status: 'Closed',
          remarks: '[MANAGER FORMAL SIGN-OFF]: Inspected work, verified satisfaction with guest, and closed ticket.',
        });
        setRequest(res.data.request);
        setStatus('Closed');
        Swal.fire('Signed Off', 'Ticket has been formally signed off and closed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Sign-off failed.', 'error');
      }
    }
  };

  // US14: WhatsApp dispatch
  const handleWhatsAppAlert = () => {
    const defaultNumber = '919829012345';
    const message = encodeURIComponent(
      `*Hotel Arya Niwas Staff Alert*\nTicket: ${request.ticketId}\nRoom: ${request.roomNumber}\nDept: ${request.assignedDepartment || request.category}\nStaff: ${request.assignedToStaff || 'Duty Attendant'}\nIssue: ${request.description}\nStatus: ${request.status}`
    );
    window.open(`https://wa.me/${defaultNumber}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading request details...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-800">Request Not Found</h2>
        <Link to="/dashboard/requests" className="mt-4 inline-block text-xs font-semibold text-blue-600">
          ← Back to Requests List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation & WhatsApp trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/requests"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-xs font-mono font-bold text-slate-700">{request.ticketId}</span>
        </div>

        <button
          onClick={handleWhatsAppAlert}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          Send WhatsApp to Staff (US14)
        </button>
      </div>

      {/* Main Grid: Details Left, Update Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Ticket ID
                </span>
                <span className="text-2xl font-mono font-bold text-blue-700">{request.ticketId}</span>
                {request.isEscalated && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    Auto-Escalated: 30-Minute SLA Breach
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Room</span>
                <span className="text-base font-bold text-slate-900">Room {request.roomNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Category</span>
                <span className="text-sm font-semibold text-slate-800">{request.category}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Request Type</span>
                <span className="text-sm font-semibold text-slate-800">
                  {request.requestType === 'Complaint' ? 'Complaint' : 'Service Request'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Assigned Department</span>
                <span className="text-sm font-semibold text-slate-800">
                  {request.assignedDepartment || 'Not assigned'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Assigned Staff (US08)</span>
                <span className="text-sm font-bold text-blue-700">
                  {request.assignedToStaff || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Logged Timestamp</span>
                <span className="text-xs text-slate-700 font-mono">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Guest Description
              </span>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                {request.description}
              </div>
            </div>

            {/* US11: Manager Sign-off Action banner if Resolved */}
            {request.status === 'Resolved' && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Task Completed by Staff (Awaiting Sign-off)
                    </span>
                    <span className="text-xs text-emerald-700">
                      As Manager, inspect resolution and execute formal complaint closure.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleManagerSignOff}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs whitespace-nowrap cursor-pointer"
                >
                  Sign-Off & Close (US11)
                </button>
              </div>
            )}
          </div>

          {/* Audit History Timeline with Timestamp log (Carried over sprint work) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Audit History & Timestamp Log</h2>
            </div>

            <div className="space-y-3">
              {request.history && request.history.length > 0 ? (
                request.history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>
                        Status: <span className="text-slate-500">{h.previousStatus}</span> →{' '}
                        <span className="text-blue-600 font-bold">{h.newStatus}</span>
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(h.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {h.remarks && (
                      <p className="text-slate-700 font-medium pt-1 border-t border-slate-200/50 mt-1">
                        {h.remarks}
                      </p>
                    )}
                    {h.updatedBy && (
                      <div className="text-slate-400 pt-0.5">
                        Updated by: <span className="font-semibold text-slate-600">{h.updatedBy.name}</span> ({h.updatedBy.role})
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No history records logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Update & Assign Form (US08 Manager Assignment Screen) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Assign & Update (US08)</h2>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Status Update */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Department Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={assignedDepartment}
                  onChange={(e) => setAssignedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- None / Select Department --</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Food & Room Service">Food & Room Service</option>
                  <option value="Security & Safety">Security & Safety</option>
                  <option value="Front Office">Front Office</option>
                </select>
              </div>

              {/* US08: Specific Staff Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Staff Member (US08)
                </label>
                <select
                  value={assignedToStaff}
                  onChange={(e) => setAssignedToStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Unassigned Staff --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                  <option value="Amit Kumar (Housekeeping)">Amit Kumar (Housekeeping)</option>
                  <option value="Vikram Singh (Maintenance)">Vikram Singh (Maintenance)</option>
                  <option value="Duty Attendant">Duty Attendant</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High (Urgent)</option>
                </select>
              </div>

              {/* Staff Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Staff Remarks / Resolution Note
                </label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Assigned to Vikram, dispatched fresh linens, repairs underway..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <p className="mt-1 text-xs text-slate-400">
                  Logged in audit history with your account name and time.
                </p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {updating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save & Update Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
