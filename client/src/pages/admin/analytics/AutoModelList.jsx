import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../components/ui/ListView';

export default function AutoModelList() {
    const navigate = useNavigate();

    const [data] = useState([
        { id: 1, name: 'Vendor Bills', partner: 'Azure Interior', product: 'All', analytic: 'Deepawali', priority: 1, active: true },
    ]);

    const columns = [
        {
            header: 'Name', accessor: 'name', render: (row) => (
                <span
                    className="font-medium text-slate-700 cursor-pointer hover:text-accent-600"
                    onClick={() => navigate(`/admin/analytical-models/${row.id}`)}
                >
                    {row.name}
                </span>
            )
        },
        { header: 'Partner', accessor: 'partner' },
        { header: 'Product', accessor: 'product' },
        {
            header: 'Analytic Account', accessor: 'analytic', render: (row) => (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold">{row.analytic}</span>
            )
        },
        {
            header: 'Active', accessor: 'active', render: (row) => (
                <input type="checkbox" checked={row.active} readOnly />
            )
        }
    ];

    return (
        <ListView
            title="Auto Analytic Models"
            columns={columns}
            data={data}
            pagination={{ page: 1, limit: 10, total: 1 }}
            onCreate={() => navigate('/admin/analytical-models/new')}
        />
    );
}
