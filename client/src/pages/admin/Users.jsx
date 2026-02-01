import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Search, Filter, MoreHorizontal, Mail, Shield, User, X, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    loginId: '',
    email: '',
    role: 'PORTAL_USER',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Validation Logic
  const validations = {
    loginIdLength: formData.loginId.length >= 6 && formData.loginId.length <= 12,
    passwordLength: formData.password.length > 8,
    passwordUpper: /[A-Z]/.test(formData.password),
    passwordLower: /[a-z]/.test(formData.password),
    passwordSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  };

  // New validation function for the form
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.loginId.trim()) newErrors.loginId = 'Login ID is required';
    else if (!validations.loginIdLength) newErrors.loginId = 'Login ID must be 6-12 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    // Password validation only for creation, not for editing (invitation)
    if (!isEditing) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (!validations.passwordLength) newErrors.password = 'Password must be > 8 characters';
      else if (!validations.passwordUpper) newErrors.password = 'Password needs an uppercase letter';
      else if (!validations.passwordLower) newErrors.password = 'Password needs a lowercase letter';
      else if (!validations.passwordSpecial) newErrors.password = 'Password needs a special character';

      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
      else if (!validations.passwordsMatch) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------------------------------------------------------
   * HANDLERS: Create / Update
   * ------------------------------------------------------------------ */
  const handleCreate = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      loginId: '',
      name: '',
      email: '',
      role: 'PORTAL_USER', // valid default
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setSelectedUser(user);
    setFormData({
      loginId: user.loginId || '',
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'PORTAL_USER',
      password: '', // Passwords are not pre-filled for security
      confirmPassword: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isEditing) {
        // Update user
        await api.patch(`/users/${selectedUser.id}`, formData);
        alert("User updated");
      } else {
        // Create (Invite) user
        // Ensure we send NO password, so backend treats as invite
        await api.post('/users', {
          ...formData,
          password: undefined,
          confirmPassword: undefined,
        });
        alert('User invited successfully! Email sent.');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.loginId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return { bg: '#fee2e2', color: '#b91c1c', label: 'Admin' };
      case 'PORTAL_USER': return { bg: '#dbeafe', color: '#1d4ed8', label: 'Portal User' };
      default: return { bg: '#f1f5f9', color: '#475569', label: role };
    }
  };

  // Helper for password validation UI
  const ValidationItem = ({ valid, text }) => (
    <div className={`validation-item ${valid ? 'valid' : 'invalid'}`}>
      {valid ? <CheckCircle size={14} /> : <XCircle size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="users-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system access and roles</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={24} />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <h3>No users found</h3>
            <p>Get started by adding a new user</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Login ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleStyle = getRoleBadge(user.role);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{user.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{user.loginId || '—'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: roleStyle.bg, color: roleStyle.color }}
                      >
                        {roleStyle.label}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="action-btn">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create User</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="modal-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-body">
                {/* Row 1: Name & Role */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="PORTAL_USER">Portal User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Login ID & Password */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Login ID <span className="hint">(6-12 chars)</span></label>
                    <input
                      type="text"
                      maxLength={12}
                      value={formData.loginId}
                      onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                    />
                    {formData.loginId && (
                      <div className={`field-status ${validations.loginIdLength ? 'valid' : 'invalid'}`}>
                        {validations.loginIdLength ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{formData.loginId.length}/12</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 3: Email & Re-Enter Password */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Email ID</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Re-Enter Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    {formData.confirmPassword && (
                      <div className={`field-status ${validations.passwordsMatch ? 'valid' : 'invalid'}`}>
                        {validations.passwordsMatch ? "Match" : "Mismatch"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <div className="password-requirements">
                    <ValidationItem valid={validations.passwordLength} text="> 8 chars" />
                    <ValidationItem valid={validations.passwordLower} text="Lowercase" />
                    <ValidationItem valid={validations.passwordUpper} text="Uppercase" />
                    <ValidationItem valid={validations.passwordSpecial} text="Special char" />
                  </div>
                )}

              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting || !isFormValid}>
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .users-page { max-width: 1400px; }
        
        /* Shared Styles Reuse from Contacts/Global where possible */
        .page-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; margin: 0; color: #0f172a; }
        .page-subtitle { color: #64748b; margin: 0; font-size: 0.9375rem; }
        
        .btn-primary { 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
            color: white; border: none; padding: 0.75rem 1.25rem; 
            border-radius: 10px; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
            font-weight: 600;
        }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 0.625rem 1rem; border-radius: 8px; cursor: pointer; color: #475569; }

        .filters-bar { margin-bottom: 1.5rem; }
        .search-box { position: relative; max-width: 400px; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border: 1px solid #e2e8f0; border-radius: 10px; }

        .table-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
        
        .user-cell { display: flex; align-items: center; gap: 0.75rem; }
        .user-avatar { width: 36px; height: 36px; background: #6366f1; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .user-name { font-weight: 500; color: #0f172a; }
        
        .badge { padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
        .status-badge { padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.active { background: #d1fae5; color: #059669; }
        .status-badge.inactive { background: #f1f5f9; color: #64748b; }
        
        .action-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.25rem; }
        .action-btn:hover { color: #475569; background: #f1f5f9; border-radius: 4px; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal { background: white; width: 100%; max-width: 700px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 700; margin: 0; }
        .close-btn { background: none; border: none; cursor: pointer; color: #94a3b8; }
        
        .modal-error { margin: 1rem 1.5rem 0; padding: 0.75rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; display: flex; gap: 0.5rem; font-size: 0.875rem; }

        .form-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 500; color: #334155; }
        .form-group .hint { font-size: 0.75rem; color: #94a3b8; font-weight: 400; }
        .form-group input, .form-group select { padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; width: 100%; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
        
        .modal-footer { padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 0.75rem; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .password-requirements { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; background: #f8fafc; padding: 0.75rem; border-radius: 8px; margin-top: -0.5rem; }
        .validation-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #64748b; }
        .validation-item.valid { color: #10b981; }
        .validation-item.invalid { color: #94a3b8; }
        
        .field-status { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; margin-top: 0.25rem; }
        .field-status.valid { color: #10b981; }
        .field-status.invalid { color: #f43f5e; }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
      `}</style>
    </div>
  );
}
