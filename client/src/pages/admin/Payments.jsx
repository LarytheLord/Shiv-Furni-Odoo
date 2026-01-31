import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Search, MoreHorizontal, CreditCard, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try { const { data } = await api.get('/payments'); setPayments(data.payments || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = payments.filter(p => p.reference?.toLowerCase().includes(searchQuery.toLowerCase()));
  const fmt = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(a || 0);

  return (
    <div className="page-container">
      <div className="page-header"><div><h1>Payments</h1><p>Track all payments</p></div><button className="btn-primary"><Plus size={18} /><span>Record Payment</span></button></div>
      <div className="filters-bar"><div className="search-box"><Search size={18} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
      <div className="card">
        {loading ? <div className="ls">{[1,2,3,4].map(i => <div key={i} className="sr"><div className="sk sc" /><div className="sk sl" style={{width:'20%'}} /><div className="sk sl" style={{width:'15%'}} /></div>)}</div>
        : filtered.length === 0 ? <div className="es"><div className="ei"><CreditCard size={32} /></div><h3>No payments found</h3><p>Payment records appear here</p></div>
        : <table className="table"><thead><tr><th>Reference</th><th>Type</th><th>Date</th><th>Amount</th><th></th></tr></thead><tbody>
            {filtered.map((p) => {
              const isInbound = p.paymentType === 'INBOUND';
              return (
                <tr key={p.id}>
                  <td><div className="ca"><div className={`av ${isInbound ? 'gn' : 'rd'}`}><CreditCard size={18} /></div><span className="pt">{p.reference}</span></div></td>
                  <td><span className={`tb ${isInbound ? 'in' : 'out'}`}>{isInbound ? <><ArrowDownLeft size={14} /> Received</> : <><ArrowUpRight size={14} /> Sent</>}</span></td>
                  <td><div className="ci"><Calendar size={14} /><span>{new Date(p.paymentDate).toLocaleDateString()}</span></div></td>
                  <td><span className={`am ${isInbound ? 'inc' : 'exp'}`}>{isInbound ? '+':'-'}{fmt(p.amount)}</span></td>
                  <td><button className="ib"><MoreHorizontal size={18} /></button></td>
                </tr>
              );
            })}
          </tbody></table>}
      </div>
      <style>{`
        .page-container { max-width: 1400px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; }
        .page-header p { font-size: 0.9375rem; color: #64748b; margin: 0; }
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 600; color: white; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border: none; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35); }
        .btn-primary:hover { transform: translateY(-2px); }
        .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .search-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; flex: 1; max-width: 400px; }
        .search-box:focus-within { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
        .search-box svg { color: #94a3b8; }
        .search-box input { border: none; outline: none; background: none; font-size: 0.875rem; color: #0f172a; width: 100%; }
        .card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .table td { padding: 1rem 1.5rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .table tbody tr:hover { background: #fafafa; }
        .table tbody tr:last-child td { border-bottom: none; }
        .ca { display: flex; align-items: center; gap: 0.75rem; }
        .av { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .av.gn { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .av.rd { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .pt { font-weight: 500; color: #0f172a; }
        .ci { display: flex; align-items: center; gap: 0.5rem; color: #64748b; }
        .ci svg { color: #94a3b8; }
        .tb { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 6px; }
        .tb.in { background: rgba(16, 185, 129, 0.15); color: #059669; }
        .tb.out { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
        .am { font-family: monospace; font-weight: 600; }
        .am.inc { color: #059669; }
        .am.exp { color: #dc2626; }
        .ib { background: none; border: none; padding: 0.375rem; color: #94a3b8; cursor: pointer; border-radius: 6px; }
        .ib:hover { background: #f1f5f9; color: #475569; }
        .ls { padding: 1rem; }
        .sr { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .sk { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        .sc { width: 38px; height: 38px; border-radius: 10px; }
        .sl { height: 14px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .es { display: flex; flex-direction: column; align-items: center; padding: 4rem 2rem; text-align: center; }
        .ei { width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 1.25rem; }
        .es h3 { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0 0 0.5rem; }
        .es p { font-size: 0.875rem; color: #64748b; margin: 0; }
        @media (max-width: 768px) { .page-header { flex-direction: column; gap: 1rem; } .search-box { max-width: none; } }
      `}</style>
    </div>
  );
}
