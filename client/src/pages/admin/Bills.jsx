import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Search, MoreHorizontal, Receipt, Calendar, User, DollarSign } from 'lucide-react';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    try { const { data } = await api.get('/vendor-bills'); setBills(data.bills || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = bills.filter(b => b.reference?.toLowerCase().includes(searchQuery.toLowerCase()) || b.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusStyle = (s) => {
    switch (s) {
      case 'DRAFT': return { bg: 'rgba(100, 116, 139, 0.15)', color: '#475569' };
      case 'POSTED': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' };
      case 'PAID': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#059669' };
      case 'CANCELLED': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' };
      default: return { bg: 'rgba(100, 116, 139, 0.15)', color: '#475569' };
    }
  };

  const fmt = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(a || 0);

  return (
    <div className="page-container">
      <div className="page-header"><div><h1>Vendor Bills</h1><p>Track and manage bills from vendors</p></div><button className="btn-primary"><Plus size={18} /><span>New Bill</span></button></div>
      <div className="filters-bar"><div className="search-box"><Search size={18} /><input type="text" placeholder="Search bills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
      <div className="card">
        {loading ? <div className="loading-skeleton">{[1,2,3,4].map(i => <div key={i} className="skeleton-row"><div className="skeleton skeleton-circle" /><div className="skeleton skeleton-line" style={{width:'20%'}} /><div className="skeleton skeleton-line" style={{width:'15%'}} /><div className="skeleton skeleton-line" style={{width:'15%'}} /></div>)}</div>
        : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon"><Receipt size={32} /></div><h3>No bills found</h3><p>Bills from vendors appear here</p></div>
        : <table className="table"><thead><tr><th>Reference</th><th>Vendor</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>
            {filtered.map((b) => {
              const st = getStatusStyle(b.status);
              return (
                <tr key={b.id}>
                  <td><div className="cell-with-avatar"><div className="avatar red"><Receipt size={18} /></div><span className="primary-text">{b.reference}</span></div></td>
                  <td><div className="cell-with-icon"><User size={14} /><span>{b.vendor?.name || '—'}</span></div></td>
                  <td><div className="cell-with-icon"><Calendar size={14} /><span>{new Date(b.billDate).toLocaleDateString()}</span></div></td>
                  <td><span className="amount expense">{fmt(b.totalAmount)}</span></td>
                  <td><span className="badge" style={{background: st.bg, color: st.color}}>{b.status}</span></td>
                  <td><button className="icon-btn"><MoreHorizontal size={18} /></button></td>
                </tr>
              );
            })}
          </tbody></table>}
      </div>
      <style>{`
        .page-container { max-width: 1400px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; letter-spacing: -0.025em; }
        .page-header p { font-size: 0.9375rem; color: #64748b; margin: 0; }
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 600; color: white; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45); }
        .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .search-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; flex: 1; max-width: 400px; transition: all 0.2s; }
        .search-box:focus-within { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
        .search-box svg { color: #94a3b8; }
        .search-box input { border: none; outline: none; background: none; font-size: 0.875rem; color: #0f172a; width: 100%; }
        .search-box input::placeholder { color: #94a3b8; }
        .card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04); overflow: hidden; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .table td { padding: 1rem 1.5rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .table tbody tr { transition: background 0.15s; }
        .table tbody tr:hover { background: #fafafa; }
        .table tbody tr:last-child td { border-bottom: none; }
        .cell-with-avatar { display: flex; align-items: center; gap: 0.75rem; }
        .avatar { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .avatar.red { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .primary-text { font-weight: 500; color: #0f172a; }
        .cell-with-icon { display: flex; align-items: center; gap: 0.5rem; color: #64748b; }
        .cell-with-icon svg { color: #94a3b8; }
        .amount { font-family: 'SF Mono', Monaco, monospace; font-weight: 600; }
        .amount.expense { color: #dc2626; }
        .badge { display: inline-flex; padding: 0.3rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 6px; }
        .icon-btn { background: none; border: none; padding: 0.375rem; color: #94a3b8; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
        .icon-btn:hover { background: #f1f5f9; color: #475569; }
        .loading-skeleton { padding: 1rem; }
        .skeleton-row { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        .skeleton-circle { width: 38px; height: 38px; border-radius: 10px; }
        .skeleton-line { height: 14px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .empty-state { display: flex; flex-direction: column; align-items: center; padding: 4rem 2rem; text-align: center; }
        .empty-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 1.25rem; }
        .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0 0 0.5rem; }
        .empty-state p { font-size: 0.875rem; color: #64748b; margin: 0; }
        @media (max-width: 768px) { .page-header { flex-direction: column; gap: 1rem; } .search-box { max-width: none; } .table th:nth-child(3), .table td:nth-child(3) { display: none; } }
      `}</style>
    </div>
  );
}
