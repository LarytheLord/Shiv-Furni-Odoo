import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try { const res = await api.get('/analytics/budget-vs-actuals'); setData(res.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fmt = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(a || 0);

  return (
    <div className="page-container">
      <div className="page-header"><h1>Analytics</h1><p>Budget vs Actuals performance</p></div>

      <div className="card chart-card">
        <div className="card-header"><div className="icon orange"><TrendingUp size={20} /></div><h3>Budget vs Actuals</h3></div>
        {loading ? <div className="chart-skeleton"><div className="skeleton" style={{width:'100%',height:'300px'}} /></div>
        : <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="analytical_account" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="budget_amount" fill="#f97316" name="Budget" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>}
      </div>

      <div className="card">
        <div className="card-header"><div className="icon purple"><PieChart size={20} /></div><h3>Breakdown</h3></div>
        {loading ? <div className="ls">{[1,2,3].map(i => <div key={i} className="sr"><div className="sk sl" style={{width:'20%'}} /><div className="sk sl" style={{width:'15%'}} /><div className="sk sl" style={{width:'15%'}} /></div>)}</div>
        : <table className="table"><thead><tr><th>Cost Center</th><th>Budget</th><th>Expense</th><th>Income</th><th>Variance</th><th>Used</th></tr></thead><tbody>
            {data.map((i) => (
              <tr key={i.budget_id}>
                <td><span className="pt">{i.analytical_account}</span></td>
                <td><span className="am">{fmt(i.budget_amount)}</span></td>
                <td><span className="am exp">{fmt(i.actual_expense)}</span></td>
                <td><span className="am inc">{fmt(i.actual_income)}</span></td>
                <td><span className={`am ${i.variance_expense < 0 ? 'exp' : 'inc'}`}>{fmt(i.variance_expense)}</span></td>
                <td><div className="progress"><div className="bar"><div className="fill" style={{width:`${Math.min(i.achievement_expense_pct||0,100)}%`}} /></div><span>{i.achievement_expense_pct?.toFixed(1)}%</span></div></td>
              </tr>
            ))}
          </tbody></table>}
      </div>

      <style>{`
        .page-container { max-width: 1400px; }
        .page-header { margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; }
        .page-header p { font-size: 0.9375rem; color: #64748b; margin: 0; }
        .card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 1.5rem; overflow: hidden; }
        .card-header { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .card-header h3 { font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0; }
        .icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .icon.orange { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
        .icon.purple { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
        .chart-container { padding: 1.5rem; }
        .chart-skeleton { padding: 1.5rem; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .table td { padding: 1rem 1.5rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .table tbody tr:hover { background: #fafafa; }
        .table tbody tr:last-child td { border-bottom: none; }
        .pt { font-weight: 500; color: #0f172a; }
        .am { font-family: monospace; }
        .am.exp { color: #dc2626; }
        .am.inc { color: #059669; }
        .progress { display: flex; align-items: center; gap: 0.75rem; }
        .bar { flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; max-width: 80px; overflow: hidden; }
        .fill { height: 100%; background: linear-gradient(90deg, #f97316, #ea580c); border-radius: 3px; }
        .progress span { font-size: 0.75rem; font-weight: 600; color: #64748b; }
        .ls { padding: 1rem; }
        .sr { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .sk { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        .sl { height: 14px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @media (max-width: 768px) { .bar { display: none; } }
      `}</style>
    </div>
  );
}
