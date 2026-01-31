import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Loader2 } from 'lucide-react';
import ListView from '../../../components/ui/ListView';
import api from '../../../api/axios';
import BudgetPieChart from '../../../components/BudgetPieChart';

export default function BudgetList() {
    const navigate = useNavigate();
    const [budgets, setBudgets] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [loading, setLoading] = useState(false);

    // Popover State
    const [chartPopover, setChartPopover] = useState({ visible: false, x: 0, y: 0, budgetId: null, data: null, loading: false });
    const popoverRef = useRef(null);

    const fetchData = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const res = await api.get('/budgets', { params: { page, limit: 10, search } });
            setBudgets(res.data.budgets);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Click outside listener
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setChartPopover(prev => ({ ...prev, visible: false }));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []); // eslint-disable-line

    const handleChartClick = async (e, budget) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        // Toggle if same
        if (chartPopover.visible && chartPopover.budgetId === budget.id) {
            setChartPopover(prev => ({ ...prev, visible: false }));
            return;
        }

        setChartPopover({
            visible: true,
            x: rect.left - 220, // Position to left of button
            y: rect.top - 50,
            budgetId: budget.id,
            loading: true,
            data: null
        });

        try {
            const res = await api.get(`/budgets/${budget.id}/metrics`);
            setChartPopover(prev => ({
                ...prev,
                loading: false,
                data: res.data.totals // Assuming API returns totals
            }));
        } catch (err) {
            console.error('Failed to fetch metrics', err);
            setChartPopover(prev => ({ ...prev, loading: false }));
        }
    };

    const columns = [
        {
            header: 'Budget Name', accessor: 'name', width: '35%', render: (row) => (
                <div onClick={() => navigate(`/admin/budgets/${row.id}`)} className="cursor-pointer">
                    <span className="font-medium text-slate-700 hover:text-accent-600 block">
                        {row.name}
                    </span>
                    {row.description && <span className="text-xs text-slate-400">{row.description}</span>}
                </div>
            )
        },
        {
            header: 'Start Date', accessor: 'dateFrom', width: '15%', render: (row) =>
                new Date(row.dateFrom).toLocaleDateString()
        },
        {
            header: 'End Date', accessor: 'dateTo', width: '15%', render: (row) =>
                new Date(row.dateTo).toLocaleDateString()
        },
        {
            header: 'Status', accessor: 'status', width: '15%', render: (row) => {
                const map = {
                    'DRAFT': 'bg-slate-100 text-slate-600',
                    'CONFIRMED': 'bg-blue-100 text-blue-700',
                    'VALIDATED': 'bg-emerald-100 text-emerald-700',
                    'DONE': 'bg-purple-100 text-purple-700',
                    'CANCELLED': 'bg-red-50 text-red-600'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[row.status] || 'bg-gray-100'}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            header: 'Analysis', accessor: 'chart', width: '10%', render: (row) => (
                <button
                    className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors ${chartPopover.visible && chartPopover.budgetId === row.id ? 'bg-slate-100 text-accent-600' : 'text-slate-400'}`}
                    onClick={(e) => handleChartClick(e, row)}
                >
                    <PieChart size={18} />
                </button>
            )
        }
    ];

    return (
        <div className="relative h-full">
            <ListView
                title="Budgets"
                columns={columns}
                data={budgets}
                pagination={pagination}
                onCreate={() => navigate('/admin/budgets/new')}
                onSearch={(val) => fetchData(1, val)}
            />

            {/* Chart Popover */}
            {chartPopover.visible && (
                <div
                    ref={popoverRef}
                    className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-[280px]"
                    style={{
                        left: `${Math.max(10, chartPopover.x)}px`,
                        top: `${chartPopover.y}px`,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Analysis</h4>
                        {chartPopover.loading && <Loader2 size={14} className="animate-spin text-slate-400" />}
                    </div>

                    {chartPopover.loading ? (
                        <div className="h-[180px] flex items-center justify-center bg-slate-50 rounded-lg">
                            <span className="text-xs text-slate-400">Loading metrics...</span>
                        </div>
                    ) : chartPopover.data ? (
                        <div className="relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                                <span className="text-2xl font-bold text-slate-700">
                                    {chartPopover.data.achievementPercent}%
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase">Achieved</span>
                            </div>
                            <BudgetPieChart
                                budgeted={chartPopover.data.planned}
                                achieved={chartPopover.data.practical}
                                size={180}
                            />
                            <div className="grid grid-cols-2 gap-2 mt-2 text-center">
                                <div className="bg-blue-50 p-2 rounded">
                                    <div className="text-[10px] text-blue-600 uppercase font-semibold">Achieved</div>
                                    <div className="text-sm font-bold text-slate-700">₹{chartPopover.data.practical?.toLocaleString() ?? 0}</div>
                                </div>
                                <div className="bg-red-50 p-2 rounded">
                                    <div className="text-[10px] text-red-600 uppercase font-semibold">Remaining</div>
                                    <div className="text-sm font-bold text-slate-700">₹{chartPopover.data.remaining?.toLocaleString() ?? 0}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-center text-slate-500 py-8">
                            No data available
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
