import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart } from 'lucide-react';
import ListView from '../../../components/ui/ListView';

export default function BudgetList() {
    const navigate = useNavigate();

    // Dummy Data
    const [data] = useState([
        { id: 1, name: 'January 2026', startDate: '2026-01-01', endDate: '2026-01-31', status: 'Confirm' },
        { id: 2, name: 'project A (Rev 01 01 2026)', startDate: '2026-02-01', endDate: '2026-02-28', status: 'Revised' },
        { id: 3, name: 'Furniture Expo 2026', startDate: '2026-03-01', endDate: '2026-03-15', status: 'Draft' },
    ]);

    const columns = [
        {
            header: 'Budget Name', accessor: 'name', width: '40%', render: (row) => (
                <span
                    className="font-medium text-slate-700 cursor-pointer hover:text-accent-600"
                    onClick={() => navigate(`/admin/budgets/${row.id}`)}
                >
                    {row.name}
                </span>
            )
        },
        { header: 'Start Date', accessor: 'startDate' },
        { header: 'End Date', accessor: 'endDate' },
        {
            header: 'Status', accessor: 'status', render: (row) => {
                let colorClass = 'bg-gray-100 text-gray-700';
                if (row.status === 'Confirm') colorClass = 'bg-green-100 text-green-700';
                if (row.status === 'Draft') colorClass = 'bg-blue-50 text-blue-600';
                if (row.status === 'Revised') colorClass = 'bg-orange-100 text-orange-700';

                return (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            header: 'Pie Chart', accessor: 'chart', width: '80px', render: () => (
                <button className="text-slate-400 hover:text-accent-600">
                    <PieChart size={18} />
                </button>
            )
        }
    ];

    return (
        <ListView
            title="Budgets"
            columns={columns}
            data={data}
            pagination={{ page: 1, limit: 10, total: 3 }}
            onCreate={() => navigate('/admin/budgets/new')}
            onSearch={(val) => console.log('Search:', val)}
        />
    );
}
