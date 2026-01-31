import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../components/ui/ListView';

export default function SalesOrderList() {
    const navigate = useNavigate();

    const [data] = useState([
        { id: 1, name: 'SO0001', customer: 'Gemini Furniture', date: '2026-01-18', total: 25000, status: 'Confirm' },
        { id: 2, name: 'SO0002', customer: 'Deco Addict', date: '2026-01-22', total: 8500, status: 'Draft' },
    ]);

    const columns = [
        {
            header: 'Order No.', accessor: 'name', render: (row) => (
                <span
                    className="font-medium text-slate-700 cursor-pointer hover:text-accent-600"
                    onClick={() => navigate(`/admin/sales-orders/${row.id}`)}
                >
                    {row.name}
                </span>
            )
        },
        { header: 'Customer', accessor: 'customer' },
        { header: 'Order Date', accessor: 'date' },
        { header: 'Total', accessor: 'total', render: (row) => row.total.toLocaleString() },
        {
            header: 'Status', accessor: 'status', render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'Confirm' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <ListView
            title="Sales Orders"
            columns={columns}
            data={data}
            pagination={{ page: 1, limit: 10, total: 2 }}
            onCreate={() => navigate('/admin/sales-orders/new')}
        />
    );
}
