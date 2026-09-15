'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface User {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
  farmerProfile?: any;
  sellerProfile?: any;
  expertProfile?: any;
  deliveryProfile?: any;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<string>('ACTIVE');
  const [statusReason, setStatusReason] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // Call Center Agent Creation Modal
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentPhone, setAgentPhone] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  const [agentCenter, setAgentCenter] = useState('Central Ops Desk');
  const [creatingAgent, setCreatingAgent] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    let queryParams = '?limit=50';
    if (roleFilter) queryParams += `&role=${roleFilter}`;
    if (statusFilter) queryParams += `&status=${statusFilter}`;

    const res = await apiFetch<User[]>(`/api/v1/admin/users${queryParams}`);

    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data);
    } else {
      setError(res.error || 'Failed to fetch user directory');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    setUpdating(true);

    const res = await apiFetch(`/api/v1/admin/users/${selectedUser.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: newStatus,
        reason: statusReason || 'Admin administrative status update',
      }),
    });

    if (res.success) {
      setToast({
        title: 'Status Updated',
        message: `User ${selectedUser.fullName} set to ${newStatus}`,
        type: 'success',
      });
      setSelectedUser(null);
      setStatusReason('');
      fetchUsers();
    } else {
      setToast({
        title: 'Update Failed',
        message: res.error || 'Failed to update user status',
        type: 'error',
      });
    }

    setUpdating(false);
  };

  const handleCreateCallCenterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAgent(true);

    const res = await apiFetch('/api/v1/admin/users/call-center-agent', {
      method: 'POST',
      body: JSON.stringify({
        phone: agentPhone,
        fullName: agentName,
        email: agentEmail || undefined,
        password: agentPassword,
        callCenterName: agentCenter,
      }),
    });

    if (res.success) {
      setToast({
        title: 'Agent Created',
        message: `Call center agent ${agentName} created successfully`,
        type: 'success',
      });
      setShowAgentModal(false);
      setAgentPhone('');
      setAgentName('');
      setAgentEmail('');
      setAgentPassword('');
      fetchUsers();
    } else {
      setToast({
        title: 'Creation Failed',
        message: res.error || 'Failed to create call center agent',
        type: 'error',
      });
    }

    setCreatingAgent(false);
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge status="success">Active</Badge>;
      case 'SUSPENDED':
        return <Badge status="rejected">Suspended</Badge>;
      case 'PENDING_VERIFICATION':
      case 'SUBMITTED':
        return <Badge status="warning">Pending Verification</Badge>;
      case 'REJECTED':
        return <Badge status="rejected">Rejected</Badge>;
      default:
        return <Badge status="active">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            User Management Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Inspect, filter, and moderate registered platform users across all 5 user roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAgentModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Create Agent
          </Button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <Card className="p-4 border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <TextInput
              label="Search Users"
              placeholder="Search name, phone, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="FARMER">Farmer</option>
              <option value="SELLER">Seller</option>
              <option value="AGRICULTURAL_EXPERT">Expert</option>
              <option value="DELIVERY_PARTNER">Delivery Partner</option>
              <option value="CALL_CENTER_AGENT">Call Center Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="User Directory Unavailable" message={error} onRetry={fetchUsers} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description="No registered users match your search and filter criteria."
          icon={<Users className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone / Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{user.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{user.id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">{user.role}</td>
                    <td className="px-4 py-3">
                      <div>{user.phone}</div>
                      {user.email && <div className="text-[10px] text-slate-400">{user.email}</div>}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link href={`/users/${user.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewStatus(user.status);
                        }}
                      >
                        Moderate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Moderation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Moderate User Account: {selectedUser.fullName}
            </h3>
            <div className="text-xs text-slate-500 space-y-1">
              <div><span className="font-semibold text-slate-700">Role:</span> {selectedUser.role}</div>
              <div><span className="font-semibold text-slate-700">Phone:</span> {selectedUser.phone}</div>
              <div><span className="font-semibold text-slate-700">Current Status:</span> {selectedUser.status}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="ACTIVE">ACTIVE (Authorize Platform Access)</option>
                <option value="SUSPENDED">SUSPENDED (Block Login & Revoke Tokens)</option>
                <option value="REJECTED">REJECTED (Reject Account Registration)</option>
                <option value="DEACTIVATED">DEACTIVATED (Account Closed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Administrative Reason</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Reason for changing status (logged for audit trail)..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Call Center Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateCallCenterAgent} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Create Call Center Agent Account
            </h3>
            <p className="text-xs text-slate-500">
              Provision an authorized call center support agent account with order checkout privileges.
            </p>

            <TextInput
              label="Full Name"
              required
              placeholder="Agent Full Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />

            <TextInput
              label="Phone Number"
              required
              placeholder="+91 9876543210"
              value={agentPhone}
              onChange={(e) => setAgentPhone(e.target.value)}
            />

            <TextInput
              label="Email Address"
              type="email"
              placeholder="agent@farmseva.com"
              value={agentEmail}
              onChange={(e) => setAgentEmail(e.target.value)}
            />

            <TextInput
              label="Account Password"
              type="password"
              required
              placeholder="••••••••"
              value={agentPassword}
              onChange={(e) => setAgentPassword(e.target.value)}
            />

            <TextInput
              label="Call Center Desk / Location"
              required
              placeholder="Central Support Desk - Hyderabad"
              value={agentCenter}
              onChange={(e) => setAgentCenter(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowAgentModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                disabled={creatingAgent}
              >
                {creatingAgent ? 'Provisioning...' : 'Create Agent Account'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
