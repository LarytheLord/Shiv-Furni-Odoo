import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../components/ui/ListView';
import api from '../../../api/axios';
import { Eye, Calendar, DollarSign } from 'lucide-react';

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for Phase 1 - will be replaced by API in Phase 2
  useEffect(() => {
    // Simulating API fetch
    setTimeout(() => {
      setOrders([
        {
          id: '1',
          soNumber: 'SO2024001',
          date: '2024-03-10',
          total: 45000,
          status: 'CONFIRMED',
        },
        {
          id: '2',
          soNumber: 'SO2024008',
          date: '2024-03-15',
          total: 12500,
          status: 'DRAFT',
        },
        {
          id: '3',
          soNumber: 'SO2024012',
          date: '2024-03-20',
          total: 8900,
          status: 'DONE',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    {
      header: 'Order Number',
      accessor: 'soNumber',
      width: '25%',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {row.soNumber}
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
      header: 'Total',
      accessor: 'total',
      width: '25%',
      render: (row) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'monospace',
            fontWeight: 600,
          }}
        >
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
        title='My Orders'
        data={orders}
        columns={columns}
        onSearch={(q) => console.log('Search:', q)}
        pagination={{ page: 1, limit: 10, total: orders.length }}
        // Override actions to simpler view button
        actions={null} // simplified for portal
      />
      {/* We might need to customize ListView to handle row clicks efficiently or add specific actions */}
    </div>
  );
}
