import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import ListView from '../../../components/ui/ListView';

const PAGE_LIMIT = 10;

export default function PurchaseOrderList() {
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
      const { data: response } = await api.get('/purchase-orders', { params });

      const orders = response.data?.orders || response.orders || [];
      const mappedData = orders.map((order) => ({
        id: order.id,
        poNumber: order.poNumber,
        vendor: order.vendor?.name || '-',
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
      console.error('Failed to fetch purchase orders:', err);
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
      header: 'PO No.',
      accessor: 'poNumber',
      width: '130px',
      render: (row) => (
        <span
          className='po-link'
          onClick={() => navigate(`/admin/purchase-orders/${row.id}`)}
        >
          {row.poNumber}
        </span>
      ),
    },
    { header: 'Vendor', accessor: 'vendor' },
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
          CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' },
        };
        const labels = {
          DRAFT: 'Draft',
          CONFIRMED: 'Confirmed',
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
        title='Purchase Orders'
        columns={columns}
        data={data}
        pagination={pagination}
        onCreate={() => navigate('/admin/purchase-orders/new')}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
      />
      <style>{`
        .po-link {
          font-weight: 500;
          color: #0f172a;
          cursor: pointer;
          transition: color 0.2s;
        }
        .po-link:hover {
          color: var(--accent-600);
        }
        .total-amount {
          font-weight: 500;
          color: #374151;
        }
      `}</style>
    </>
  );
}
