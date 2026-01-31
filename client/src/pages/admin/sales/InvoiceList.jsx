import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../components/ui/ListView';

export default function InvoiceList() {
    const navigate = useNavigate();

    const [data] = useState([
        { id: 1, name: 'INV/2026/0001', customer: 'Gemini Furniture', date: '2026-01-25', total: 25000, status: 'Not Paid' },
    ]);

    const columns = [
        {
            header: 'Invoice No.', accessor: 'name', render: (row) => (
                <span
                    className="font-medium text-slate-700 cursor-pointer hover:text-accent-600"
                    onClick={() => navigate(`/admin/invoices/${row.id}`)}
                >
                    {row.name}
                </span>
            )
        },
        { header: 'Customer', accessor: 'customer' },
        { header: 'Invoice Date', accessor: 'date' },
        { header: 'Total', accessor: 'total', render: (row) => row.total.toLocaleString() },
        {
            header: 'Payment Status', accessor: 'status', render: (row) => (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <ListView
            title="Customer Invoices"
            columns={columns}
            data={data}
            pagination={{ page: 1, limit: 10, total: 1 }}
            onCreate={() => navigate('/admin/invoices/new')}
        />
    );
}
