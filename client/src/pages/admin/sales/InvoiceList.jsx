import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import ListView from '../../../components/ui/ListView';
import { Plus, ChevronDown, Loader2 } from 'lucide-react';

const PAGE_LIMIT = 10;

export default function InvoiceList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [uninvoicedSOs, setUninvoicedSOs] = useState([]);
  const [uninvoicedLoading, setUninvoicedLoading] = useState(false);
  const [newDropdownOpen, setNewDropdownOpen] = useState(false);
  const newDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        newDropdownRef.current &&
        !newDropdownRef.current.contains(e.target)
      ) {
        setNewDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUninvoicedSOs = useCallback(async () => {
    setUninvoicedLoading(true);
    try {
      const { data: res } = await api.get('/sales-orders', {
        params: { withoutInvoice: 'true', limit: 100 },
      });
      const orders =
        res.data?.data?.orders || res.data?.orders || res.orders || [];
      setUninvoicedSOs(orders);
    } catch (err) {
      console.error('Failed to fetch uninvoiced sales orders:', err);
      setUninvoicedSOs([]);
    } finally {
      setUninvoicedLoading(false);
    }
  }, []);

  const openNewDropdown = () => {
    if (!newDropdownOpen) {
      fetchUninvoicedSOs();
    }
    setNewDropdownOpen((v) => !v);
  };

  const handleSelectSO = (soId) => {
    setNewDropdownOpen(false);
    navigate(`/admin/invoices/new?soId=${soId}`);
  };

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: PAGE_LIMIT,
        ...(searchQuery && { search: searchQuery }),
      };
      const { data: response } = await api.get('/customer-invoices', {
        params,
      });

      const invoices = response.data?.invoices || response.invoices || [];
      const mappedData = invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer?.name || '-',
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-IN'),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('en-IN'),
        total: Number(invoice.total) || 0,
        amountPaid: Number(invoice.amountPaid) || 0,
        amountDue: Number(invoice.amountDue) || 0,
        status: invoice.status,
      }));

      setData(mappedData);
      setTotalRecords(
        response.pagination?.total ||
          response.data?.pagination?.total ||
          mappedData.length,
      );
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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

  const getPaymentStatus = (invoice) => {
    if (invoice.amountPaid >= invoice.total && invoice.total > 0) return 'PAID';
    if (invoice.amountPaid > 0) return 'PARTIAL';
    return 'NOT_PAID';
  };

  const columns = [
    {
      header: 'Invoice No.',
      accessor: 'invoiceNumber',
      width: '140px',
      render: (row) => (
        <span
          className='inv-link'
          onClick={() => navigate(`/admin/invoices/${row.id}`)}
        >
          {row.invoiceNumber}
        </span>
      ),
    },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Invoice Date', accessor: 'invoiceDate', width: '110px' },
    { header: 'Due Date', accessor: 'dueDate', width: '110px' },
    {
      header: 'Total',
      accessor: 'total',
      width: '120px',
      render: (row) => (
        <span className='total-amount'>{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: (row) => {
        const statusStyles = {
          DRAFT: { bg: '#f1f5f9', color: '#64748b' },
          CONFIRMED: { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' },
          CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' },
        };
        const labels = {
          DRAFT: 'Draft',
          CONFIRMED: 'Posted',
          CANCELLED: 'Cancelled',
        };
        const style = statusStyles[row.status] || statusStyles.DRAFT;
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
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
    {
      header: 'Payment',
      accessor: 'payment',
      width: '100px',
      render: (row) => {
        const paymentStatus = getPaymentStatus(row);
        const paymentStyles = {
          PAID: { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' },
          PARTIAL: { bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706' },
          NOT_PAID: { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' },
        };
        const labels = {
          PAID: 'Paid',
          PARTIAL: 'Partial',
          NOT_PAID: 'Not Paid',
        };
        const style = paymentStyles[paymentStatus];
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 500,
              background: style.bg,
              color: style.color,
            }}
          >
            {labels[paymentStatus]}
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

  const newInvoiceButton = (
    <div className='new-invoice-dropdown-wrap' ref={newDropdownRef}>
      <button
        type='button'
        className='btn-erp btn-erp-primary new-invoice-trigger'
        onClick={openNewDropdown}
        aria-expanded={newDropdownOpen}
        aria-haspopup='listbox'
      >
        <Plus size={16} /> New{' '}
        <ChevronDown size={14} style={{ marginLeft: 4 }} />
      </button>
      {newDropdownOpen && (
        <div className='new-invoice-dropdown'>
          {uninvoicedLoading ? (
            <div className='new-invoice-dropdown-loading'>
              <Loader2 size={18} className='spin' /> Loading…
            </div>
          ) : uninvoicedSOs.length === 0 ? (
            <div className='new-invoice-dropdown-empty'>
              No sales orders without invoice. Confirm an SO first.
            </div>
          ) : (
            <ul className='new-invoice-dropdown-list' role='listbox'>
              {uninvoicedSOs.map((so) => (
                <li
                  key={so.id}
                  role='option'
                  className='new-invoice-dropdown-item'
                  onClick={() => handleSelectSO(so.id)}
                >
                  <span className='new-invoice-so-number'>{so.soNumber}</span>
                  <span className='new-invoice-customer'>
                    {so.customer?.name ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <ListView
        title='Customer Invoices'
        columns={columns}
        data={data}
        pagination={pagination}
        createButton={newInvoiceButton}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        loading={loading}
      />
      <style>{`
        .inv-link {
          font-weight: 500;
          color: #0f172a;
          cursor: pointer;
          transition: color 0.2s;
        }
        .inv-link:hover {
          color: #10b981;
        }
        .total-amount {
          font-weight: 500;
          color: #059669;
        }
        .new-invoice-dropdown-wrap {
          position: relative;
          display: inline-block;
        }
        .new-invoice-dropdown-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .new-invoice-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          min-width: 280px;
          max-height: 320px;
          overflow: auto;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 50;
        }
        .new-invoice-dropdown-list {
          list-style: none;
          margin: 0;
          padding: 0.5rem 0;
        }
        .new-invoice-dropdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.15s;
        }
        .new-invoice-dropdown-item:hover {
          background: #f1f5f9;
        }
        .new-invoice-so-number {
          font-weight: 600;
          color: #0f172a;
        }
        .new-invoice-customer {
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
        }
        .new-invoice-dropdown-loading,
        .new-invoice-dropdown-empty {
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          color: #64748b;
          text-align: center;
        }
        .new-invoice-dropdown-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .spin {
          animation: inv-spin 0.8s linear infinite;
        }
        @keyframes inv-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
