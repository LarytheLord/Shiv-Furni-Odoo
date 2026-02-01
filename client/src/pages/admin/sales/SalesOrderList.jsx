import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import ListView from '../../../components/ui/ListView';

const PAGE_LIMIT = 10;

export default function SalesOrderList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: PAGE_LIMIT,
        ...(searchQuery && { search: searchQuery }),
      };
      const { data: response } = await api.get('/sales-orders', { params });

      const orders = response.data?.orders || response.orders || [];
      const mappedData = orders.map((order) => ({
        id: order.id,
        soNumber: order.soNumber,
        customer: order.customer?.name || '-',
        date: new Date(order.orderDate).toLocaleDateString('en-IN'),
        total: Number(order.total) || 0,
        status: order.status,
      }));

      setData(mappedData);
      setTotalRecords(
        response.pagination?.total ||
          response.data?.pagination?.total ||
          mappedData.length,
      );
    } catch (err) {
      console.error('Failed to fetch sales orders:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      header: 'SO No.',
      accessor: 'soNumber',
      width: '130px',
      render: (row) => (
        <span
          className='so-link'
          onClick={() => navigate(`/admin/sales-orders/${row.id}`)}
        >
          {row.soNumber}
        </span>
      ),
    },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Order Date', accessor: 'date', width: '120px' },
    {
      header: 'Total',
      accessor: 'total',
      width: '140px',
      render: (row) => (
        <span className='total-amount'>{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '120px',
      render: (row) => {
        const statusStyles = {
          DRAFT: { bg: '#f1f5f9', color: '#64748b' },
          CONFIRMED: { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' },
          INVOICED: { bg: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' },
          CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' },
        };
        const labels = {
          DRAFT: 'Draft',
          CONFIRMED: 'Confirmed',
          INVOICED: 'Invoiced',
          CANCELLED: 'Cancelled',
        };
        const style = statusStyles[row.status] || statusStyles.DRAFT;
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              background: style.bg,
              color: style.color,
            }}
          >
            {labels[row.status] || row.status}
          </span>
        );
      },
    },
  ];

  const pagination = {
    page: currentPage,
    limit: PAGE_LIMIT,
    total: totalRecords,
  };

  return (
    <>
      <ListView
        title='Sales Orders'
        columns={columns}
        data={data}
        pagination={pagination}
        onCreate={() => navigate('/admin/sales-orders/new')}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        loading={loading}
      />
      <style>{`
        .so-link {
          font-weight: 500;
          color: #0f172a;
          cursor: pointer;
          transition: color 0.2s;
        }
        .so-link:hover {
          color: var(--accent-600);
        }
        .total-amount {
          font-weight: 500;
          color: #059669;
        }
      `}</style>
    </>
  );
}
