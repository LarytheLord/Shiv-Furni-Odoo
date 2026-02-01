import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/axios';
import {
  ArrowLeft,
  Home,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  Printer,
  Send,
  X,
  FileText,
} from 'lucide-react';

const initialLine = {
  productId: '',
  productName: '',
  analyticalAccountId: '',
  analyticalAccountName: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
};

export default function SalesOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    soNumber: '',
    customerId: '',
    customerName: '',
    orderDate: new Date().toISOString().split('T')[0],
    reference: '',
    status: 'DRAFT',
    notes: '',
    lines: [{ ...initialLine, id: Date.now() }],
  });

  // Dropdown data
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [analyticalAccounts, setAnalyticalAccounts] = useState([]);

  // Dropdown visibility
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [activeProductDropdown, setActiveProductDropdown] = useState(null);
  const [activeAnalyticsDropdown, setActiveAnalyticsDropdown] = useState(null);

  // Ref for container to handle click outside
  const containerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !event.target.closest('.select-wrapper') &&
        !event.target.closest('.cell-select')
      ) {
        setShowCustomerDropdown(false);
        setActiveProductDropdown(null);
        setActiveAnalyticsDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch dropdown options
  const fetchDropdownData = useCallback(async () => {
    try {
      const [customersRes, productsRes, analyticsRes] = await Promise.all([
        api.get('/contacts', { params: { type: 'CUSTOMER', limit: 100 } }),
        api.get('/products', { params: { limit: 100 } }),
        api.get('/analytical-accounts', { params: { limit: 100 } }),
      ]);

      const customerData =
        customersRes.data.data?.contacts || customersRes.data.contacts || [];
      const productData =
        productsRes.data.data?.products || productsRes.data.products || [];
      const analyticsData =
        analyticsRes.data.data?.accounts || analyticsRes.data.accounts || [];

      setCustomers(customerData);
      setProducts(productData);
      setAnalyticalAccounts(analyticsData);
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  }, []);

  // Generate next reference number
  const fetchNextReference = useCallback(async () => {
    if (!isNew) return;
    try {
      const { data: response } = await api.get('/sales-orders', {
        params: { limit: 1 },
      });
      const total = response.pagination?.total || 0;
      const nextSeq = total + 1;
      const year = String(new Date().getFullYear()).slice(-2);
      const refNumber = `SO-${year}-${String(nextSeq).padStart(4, '0')}`;
      setFormData((prev) => ({ ...prev, reference: refNumber }));
    } catch (err) {
      console.error('Failed to generate reference number:', err);
      const year = String(new Date().getFullYear()).slice(-2);
      setFormData((prev) => ({ ...prev, reference: `SO-${year}-0001` }));
    }
  }, [isNew]);

  // Fetch existing order
  const fetchOrder = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const { data: response } = await api.get(`/sales-orders/${id}`);
      const order = response.data?.order || response.order;

      if (order) {
        setFormData({
          soNumber: order.soNumber,
          customerId: order.customerId,
          customerName: order.customer?.name || '',
          orderDate: new Date(order.orderDate).toISOString().split('T')[0],
          reference: order.notes || '',
          status: order.status,
          notes: order.notes || '',
          lines: order.lines?.map((line) => ({
            id: line.id,
            productId: line.productId,
            productName: line.product?.name || '',
            analyticalAccountId: line.analyticalAccountId || '',
            analyticalAccountName: line.analyticalAccount?.name || '',
            quantity: Number(line.quantity),
            unitPrice: Number(line.unitPrice),
            total: Number(line.total),
          })) || [{ ...initialLine, id: Date.now() }],
        });
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    fetchDropdownData();
    fetchOrder();
    fetchNextReference();
  }, [fetchDropdownData, fetchOrder, fetchNextReference]);

  // Calculate line total
  const calculateLineTotal = (qty, price) => {
    return Number(qty) * Number(price);
  };

  // Calculate order total
  const calculateTotal = () => {
    return formData.lines.reduce(
      (sum, line) => sum + calculateLineTotal(line.quantity, line.unitPrice),
      0,
    );
  };

  // Handle line changes
  const updateLine = (index, field, value) => {
    const newLines = [...formData.lines];

    if (field === 'quantity') {
      let qty = parseInt(value, 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      newLines[index] = { ...newLines[index], quantity: qty };
      newLines[index].total = calculateLineTotal(
        qty,
        newLines[index].unitPrice,
      );
    } else {
      newLines[index] = { ...newLines[index], [field]: value };
    }

    setFormData({ ...formData, lines: newLines });
  };

  // Select product for a line (auto-fills unit price from product's salePrice)
  const selectProduct = (index, product) => {
    const newLines = [...formData.lines];
    newLines[index] = {
      ...newLines[index],
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.salePrice) || 0,
      total: calculateLineTotal(
        newLines[index].quantity,
        Number(product.salePrice) || 0,
      ),
    };
    setFormData({ ...formData, lines: newLines });
    setActiveProductDropdown(null);
  };

  // Select analytical account for a line
  const selectAnalyticalAccount = (index, account) => {
    const newLines = [...formData.lines];
    newLines[index] = {
      ...newLines[index],
      analyticalAccountId: account.id,
      analyticalAccountName: account.name,
    };
    setFormData({ ...formData, lines: newLines });
    setActiveAnalyticsDropdown(null);
  };

  // Add new line
  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { ...initialLine, id: Date.now() }],
    });
  };

  // Remove line
  const removeLine = (index) => {
    if (formData.lines.length === 1) return;
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  // Form validation
  const validateForm = () => {
    const errors = [];

    if (!formData.customerId) {
      errors.push('Please select a customer');
    }

    if (!formData.orderDate) {
      errors.push('Please select an SO date');
    }

    const validLines = formData.lines.filter((l) => l.productId);
    if (validLines.length === 0) {
      errors.push('Please add at least one product line');
    }

    formData.lines.forEach((line, index) => {
      if (line.productId) {
        const qty = parseInt(line.quantity, 10);
        if (isNaN(qty) || qty < 1) {
          errors.push(`Line ${index + 1}: Quantity must be at least 1`);
        }
      }
    });

    return errors;
  };

  // Save order
  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: formData.customerId,
        orderDate: formData.orderDate,
        notes: formData.reference,
        lines: formData.lines
          .filter((l) => l.productId)
          .map((line) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            unitPrice: Number(line.unitPrice),
            analyticalAccountId: line.analyticalAccountId || undefined,
          })),
      };

      if (isNew) {
        await api.post('/sales-orders', payload);
        navigate('/admin/sales-orders');
      } else {
        await api.patch(`/sales-orders/${id}`, payload);
        navigate('/admin/sales-orders');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save order');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Update status
  const updateStatus = async (newStatus) => {
    if (isNew) return;
    setSaving(true);
    try {
      if (newStatus === 'CONFIRMED') {
        const { data: response } = await api.post(`/sales-orders/${id}/confirm`);
        const order = response.data?.order || response.order;
        if (order) {
          setFormData((prev) => ({ ...prev, status: order.status }));
        } else {
          setFormData((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        await api.patch(`/sales-orders/${id}`, { status: newStatus });
        setFormData((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <Loader2 size={32} className='spin' />
      </div>
    );
  }

  return (
    <div className='so-container' ref={containerRef}>
      {/* Header */}
      <div className='so-header'>
        <button
          className='btn-new'
          onClick={() => navigate('/admin/sales-orders/new')}
        >
          New
        </button>
        <h1 className='so-title'>Sales Order</h1>
        <div className='header-nav'>
          <button className='btn-nav' onClick={() => navigate('/admin')}>
            <Home size={16} /> Home
          </button>
          <button
            className='btn-nav'
            onClick={() => navigate('/admin/sales-orders')}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      {/* Order Info Card */}
      <div className='info-card'>
        <div className='info-grid'>
          <div className='form-group'>
            <label>SO No.</label>
            <input
              type='text'
              value={formData.soNumber || 'SO (Auto)'}
              readOnly
              className='input-readonly'
            />
          </div>
          <div className='form-group'>
            <label>SO Date</label>
            <input
              type='date'
              value={formData.orderDate}
              onChange={(e) =>
                setFormData({ ...formData, orderDate: e.target.value })
              }
            />
          </div>
        </div>

        <div className='info-grid'>
          <div className='form-group'>
            <label>Customer Name</label>
            <div className='select-wrapper'>
              <div
                className='select-trigger'
                onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
              >
                <span
                  className={
                    formData.customerName ? 'selected-value' : 'placeholder'
                  }
                >
                  {formData.customerName || 'Select customer...'}
                </span>
                <ChevronDown size={16} />
              </div>
              {showCustomerDropdown && (
                <div className='select-dropdown'>
                  <div className='dropdown-list'>
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className='dropdown-option'
                        onClick={() => {
                          setFormData({
                            ...formData,
                            customerId: customer.id,
                            customerName: customer.name,
                          });
                          setShowCustomerDropdown(false);
                        }}
                      >
                        {customer.name}
                      </div>
                    ))}
                    {customers.length === 0 && (
                      <div className='dropdown-empty'>No customers found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='info-grid'>
          <div className='form-group'>
            <label>Reference</label>
            <input
              type='text'
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              placeholder='Enter reference...'
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className='action-bar'>
        <div className='action-left'>
          {!isNew && formData.status === 'DRAFT' && (
            <button
              className='btn-action btn-confirm'
              onClick={() => updateStatus('CONFIRMED')}
              disabled={saving}
            >
              Confirm
            </button>
          )}
          <button className='btn-action' onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          <button className='btn-action'>
            <Send size={14} /> Send
          </button>
          {!isNew && formData.status !== 'CANCELLED' && (
            <button
              className='btn-action btn-cancel-action'
              onClick={() => updateStatus('CANCELLED')}
              disabled={saving}
            >
              <X size={14} /> Cancel
            </button>
          )}
          {formData.status === 'CONFIRMED' && (
            <button
              className='btn-action btn-invoice'
              onClick={() => navigate(`/admin/invoices/new?soId=${id}`)}
            >
              <FileText size={14} /> Create Invoice
            </button>
          )}
        </div>

        <div className='status-pills'>
          {['DRAFT', 'CONFIRMED', 'CANCELLED'].map((status) => (
            <span
              key={status}
              className={`status-pill ${formData.status === status ? 'active' : ''}`}
            >
              {status === 'DRAFT'
                ? 'Draft'
                : status === 'CONFIRMED'
                  ? 'Confirm'
                  : 'Cancelled'}
            </span>
          ))}
        </div>
      </div>

      {/* Order Lines */}
      <div className='lines-card'>
        <table className='lines-table'>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Sr. No.</th>
              <th>Product</th>
              <th>Budget Analytics</th>
              <th style={{ width: '100px' }}>Qty</th>
              <th style={{ width: '130px' }}>Unit Price</th>
              <th style={{ width: '140px' }}>Total</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {formData.lines.map((line, index) => (
              <tr key={line.id}>
                <td className='cell-center'>{index + 1}</td>
                <td>
                  <div className='cell-select'>
                    <div
                      className='select-trigger'
                      onClick={() =>
                        setActiveProductDropdown(
                          activeProductDropdown === index ? null : index,
                        )
                      }
                    >
                      <span
                        className={
                          line.productName ? 'selected-value' : 'placeholder'
                        }
                      >
                        {line.productName || 'Select product...'}
                      </span>
                      <ChevronDown size={14} />
                    </div>
                    {activeProductDropdown === index && (
                      <div className='select-dropdown'>
                        <div className='dropdown-list'>
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className='dropdown-option'
                              onClick={() => selectProduct(index, product)}
                            >
                              {product.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className='cell-select'>
                    <div
                      className='select-trigger'
                      onClick={() =>
                        setActiveAnalyticsDropdown(
                          activeAnalyticsDropdown === index ? null : index,
                        )
                      }
                    >
                      <span
                        className={
                          line.analyticalAccountName
                            ? 'analytics-value'
                            : 'placeholder'
                        }
                      >
                        {line.analyticalAccountName || 'Select...'}
                      </span>
                      <ChevronDown size={14} />
                    </div>
                    {activeAnalyticsDropdown === index && (
                      <div className='select-dropdown'>
                        <div className='dropdown-list'>
                          <div
                            className='dropdown-option'
                            onClick={() =>
                              selectAnalyticalAccount(index, {
                                id: '',
                                name: '',
                              })
                            }
                          >
                            <em>None</em>
                          </div>
                          {analyticalAccounts.map((account) => (
                            <div
                              key={account.id}
                              className='dropdown-option'
                              onClick={() =>
                                selectAnalyticalAccount(index, account)
                              }
                            >
                              {account.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    type='number'
                    min='1'
                    step='1'
                    className='line-input cell-center'
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(index, 'quantity', e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === '.' || e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val < 1) {
                        updateLine(index, 'quantity', '1');
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type='number'
                    className='line-input cell-right input-readonly'
                    value={line.unitPrice}
                    readOnly
                    title='Unit price is auto-filled from product master'
                  />
                </td>
                <td className='total-cell'>
                  <span className='total-value'>
                    {formatCurrency(
                      calculateLineTotal(line.quantity, line.unitPrice),
                    )}
                  </span>
                </td>
                <td>
                  {formData.lines.length > 1 && (
                    <button
                      className='btn-remove'
                      onClick={() => removeLine(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='lines-footer'>
          <button className='btn-add-line' onClick={addLine}>
            <Plus size={16} /> Add Line
          </button>
        </div>

        <div className='total-row'>
          <span className='total-label'>Total</span>
          <span className='grand-total'>
            {formatCurrency(calculateTotal())}/-
          </span>
        </div>
      </div>

      {/* Save Footer */}
      <div className='save-footer'>
        <button
          className='btn-primary'
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 size={18} className='spin' /> : <Plus size={18} />}
          <span>
            {saving ? 'Saving...' : isNew ? 'Create Order' : 'Save Changes'}
          </span>
        </button>
      </div>

      <style>{`
        .so-container {
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem;
          height: 100%;
          overflow-y: auto;
          justify-content: space-between;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--accent-600);
        }

        /* Header */
        .so-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .btn-new {
          background: var(--accent-600);
          color: white;
          border: none;
          padding: 0.625rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-new:hover { background: var(--accent-700); }
        .so-title {
          flex: 1;
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }
        .header-nav { display: flex; gap: 0.5rem; }
        .btn-nav {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: white;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.875rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-nav:hover { background: #f9fafb; }

        /* Info Card */
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        .form-group input {
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          outline: none;
          transition: all 0.2s;
        }
        .form-group input:focus {
          border-color: var(--accent-500);
          box-shadow: 0 0 0 3px rgba(0, 135, 139, 0.1);
        }
        .form-group input::placeholder { color: #9ca3af; }
        .input-readonly {
          background: #f1f5f9;
          color: #64748b;
          cursor: default;
        }

        /* Select Wrapper */
        .select-wrapper { position: relative; }
        .select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0.875rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .select-trigger:hover { border-color: #9ca3af; }
        .placeholder { color: #9ca3af; }
        .selected-value { color: #0f172a; }
        .select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 100;
          overflow: hidden;
        }
        .dropdown-list {
          max-height: 180px;
          overflow-y: auto;
        }
        .dropdown-option {
          padding: 0.625rem 0.875rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.15s;
        }
        .dropdown-option:hover { background: #f8fafc; }
        .dropdown-empty {
          padding: 0.625rem 0.875rem;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        /* Action Bar */
        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        .action-left { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-action:hover { background: #f9fafb; }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-confirm { background: #22c55e; color: white; border-color: #22c55e; }
        .btn-confirm:hover { background: #16a34a; }
        .btn-cancel-action { color: #dc2626; border-color: #fca5a5; }
        .btn-cancel-action:hover { background: #fef2f2; }
        .btn-invoice { background: #3b82f6; color: white; border-color: #3b82f6; }
        .btn-invoice:hover { background: #2563eb; }

        .status-pills { display: flex; gap: 0.5rem; }
        .status-pill {
          padding: 0.375rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        .status-pill.active {
          background: var(--accent-600);
          color: white;
          border-color: var(--accent-600);
        }

        /* Lines Card */
        .lines-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: visible;
        }
        .lines-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          overflow: visible;
        }
        .lines-table th {
          text-align: left;
          padding: 0.875rem 0.75rem;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .lines-table td {
          padding: 0.875rem 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
          overflow: visible;
          position: relative;
        }
        .cell-center { text-align: center; }
        .cell-right { text-align: right; }
        .cell-select { position: relative; z-index: 1; }
        .cell-select:has(.select-dropdown) { z-index: 1000; }
        .cell-select .select-trigger {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          min-width: 160px;
        }
        .cell-select .select-dropdown {
          z-index: 1000;
        }
        .analytics-value { color: var(--accent-600); }
        .line-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .line-input:focus {
          border-color: var(--accent-500);
          box-shadow: 0 0 0 3px rgba(0, 135, 139, 0.1);
        }
        .line-input.input-readonly {
          background: #f1f5f9;
          color: #64748b;
          cursor: not-allowed;
        }
        .total-cell {
          background: #ecfdf5;
          text-align: right;
        }
        .total-value {
          font-weight: 600;
          color: #047857;
        }
        .btn-remove {
          background: transparent;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 0.375rem;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .btn-remove:hover { background: #fef2f2; }

        .lines-footer {
          padding: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }
        .btn-add-line {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: transparent;
          border: 1px dashed #d1d5db;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .btn-add-line:hover {
          border-color: var(--accent-500);
          color: var(--accent-600);
        }

        .total-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 2rem;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        .total-label {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }
        .grand-total {
          font-size: 1.25rem;
          font-weight: 700;
          color: #059669;
        }

        /* Save Footer */
        .save-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          background: var(--accent-600);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover { background: var(--accent-700); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .so-header { flex-direction: column; align-items: flex-start; }
          .header-nav { width: 100%; justify-content: flex-end; }
          .info-grid { grid-template-columns: 1fr; }
          .action-bar { flex-direction: column; align-items: flex-start; }
          .status-pills { width: 100%; justify-content: flex-start; }
        }
      `}</style>
    </div>
  );
}
