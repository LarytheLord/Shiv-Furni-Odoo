import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../components/ui/ListView';

export default function AnalyticAccountList() {
    const navigate = useNavigate();

    const [data] = useState([
        { id: 1, name: 'Deepawali', reference: 'ANA-001', customer: 'Azure Interior', balance: -16350 },
        { id: 2, name: 'Marriage Session 2026', reference: 'ANA-002', customer: 'Gemini', balance: 0 },
    ]);

    const columns = [
        {
            header: 'Name', accessor: 'name', render: (row) => (
                <span
                    className="font-medium text-slate-700 cursor-pointer hover:text-accent-600"
                    onClick={() => navigate(`/admin/analytics/${row.id}`)}
                >
                    {row.name}
                </span>
            )
        },
        { header: 'Reference', accessor: 'reference' },
        { header: 'Customer', accessor: 'customer' },
        {
            header: 'Balance', accessor: 'balance', render: (row) => (
                <span className={row.balance < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {row.balance.toLocaleString()}
                </span>
            )
        }
    ];

    return (
        <ListView
            title="Analytic Accounts"
            columns={columns}
            data={data}
            pagination={{ page: 1, limit: 10, total: 2 }}
            onCreate={() => navigate('/admin/analytics/new')}
        />
    );
}
