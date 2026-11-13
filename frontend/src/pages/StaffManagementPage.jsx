import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Key,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Edit2,
  Trash2,
  UserCheck,
  Phone,
  Flame,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

export const StaffManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New staff form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff');
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit staff modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('Staff');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await api.post('/users', {
        name,
        email,
        password,
        role,
        phone,
      });

      Swal.fire({
        icon: 'success',
        title: 'Account Created',
        text: `Staff member ${res.data.user.name} created successfully.`,
        confirmButtonColor: '#2563eb',
      });

      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('Staff');
      fetchUsers();
    } catch (err) {
      console.error('Create user error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create User',
        text: err.response?.data?.error || 'Unable to create staff user.',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditPhone(u.phone || '');
    setEditPassword('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);

    try {
      const payload = {
        name: editName,
        email: editEmail,
        role: editRole,
        phone: editPhone,
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      await api.put(`/users/${editingUser.id}`, payload);

      Swal.fire({
        icon: 'success',
        title: 'Updated in Database',
        text: `Account for ${editName} updated successfully in PostgreSQL database!`,
        confirmButtonColor: '#2563eb',
      });

      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Update user error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.error || 'Failed to update user',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (u) => {
    const result = await Swal.fire({
      title: 'Delete User Account?',
      text: `Are you sure you want to remove ${u.name}? This will delete the account from PostgreSQL.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Delete',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/users/${u.id}`);
        Swal.fire('Deleted', 'Account removed from system.', 'success');
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.error || 'Failed to delete user.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Administrator Directory</h1>
          <p className="text-sm text-slate-500">
            Edit staff profiles, modify Admin credentials in PostgreSQL, monitor real-time worker capacity (Max 5 load).
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Directory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create New Staff Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Add New Staff / Admin</h2>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Joshi (Maintenance)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@aryaniwas.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="919829012345"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Initial Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Role Assignment
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Staff">Staff (Department Worker - Max 5 Load)</option>
                <option value="Manager">Manager (Supervise, escalate, sign-off tickets)</option>
                <option value="Admin">Admin (Full database & user edit control)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {creating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Staff Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Staff List with Edit Option & Workload Limit */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Hotel Staff Directory & Workload Load (Max 5)</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Total: {users.length} Users</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading users from PostgreSQL...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Name & Contact</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Active Load (Max 5)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => {
                    const activeCount = u.activeWorkload ?? 0;
                    const isOccupied = u.isOccupied || activeCount >= 5;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                          {u.phone && (
                            <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {u.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              u.role === 'Admin'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : u.role === 'Manager'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.role === 'Staff' ? (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className={`font-bold ${isOccupied ? 'text-rose-600' : 'text-slate-700'}`}>
                                  {activeCount} / 5 Active
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {u.resolvedTotal || 0} solved
                                </span>
                              </div>
                              <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    isOccupied
                                      ? 'bg-rose-500'
                                      : activeCount >= 3
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (activeCount / 5) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Management</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isOccupied && u.role === 'Staff' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <Flame className="w-3 h-3 text-rose-600" />
                              Occupied (Full)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                            title="Edit user details"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* EDIT STAFF / ADMIN MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Edit Account: {editingUser.name}</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name (Updates in DB & UI)
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="919829012345"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (Optional, leave blank to keep existing)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  {updating ? 'Saving Changes...' : 'Save to PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
