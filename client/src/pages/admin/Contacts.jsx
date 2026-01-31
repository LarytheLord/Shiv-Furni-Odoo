import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, User, X, Loader2 } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', type: 'CUSTOMER', email: '', phone: '' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/contacts');
      setContacts(data.contacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contacts', formData);
      setShowModal(false);
      setFormData({ name: '', type: 'CUSTOMER', email: '', phone: '' });
      fetchContacts();
    } catch (err) {
      alert('Failed to create contact');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'CUSTOMER': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
      case 'VENDOR': return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' };
      case 'BOTH': return { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' };
      default: return { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' };
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Contacts</h1>
          <p>Manage your customers, vendors, and business contacts</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-secondary">
          <Filter size={16} />
          <span>Filters</span>
        </button>
      </div>

      {/* Contacts Table */}
      <div className="card">
        {loading ? (
          <div className="loading-skeleton">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-row">
                <div className="skeleton skeleton-circle" />
                <div className="skeleton skeleton-line" style={{ width: '30%' }} />
                <div className="skeleton skeleton-line" style={{ width: '15%' }} />
                <div className="skeleton skeleton-line" style={{ width: '25%' }} />
                <div className="skeleton skeleton-line" style={{ width: '15%' }} />
              </div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><User size={32} /></div>
            <h3>No contacts found</h3>
            <p>Get started by adding your first contact</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              <span>Add Contact</span>
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Type</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => {
                const typeStyle = getTypeColor(contact.type);
                return (
                  <tr key={contact.id}>
                    <td>
                      <div className="cell-with-avatar">
                        <div className="avatar">{contact.name?.[0]?.toUpperCase() || 'C'}</div>
                        <span className="primary-text">{contact.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: typeStyle.bg, color: typeStyle.color }}>
                        {contact.type?.toLowerCase()}
                      </span>
                    </td>
                    <td>
                      <div className="cell-with-icon">
                        <Mail size={14} />
                        <span>{contact.email || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-with-icon">
                        <Phone size={14} />
                        <span>{contact.phone || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${contact.isActive ? 'active' : 'inactive'}`}>
                        {contact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="icon-btn"><MoreHorizontal size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Contact</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input type="text" required placeholder="Enter contact name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Type</label>
                  <div className="input-wrapper">
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                      <option value="CUSTOMER">Customer</option>
                      <option value="VENDOR">Vendor</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input type="text" placeholder="+91 12345 67890" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <><Loader2 size={18} className="spin" /><span>Saving...</span></> : <><Plus size={18} /><span>Add Contact</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Page Layout */
        .page-container { max-width: 1400px; }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem;
          letter-spacing: -0.025em;
        }

        .page-header p {
          font-size: 0.9375rem;
          color: #64748b;
          margin: 0;
        }

        /* Buttons */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
        }

        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Filters Bar */
        .filters-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          flex: 1;
          max-width: 400px;
          transition: all 0.2s;
        }

        .search-box:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        .search-box svg { color: #94a3b8; flex-shrink: 0; }

        .search-box input {
          border: none;
          outline: none;
          background: none;
          font-size: 0.875rem;
          color: #0f172a;
          width: 100%;
        }

        .search-box input::placeholder { color: #94a3b8; }

        /* Card */
        .card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        /* Table */
        .table { width: 100%; border-collapse: collapse; }

        .table th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .table td {
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .table tbody tr { transition: background 0.15s; }
        .table tbody tr:hover { background: #fafafa; }
        .table tbody tr:last-child td { border-bottom: none; }

        .cell-with-avatar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .primary-text { font-weight: 500; color: #0f172a; }

        .cell-with-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
        }

        .cell-with-icon svg { color: #94a3b8; }

        .badge {
          display: inline-flex;
          padding: 0.3rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          text-transform: capitalize;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.3rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
        }

        .status-badge.active { background: rgba(16, 185, 129, 0.15); color: #059669; }
        .status-badge.inactive { background: rgba(100, 116, 139, 0.15); color: #64748b; }

        .icon-btn {
          background: none;
          border: none;
          padding: 0.375rem;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .icon-btn:hover { background: #f1f5f9; color: #475569; }

        /* Loading & Empty State */
        .loading-skeleton { padding: 1rem; }

        .skeleton-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .skeleton-circle { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; }
        .skeleton-line { height: 14px; }

        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.7);
          margin-bottom: 1.25rem;
        }

        .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0 0 0.5rem; }
        .empty-state p { font-size: 0.875rem; color: #64748b; margin: 0 0 1.5rem; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }

        .modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }

        .close-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-btn:hover { background: #f1f5f9; color: #475569; }

        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 500; color: #334155; }

        .input-wrapper { position: relative; }

        .input-wrapper .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .input-wrapper input,
        .input-wrapper select {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.875rem;
          font-size: 0.9375rem;
          color: #0f172a;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .input-wrapper select { padding-left: 1rem; }
        .input-wrapper input::placeholder { color: #94a3b8; }

        .input-wrapper input:focus,
        .input-wrapper select:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 1rem; }
          .filters-bar { flex-direction: column; align-items: stretch; }
          .search-box { max-width: none; }
          .table th:nth-child(3), .table td:nth-child(3),
          .table th:nth-child(4), .table td:nth-child(4) { display: none; }
        }
      `}</style>
    </div>
  );
}
