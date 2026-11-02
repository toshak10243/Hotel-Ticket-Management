import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Building2,
  Phone,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';

export const RequestManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters (US07: Department-filtered dashboard)
  const [department, setDepartment] = useState('ALL');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status !== 'ALL') params.status = status;
      if (category !== 'ALL') params.category = category;
      if (department !== 'ALL') params.department = department;
      if (priority !== 'ALL') params.priority = priority;

      const res = await api.get('/requests', { params });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [department, status, category, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('ALL');
    setStatus('ALL');
    setCategory('ALL');
    setPriority('ALL');
  };

  // Quick WhatsApp helper for staff dispatch (US14)
  const openWhatsAppDispatch = (req) => {
    const defaultNumber = '919829012345'; // Arya Niwas Duty Staff default
    const message = encodeURIComponent(
      `*Hotel Arya Niwas Dispatch*\nTicket: ${req.ticketId}\nRoom: ${req.roomNumber}\nDept: ${req.assignedDepartment || req.category}\nPriority: ${req.priority}\nIssue: ${req.description}`
    );
    window.open(`https://wa.me/${defaultNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Request & Department Management</h1>
          <p className="text-sm text-slate-500">
            Filter by assigned hotel departments (Housekeeping, Maintenance, Food, Safety), assign staff, and dispatch WhatsApp alerts.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* US07: Quick Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Departments' },
          { id: 'Housekeeping', label: 'Housekeeping' },
          { id: 'Maintenance', label: 'Maintenance' },
          { id: 'Food', label: 'Food & Room Service' },
          { id: 'Safety', label: 'Security & Safety' },
          { id: 'Front Office', label: 'Front Office' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setDepartment(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              department === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Ticket ID (e.g. AN-2026), Room number, or description..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Food">Food & Room Service</option>
              <option value="Safety">Safety & Security</option>
              <option value="FrontOffice">Front Office</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High (Urgent)</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg text-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No requests matched your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Ticket ID</th>
                  <th className="px-4 py-3.5">Room</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Assigned Staff / Dept</th>
                  <th className="px-4 py-3.5">WhatsApp (US14)</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      req.priority === 'High' && req.status !== 'Resolved' && req.status !== 'Closed'
                        ? 'bg-rose-50/30'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 text-xs whitespace-nowrap">
                      {req.ticketId}
                      {req.isEscalated && (
                        <span className="block text-[10px] text-rose-600 font-bold">30m SLA Alert</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-bold whitespace-nowrap">
                      Room {req.roomNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-900">{req.category}</div>
                      <span className="text-[11px] text-slate-500">
                        {req.requestType === 'Complaint' ? 'Complaint' : 'Service'}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-xs text-slate-700" title={req.description}>
                      {req.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {req.assignedToStaff || 'Unassigned Staff'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {req.assignedDepartment || 'No Dept'}
                      </div>
                    </td>
                    {/* US14: WhatsApp notification direct link */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => openWhatsAppDispatch(req)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold cursor-pointer"
                        title="Send alert to Duty Staff WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        WhatsApp
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/dashboard/requests/${req.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
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
