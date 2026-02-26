'use client';

import { useState } from 'react';

const STAFF_ROLES = [
  { value: 'Admin', label: 'Admin', description: 'Full org management access' },
  { value: 'Owner', label: 'Owner', description: '' },
  { value: 'Co-Owner', label: 'Co-Owner', description: '' },
  { value: 'CEO', label: 'CEO', description: '' },
  { value: 'Manager', label: 'Manager', description: '' },
  { value: 'Coach', label: 'Coach', description: '' },
  { value: 'Analyst', label: 'Analyst', description: '' },
  { value: 'Content Creator', label: 'Content Creator', description: '' },
  { value: 'Social Media Manager', label: 'Social Media Manager', description: '' },
  { value: 'Staff', label: 'Staff', description: '' },
];

interface AddStaffModalProps {
  onSubmit: (data: { username: string; role: string; department: string }) => void;
  onClose: () => void;
  loading?: boolean;
}

const AddStaffModal = ({ onSubmit, onClose, loading = false }: AddStaffModalProps) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Staff');
  const [department, setDepartment] = useState('');

  const handleSubmit = () => {
    if (!username.trim()) return;
    onSubmit({ username: username.trim(), role, department: department.trim() });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Add Staff Member</h2>

        <div className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Player Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter player's username"
              className="w-full px-4 py-2.5 bg-white/10 rounded-lg border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40"
              autoFocus
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 rounded-lg border border-white/20 text-white text-sm focus:outline-none focus:border-white/40 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}{r.description ? ` - ${r.description}` : ''}
                </option>
              ))}
            </select>
            {role === 'Admin' && (
              <p className="text-yellow-400 text-xs mt-1.5">
                Admin role grants full organization management access including tournaments, teams, and staff.
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">
              Department <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Marketing, Operations"
              className="w-full px-4 py-2.5 bg-white/10 rounded-lg border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-white/10 border border-white/20 text-white py-3 px-4 rounded-lg font-semibold hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !username.trim()}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all"
          >
            {loading ? 'Adding...' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
