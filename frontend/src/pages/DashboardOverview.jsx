import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Bell,
  AlertTriangle,
  Flame,
  Bed,
  Users,
  Building2,
  PieChart
} from 'lucide-react';
import Swal from 'sweetalert2';

export const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [roomAnalytics, setRoomAnalytics] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [staffWorkload, setStaffWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.stats);
      setRecentRequests(res.data.recentRequests || []);
      setRoomAnalytics(res.data.roomAnalytics || []);
      setDepartmentStats(res.data.departmentStats || []);
      setStaffWorkload(res.data.staffWorkload || []);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // US06: Live staff dashboard with auto-refresh every 10 seconds
    let intervalId = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchStats();
      }, 10000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  // One-tap quick status update (US09)
  const handleQuickStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/requests/${id}`, {
        status: newStatus,
        remarks: `Quick status update to ${newStatus} from dashboard overview.`,
      });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Updated to ${newStatus}`,
        showConfirmButton: false,
        timer: 1500,
      });
      fetchStats();
    } catch (err) {
      console.error('Quick update error:', err);
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  // Trigger 30-min SLA escalation check manually
  const handleCheckEscalations = async () => {
    try {
      const res = await api.post('/requests/check-escalations');
      Swal.fire({
        icon: 'info',
        title: '30-Minute SLA Check',
        text: res.data.message,
        confirmButtonColor: '#2563eb',
      });
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    {
      title: 'Total Requests',
      value: stats?.totalRequests ?? 0,
      icon: ClipboardList,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
    {
      title: 'Pending',
      value: stats?.pendingRequests ?? 0,
      icon: Clock,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressRequests ?? 0,
      icon: TrendingUp,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
    },
    {
      title: 'Resolved',
      value: stats?.resolvedRequests ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'High Priority (Sorted First)',
      value: stats?.highPriorityRequests ?? 0,
      icon: AlertOctagon,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Auto-refresh & SLA Check */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Hotel Operations Dashboard</h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Hotel Arya Niwas operations queue, worker workload cap (Max 5), and repeat complaint analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCheckEscalations}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 shadow-xs transition-colors cursor-pointer"
            title="Check unaddressed requests > 30 minutes"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Check 30m SLA
          </button>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600"
            />
            Auto-Refresh
          </label>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`p-4 rounded-xl border ${card.borderColor} bg-white shadow-xs flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">
                  {loading ? '...' : card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ENTERPRISE LEVEL ANALYTICS: Room Hotspots & Staff Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repeat Complaints & Problem Rooms */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">Room Analytics (Repeat Complaints)</h3>
            </div>
            <span className="text-[11px] text-slate-400">Hotel Maintenance Radar</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {roomAnalytics.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No room data recorded yet.</p>
            ) : (
              roomAnalytics.map((rm) => (
                <div
                  key={rm.roomNumber}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Room {rm.roomNumber}</span>
                    {rm.isHighAttention && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                        Frequent Issues
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {rm.totalIssues} {rm.totalIssues === 1 ? 'ticket' : 'tickets'} logged
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Staff Workload Real-Time Cap (Max 5 Limit) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Staff Workload Capacity (Limit: 5/worker)</h3>
            </div>
            <Link to="/dashboard/staff-management" className="text-[11px] text-blue-600 font-bold hover:underline">
              Manage Staff
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {staffWorkload.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No staff accounts active.</p>
            ) : (
              staffWorkload.map((sw) => (
                <div key={sw.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{sw.name}</span>
                    {sw.isOccupied ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                        Occupied (5/5 Full)
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        {sw.activeCount}/5 Active ({sw.resolvedCount} solved)
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        sw.isOccupied
                          ? 'bg-rose-500'
                          : sw.activeCount >= 3
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${sw.capacityPercent}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Priority Sorted Table Section (US06, US09) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Priority Ranked Service Queue</h2>
            <p className="text-xs text-slate-500">
              Sorted by Priority (High first) with one-tap quick status transitions
            </p>
          </div>
          <Link
            to="/dashboard/requests"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Department Filtering & Full List
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading && recentRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading requests...</div>
        ) : recentRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No active requests found.</div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3">Quick Actions (US09)</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      req.priority === 'High' && req.status !== 'Resolved' && req.status !== 'Closed'
                        ? 'bg-rose-50/40'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-600 text-xs">{req.ticketId}</div>
                      {req.isEscalated && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          SLA Alert (30m)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-bold whitespace-nowrap">
                      Room {req.roomNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">{req.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    {/* One-tap status buttons (US09) */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(req.id, 'InProgress')}
                            className="px-2 py-1 text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded hover:bg-sky-100 cursor-pointer"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {(req.status === 'Pending' || req.status === 'InProgress' || req.status === 'Assigned') && (
                          <button
                            onClick={() => handleQuickStatusUpdate(req.id, 'Resolved')}
                            className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {req.status === 'Resolved' && (
                          <span className="text-xs text-slate-400 italic">Awaiting Manager Sign-Off</span>
                        )}
                        {req.status === 'Closed' && (
                          <span className="text-xs text-slate-400 italic">Ticket Closed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/dashboard/requests/${req.id}`}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
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
