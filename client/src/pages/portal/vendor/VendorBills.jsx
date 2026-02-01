import React, { useState, useEffect } from 'react';
import ListView from '../../../components/ui/ListView';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export default function VendorBills() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setBills([
        {
          id: '1',
          billNumber: 'BILL-001',
          date: '2024-03-26',
          dueDate: '2024-04-10',
          amount: 156000,
          status: 'OPEN',
        },
        {
          id: '2',
          billNumber: 'BILL-892',
          date: '2024-03-10',
          dueDate: '2024-03-20',
          amount: 24000,
          status: 'PAID',
        },
      ]);
    }, 500);
  }, []);

  const columns = [
    {
      header: 'Bill Number',
      accessor: 'billNumber',
      width: '20%',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {row.billNumber}
        </span>
      ),
    },
    {
      header: 'Bill Date',
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
        title='My Bills'
        data={bills}
        columns={columns}
        pagination={{ page: 1, limit: 10, total: bills.length }}
        actions={null}
      />
    </div>
  );
}
