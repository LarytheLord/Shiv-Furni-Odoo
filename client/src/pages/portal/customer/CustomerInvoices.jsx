import React, { useState, useEffect } from 'react';
import ListView from '../../../components/ui/ListView';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setInvoices([
        {
          id: '1',
          number: 'INV-2024-001',
          date: '2024-03-12',
          dueDate: '2024-03-19',
          amount: 47200,
          status: 'PAID',
        },
        {
          id: '2',
          number: 'INV-2024-005',
          date: '2024-03-18',
          dueDate: '2024-03-25',
          amount: 12500,
          status: 'OPEN',
        },
        {
          id: '3',
          number: 'INV-2024-009',
          date: '2024-03-25',
          dueDate: '2024-04-01',
          amount: 8900,
          status: 'OVERDUE',
        },
      ]);
    }, 500);
  }, []);

  const columns = [
    {
      header: 'Invoice Number',
      accessor: 'number',
      width: '20%',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.number}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      width: '20%',
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
      header: 'Due Date',
      accessor: 'dueDate',
      width: '20%',
      render: (row) => (
        <span
          style={{ color: row.status === 'OVERDUE' ? '#ef4444' : '#64748b' }}
        >
          {new Date(row.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      width: '20%',
      render: (row) => (
        <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
          }).format(row.amount)}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '20%',
      render: (row) => {
        const config = {
          PAID: { bg: '#dcfce7', color: '#166534', icon: CheckCircle },
          OPEN: { bg: '#dbeafe', color: '#1e40af', icon: AlertCircle },
          OVERDUE: { bg: '#fee2e2', color: '#991b1b', icon: AlertCircle },
        };
        const style = config[row.status] || config['OPEN'];
        const Icon = style.icon;

        return (
          <span
            style={{
              backgroundColor: style.bg,
              color: style.color,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Icon size={12} />
            {row.status}
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ height: 'calc(100vh - 100px)' }}>
      <ListView
        title='My Invoices'
        data={invoices}
        columns={columns}
        pagination={{ page: 1, limit: 10, total: invoices.length }}
        actions={null}
      />
    </div>
  );
}
