import React, { useState, useEffect } from 'react';
import ListView from '../../../components/ui/ListView';
import { Calendar, Package, Clock } from 'lucide-react';

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setOrders([
        {
          id: '1',
          poNumber: 'PO-2024-055',
          date: '2024-03-25',
          total: 156000,
          status: 'CONFIRMED',
        },
        {
          id: '2',
          poNumber: 'PO-2024-052',
          date: '2024-03-20',
          total: 42000,
          status: 'DRAFT',
        },
      ]);
    }, 500);
  }, []);

  const columns = [
    {
      header: 'PO Number',
      accessor: 'poNumber',
      width: '25%',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {row.poNumber}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      width: '25%',
      render: (row) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
          }}
        >
          <Calendar size={14} />
          {new Date(row.date).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Total Value',
      accessor: 'total',
      width: '25%',
      render: (row) => (
        <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
          }).format(row.total)}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '25%',
      render: (row) => {
        const colors = {
          DRAFT: { bg: '#f1f5f9', color: '#475569' },
          CONFIRMED: { bg: '#dbeafe', color: '#1d4ed8' },
          DONE: { bg: '#dcfce7', color: '#15803d' },
          CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
        };
        const style = colors[row.status] || colors['DRAFT'];
        return (
          <span
            style={{
              backgroundColor: style.bg,
              color: style.color,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {row.status}
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ height: 'calc(100vh - 100px)' }}>
      <ListView
        title='Purchase Orders'
        data={orders}
        columns={columns}
        pagination={{ page: 1, limit: 10, total: orders.length }}
        actions={null}
      />
    </div>
  );
}
