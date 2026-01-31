import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../components/ui/ListView';

export default function VendorBillList() {
    const navigate = useNavigate();

    const [data] = useState([
        { id: 1, name: 'BILL/2025/0001', vendor: 'Azure Interior', reference: 'SUP-25-001', date: '2026-01-20', total: 16350, status: 'Not Paid' },
    ]);

    const columns = [
        {
            header: 'Bill No.', accessor: 'name', render: (row) => (
                <span
                    className="font-medium text-slate-700 cursor-pointer hover:text-accent-600"
                    onClick={() => navigate(`/admin/bills/${row.id}`)}
                >
                    {row.name}
                </span>
            )
        },
        { header: 'Vendor', accessor: 'vendor' },
        { header: 'Bill Reference', accessor: 'reference' },
        { header: 'Bill Date', accessor: 'date' },
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
            title="Vendor Bills"
            columns={columns}
            data={data}
            pagination={{ page: 1, limit: 10, total: 1 }}
            onCreate={() => navigate('/admin/bills/new')}
        />
    );
}
