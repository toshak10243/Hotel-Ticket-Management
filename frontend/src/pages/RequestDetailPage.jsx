import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  Building2,
  Clock,
  Send,
  History,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Shield
} from 'lucide-react';
import Swal from 'sweetalert2';

export const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for updating request
  const [status, setStatus] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [priority, setPriority] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      const data = res.data.request;
      setRequest(data);
      setStatus(data.status);
      setAssignedDepartment(data.assignedDepartment || '');
      setPriority(data.priority);
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
    fetchRequest();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {
        status,
        assignedDepartment: assignedDepartment || null,
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
      {/* Top back navigation */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/requests"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to List
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-xs font-mono font-bold text-slate-700">{request.ticketId}</span>
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
                <span className="text-xs text-slate-400 block font-medium">Created On</span>
                <span className="text-xs text-slate-700 font-medium">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Last Updated</span>
                <span className="text-xs text-slate-700 font-medium">
                  {new Date(request.updatedAt).toLocaleString()}
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
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Audit History Log</h2>
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
                      <span className="text-slate-400 font-normal">
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

        {/* Right Column: Update & Assign Form */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Update Request</h2>
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
                  Assign Department
                </label>
                <select
                  value={assignedDepartment}
                  onChange={(e) => setAssignedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- None / Select Department --</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Room Service">Room Service</option>
                  <option value="Front Office">Front Office</option>
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
                  placeholder="e.g. Assigned to electrician, linen dispatched, issue resolved..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <p className="mt-1 text-xs text-slate-400">
                  This note will be recorded in the audit history.
                </p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60"
              >
                {updating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save & Update Status
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

