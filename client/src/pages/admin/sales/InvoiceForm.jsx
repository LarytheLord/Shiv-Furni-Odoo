import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  CreditCard,
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

export default function CustomerInvoiceForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const soId = searchParams.get('soId');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    reference: '',
    status: 'DRAFT',
    notes: '',
    lines: [{ ...initialLine, id: Date.now() }],
    total: 0,
    amountPaid: 0,
    amountDue: 0,
  });

  // Dropdown data
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [analyticalAccounts, setAnalyticalAccounts] = useState([]);

  // Dropdown visibility
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [activeProductDropdown, setActiveProductDropdown] = useState(null);
  const [activeAnalyticsDropdown, setActiveAnalyticsDropdown] = useState(null);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentType: 'RECEIVE',
    date: new Date().toISOString().split('T')[0],
    reference: '',
  });

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dropdown options
  const fetchDropdownData = useCallback(async () => {
    try {
      const [customersRes, productsRes, analyticsRes] = await Promise.all([
        api.get('/contacts', { params: { type: 'CUSTOMER', limit: 100 } }),
        api.get('/products', { params: { limit: 100 } }),
        api.get('/analytical-accounts', { params: { limit: 100 } }),
      ]);

      setCustomers(
        customersRes.data.data?.contacts || customersRes.data.contacts || [],
      );
      setProducts(
        productsRes.data.data?.products || productsRes.data.products || [],
      );
      setAnalyticalAccounts(
        analyticsRes.data.data?.accounts || analyticsRes.data.accounts || [],
      );
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  }, []);

  // Fetch from Sales Order if soId provided
  const fetchFromSalesOrder = useCallback(async () => {
    if (!soId || !isNew) return;
    try {
      const { data: response } = await api.get(`/sales-orders/${soId}`);
      const so = response.data?.order || response.order;
      if (so) {
        setFormData((prev) => ({
          ...prev,
          customerId: so.customerId,
          customerName: so.customer?.name || '',
          reference: `From SO: ${so.soNumber}`,
          lines: so.lines?.map((line) => ({
            id: line.id,
            productId: line.productId,
            productName: line.product?.name || '',
            analyticalAccountId: line.analyticalAccountId || '',
            analyticalAccountName: line.analyticalAccount?.name || '',
            quantity: Number(line.quantity),
            unitPrice: Number(line.unitPrice),
            total: Number(line.total),
          })) || [{ ...initialLine, id: Date.now() }],
        }));
      }
    } catch (err) {
      console.error('Failed to fetch sales order:', err);
    }
  }, [soId, isNew]);

  // Fetch existing invoice
  const fetchInvoice = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const { data: response } = await api.get(`/customer-invoices/${id}`);
      const invoice = response.data?.invoice || response.invoice;

      if (invoice) {
        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customerId,
          customerName: invoice.customer?.name || '',
          invoiceDate: new Date(invoice.invoiceDate)
            .toISOString()
            .split('T')[0],
          dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
          reference: invoice.notes || '',
          status: invoice.status,
          notes: invoice.notes || '',
          lines: invoice.lines?.map((line) => ({
            id: line.id,
            productId: line.productId,
            productName: line.product?.name || '',
            analyticalAccountId: line.analyticalAccountId || '',
            analyticalAccountName: line.analyticalAccount?.name || '',
            quantity: Number(line.quantity),
            unitPrice: Number(line.unitPrice),
            total: Number(line.total),
          })) || [{ ...initialLine, id: Date.now() }],
          total: Number(invoice.total) || 0,
          amountPaid: Number(invoice.amountPaid) || 0,
          amountDue: Number(invoice.amountDue) || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    fetchDropdownData();
    fetchInvoice();
    fetchFromSalesOrder();
  }, [fetchDropdownData, fetchInvoice, fetchFromSalesOrder]);

  // Calculate line total
  const calculateLineTotal = (qty, price) => Number(qty) * Number(price);

  // Calculate order total
  const calculateTotal = () =>
    formData.lines.reduce(
      (sum, line) => sum + calculateLineTotal(line.quantity, line.unitPrice),
      0,
    );

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

  // Select product
  const selectProduct = (index, product) => {
    const newLines = [...formData.lines];
    const unitPrice = Number(product.salePrice) || 0;
    newLines[index] = {
      ...newLines[index],
      productId: product.id,
      productName: product.name,
      unitPrice,
      total: calculateLineTotal(newLines[index].quantity, unitPrice),
    };
    setFormData({ ...formData, lines: newLines });
    setActiveProductDropdown(null);
  };

  // Select analytical account
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
    if (formData.lines.length <= 1) return;
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  // Validation
  const validateForm = () => {
    const errors = [];
    if (!formData.customerId) errors.push('Please select a customer');
    if (!formData.invoiceDate) errors.push('Please enter an invoice date');
    if (!formData.dueDate) errors.push('Please enter a due date');
    const validLines = formData.lines.filter((l) => l.productId);
    if (validLines.length === 0)
      errors.push('Please add at least one line item');
    return errors;
  };

  // Save invoice
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
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
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
        await api.post('/customer-invoices', payload);
        navigate('/admin/invoices');
      } else {
        await api.patch(`/customer-invoices/${id}`, payload);
        alert('Invoice updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save invoice');
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
        await api.post(`/customer-invoices/${id}/confirm`);
      } else {
        await api.patch(`/customer-invoices/${id}`, { status: newStatus });
      }
      setFormData((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Register payment
  const handleRegisterPayment = async () => {
    if (!paymentData.amount || paymentData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/customer-invoices/${id}/payments`, paymentData);
      setShowPaymentModal(false);
      setPaymentData({ amount: 0, paymentMethod: 'BANK_TRANSFER', reference: '' });
      // Refetch to get updated amounts
      fetchInvoice();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register payment');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  // Get payment status
  const getPaymentStatus = () => {
    const total = calculateTotal();
    const paid = formData.amountPaid;
    if (paid >= total && total > 0) return 'PAID';
    if (paid > 0) return 'PARTIAL';
    return 'NOT_PAID';
  };

  if (loading) {
    return (
      <div className='inv-loading'>
        <Loader2 className='spin' size={32} />
        <span>Loading invoice...</span>
      </div>
    );
  }

  return (
    <div className='inv-container' ref={containerRef}>
      {/* Header */}
      <div className='inv-header'>
        <button
          className='btn-new'
          onClick={() => navigate('/admin/invoices/new')}
        >
          New
        </button>
        <h1 className='inv-title'>Customer Invoice</h1>
        <div className='header-nav'>
          <button className='btn-nav' onClick={() => navigate('/admin')}>
            <Home size={16} /> Home
          </button>
          <button
            className='btn-nav'
            onClick={() => navigate('/admin/invoices')}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      {/* Invoice Info Card */}
      <div className='info-card'>
        <div className='info-grid'>
          <div className='form-group'>
            <label>Invoice No.</label>
            <input
              type='text'
              value={formData.invoiceNumber || 'INV (Auto)'}
              readOnly
              className='input-readonly'
            />
          </div>
          <div className='form-group'>
            <label>Invoice Date</label>
            <input
              type='date'
              value={formData.invoiceDate}
              onChange={(e) =>
                setFormData({ ...formData, invoiceDate: e.target.value })
              }
            />
          </div>
          <div className='form-group'>
            <label className='due-date-label'>Due Date</label>
            <input
              type='date'
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className='due-date-input'
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
                  {formData.customerName || 'Select Customer...'}
                </span>
                <ChevronDown size={16} />
              </div>
              {showCustomerDropdown && (
                <div className='dropdown-portal'>
                  <div className='dropdown-list'>
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className='dropdown-item'
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
          {/* Status Pills - Right side */}
          <div className='status-section'>
            <label>Status</label>
            <div className='status-pills'>
              <span
                className={`status-pill ${formData.status === 'DRAFT' ? 'active' : ''}`}
              >
                Draft
              </span>
              <span
                className={`status-pill ${formData.status === 'CONFIRMED' ? 'active confirmed' : ''}`}
              >
                Confirm
              </span>
              <span
                className={`status-pill ${formData.status === 'CANCELLED' ? 'active cancelled' : ''}`}
              >
                Cancelled
              </span>
            </div>
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
          {!isNew &&
            formData.status === 'CONFIRMED' &&
            getPaymentStatus() !== 'PAID' && (
              <button
                className='btn-action btn-pay'
                onClick={() => {
                  setPaymentData({
                    ...paymentData,
                    amount: calculateTotal() - formData.amountPaid,
                  });
                  setShowPaymentModal(true);
                }}
              >
                <CreditCard size={14} /> Pay
              </button>
            )}
        </div>
        <div className='action-right'>
          {/* Payment Status Pills */}
          {!isNew && (
            <div className='payment-status-pills'>
              <span
                className={`payment-pill ${getPaymentStatus() === 'PAID' ? 'active paid' : ''}`}
              >
                Paid
              </span>
              <span
                className={`payment-pill ${getPaymentStatus() === 'PARTIAL' ? 'active partial' : ''}`}
              >
                Partial
              </span>
              <span
                className={`payment-pill ${getPaymentStatus() === 'NOT_PAID' ? 'active not-paid' : ''}`}
              >
                Not Paid
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className='lines-section'>
        <table className='lines-table'>
          <thead>
            <tr>
              <th className='col-sr'>Sr. No.</th>
              <th className='col-product'>Product</th>
              <th className='col-budget'>Budget Analytics</th>
              <th className='col-qty'>Qty</th>
              <th className='col-price'>Unit Price</th>
              <th className='col-total'>Total</th>
              <th className='col-actions'></th>
            </tr>
          </thead>
          <tbody>
            {formData.lines.map((line, index) => (
              <tr key={line.id || index}>
                <td className='col-sr'>{index + 1}</td>
                <td className='col-product'>
                  <div className='cell-select'>
                    <div
                      className='cell-trigger'
                      onClick={() =>
                        setActiveProductDropdown(
                          activeProductDropdown === index ? null : index,
                        )
                      }
                    >
                      <span
                        className={line.productName ? '' : 'cell-placeholder'}
                      >
                        {line.productName || 'Select Product'}
                      </span>
                      <ChevronDown size={14} />
                    </div>
                    {activeProductDropdown === index && (
                      <div className='cell-dropdown'>
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className='cell-option'
                            onClick={() => selectProduct(index, product)}
                          >
                            {product.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className='col-budget'>
                  <div className='cell-select'>
                    <div
                      className='cell-trigger'
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
                            : 'cell-placeholder'
                        }
                      >
                        {line.analyticalAccountName || 'Select...'}
                      </span>
                      <ChevronDown size={14} />
                    </div>
                    {activeAnalyticsDropdown === index && (
                      <div className='cell-dropdown'>
                        <div
                          className='cell-option'
                          onClick={() =>
                            selectAnalyticalAccount(index, { id: '', name: '' })
                          }
                        >
                          <em>None</em>
                        </div>
                        {analyticalAccounts.map((acc) => (
                          <div
                            key={acc.id}
                            className='cell-option'
                            onClick={() => selectAnalyticalAccount(index, acc)}
                          >
                            {acc.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className='col-qty'>
                  <input
                    type='number'
                    min='1'
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(index, 'quantity', e.target.value)
                    }
                    className='qty-input'
                  />
                </td>
                <td className='col-price'>
                  <input
                    type='number'
                    min='0'
                    value={line.unitPrice}
                    onChange={(e) =>
                      updateLine(index, 'unitPrice', e.target.value)
                    }
                    className='price-input'
                  />
                </td>
                <td className='col-total'>
                  <span className='line-total'>
                    ₹{formatCurrency(calculateLineTotal(line.quantity, line.unitPrice))}
                  </span>
                </td>
                <td className='col-actions'>
                  <button
                    className='btn-remove'
                    onClick={() => removeLine(index)}
                    disabled={formData.lines.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className='btn-add-line' onClick={addLine}>
          <Plus size={16} /> Add Line
        </button>

        {/* Totals Section */}
        <div className='totals-section'>
          <div className='totals-row grand-total'>
            <span className='totals-label'>Total</span>
            <span className='totals-value'>₹{formatCurrency(calculateTotal())}</span>
          </div>
          {!isNew && (
            <>
              <div className='totals-row payment-info'>
                <span className='totals-label'>Amount Paid</span>
                <span className='totals-value'>₹{formatCurrency(formData.amountPaid)}</span>
              </div>
              <div className='totals-row amount-due'>
                <span className='totals-label'>Amount Due</span>
                <span className='totals-value'>
                  ₹{formatCurrency(calculateTotal() - formData.amountPaid)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className='save-section'>
        <button
          className='btn-save'
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className='spin' size={16} />
          ) : isNew ? (
            'Create Invoice'
          ) : (
            'Update Invoice'
          )}
        </button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className='payment-modal-overlay'>
          <div className='payment-modal'>
            {/* Payment Header */}
            <div className='payment-header'>
              <button className='btn-new-payment'>New</button>
              <span className='payment-number'>Pay/{new Date().getFullYear().toString().slice(-2)}/{String(Math.floor(Math.random() * 9999)).padStart(4, '0')}</span>
              <button className='btn-close-modal' onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Payment Action Bar */}
            <div className='payment-action-bar'>
              <div className='payment-actions-left'>
                <button
                  className='btn-payment-action btn-confirm-payment'
                  onClick={handleRegisterPayment}
                  disabled={saving}
                >
                  Confirm
                </button>
                <button className='btn-payment-action'>Print</button>
                <button className='btn-payment-action' disabled>Send</button>
                <button
                  className='btn-payment-action'
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
              <div className='payment-status-pills-modal'>
                <span className='payment-status-pill active'>Draft</span>
                <span className='payment-status-pill'>Confirm</span>
                <span className='payment-status-pill'>Cancelled</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className='payment-form'>
              <div className='payment-form-grid'>
                {/* Left Column */}
                <div className='payment-form-left'>
                  <div className='payment-field'>
                    <label className='payment-label accent'>Payment Type</label>
                    <div className='payment-radio-group'>
                      <label className='payment-radio'>
                        <input
                          type='radio'
                          name='paymentType'
                          value='SEND'
                          checked={paymentData.paymentType === 'SEND'}
                          onChange={(e) =>
                            setPaymentData({ ...paymentData, paymentType: e.target.value })
                          }
                        />
                        <span>Send</span>
                      </label>
                      <label className='payment-radio'>
                        <input
                          type='radio'
                          name='paymentType'
                          value='RECEIVE'
                          checked={paymentData.paymentType !== 'SEND'}
                          onChange={(e) =>
                            setPaymentData({ ...paymentData, paymentType: e.target.value })
                          }
                        />
                        <span>Receive</span>
                      </label>
                    </div>
                  </div>

                  <div className='payment-field'>
                    <label className='payment-label accent'>Partner</label>
                    <div className='payment-partner'>
                      <span className='partner-name'>{formData.customerName}</span>
                    </div>
                  </div>

                  <div className='payment-field'>
                    <label className='payment-label accent'>Amount</label>
                    <div className='payment-amount-wrapper'>
                      <input
                        type='number'
                        min='0'
                        value={paymentData.amount}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            amount: Number(e.target.value),
                          })
                        }
                        className='payment-amount-input'
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className='payment-form-right'>
                  <div className='payment-field'>
                    <label className='payment-label'>Date</label>
                    <input
                      type='date'
                      value={paymentData.date || new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, date: e.target.value })
                      }
                      className='payment-date-input'
                    />
                  </div>

                  <div className='payment-field'>
                    <label className='payment-label'>Note</label>
                    <input
                      type='text'
                      value={paymentData.reference}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, reference: e.target.value })
                      }
                      placeholder='Alpha numeric (text)'
                      className='payment-note-input'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .inv-container {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .inv-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          height: 100vh;
          color: #64748b;
          font-size: 1rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Header */
        .inv-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .btn-new {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-new:hover {
          background: #1e293b;
        }

        .inv-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          flex: 1;
        }

        .header-nav {
          display: flex;
          gap: 0.5rem;
        }

        .btn-nav {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .btn-nav:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        /* Info Card */
        .info-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 1rem;
        }

        .info-grid:last-child {
          margin-bottom: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
        }

        .due-date-label {
          color: #f472b6 !important;
        }

        .form-group input,
        .form-group select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #10b981;
        }

        .input-readonly {
          background: #f8fafc;
          color: #64748b;
        }

        .due-date-input {
          border-color: #f472b6 !important;
        }

        /* Select Wrapper */
        .select-wrapper {
          position: relative;
        }

        .select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          background: white;
          transition: border-color 0.2s;
        }

        .select-trigger:hover {
          border-color: #cbd5e1;
        }

        .selected-value {
          color: #0f172a;
        }

        .placeholder {
          color: #94a3b8;
        }

        .dropdown-portal {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 100;
          margin-top: 4px;
        }

        .dropdown-list {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-height: 200px;
          overflow-y: auto;
        }

        .dropdown-item {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          transition: background 0.15s;
        }

        .dropdown-item:hover {
          background: #f1f5f9;
        }

        .dropdown-empty {
          padding: 0.75rem;
          color: #94a3b8;
          text-align: center;
          font-size: 0.875rem;
        }

        /* Status Section */
        .status-section {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .status-pills {
          display: flex;
          gap: 0.5rem;
        }

        .status-pill {
          padding: 0.375rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #f1f5f9;
          color: #94a3b8;
          border: 1px solid #e2e8f0;
        }

        .status-pill.active {
          background: #f1f5f9;
          color: #475569;
          border-color: #cbd5e1;
        }

        .status-pill.active.confirmed {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-color: #10b981;
        }

        .status-pill.active.cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border-color: #ef4444;
        }

        /* Action Bar */
        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .action-left {
          display: flex;
          gap: 0.5rem;
        }

        .action-right {
          display: flex;
          gap: 0.5rem;
        }

        .btn-action {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-action.btn-confirm {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .btn-action.btn-confirm:hover {
          background: #059669;
        }

        .btn-action.btn-cancel-action {
          color: #dc2626;
          border-color: #fecaca;
        }

        .btn-action.btn-cancel-action:hover {
          background: #fef2f2;
        }

        .btn-action.btn-pay {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }

        .btn-action.btn-pay:hover {
          background: #7c3aed;
        }

        /* Payment Status Pills */
        .payment-status-pills {
          display: flex;
          gap: 0.5rem;
        }

        .payment-pill {
          padding: 0.375rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #f1f5f9;
          color: #94a3b8;
          border: 1px solid #e2e8f0;
        }

        .payment-pill.active.paid {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-color: #10b981;
        }

        .payment-pill.active.partial {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border-color: #f59e0b;
        }

        .payment-pill.active.not-paid {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border-color: #ef4444;
        }

        /* Lines Table */
        .lines-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .lines-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .lines-table th {
          text-align: left;
          padding: 0.75rem 0.5rem;
          border-bottom: 2px solid #e2e8f0;
          color: #64748b;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .lines-table td {
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .col-sr { width: 60px; text-align: center; }
        .col-product { width: 25%; }
        .col-budget { width: 20%; }
        .col-qty { width: 80px; }
        .col-price { width: 120px; }
        .col-total { width: 120px; text-align: right; }
        .col-actions { width: 50px; text-align: center; }

        /* Cell Select */
        .cell-select {
          position: relative;
        }

        .cell-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.375rem 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          background: white;
          font-size: 0.85rem;
          min-height: 32px;
        }

        .cell-trigger:hover {
          border-color: #cbd5e1;
        }

        .cell-placeholder {
          color: #94a3b8;
        }

        .analytics-value {
          color: #10b981;
          font-weight: 500;
        }

        .cell-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 50;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-height: 180px;
          overflow-y: auto;
          margin-top: 2px;
        }

        .cell-option {
          padding: 0.5rem;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.15s;
        }

        .cell-option:hover {
          background: #f1f5f9;
        }

        /* Inputs */
        .qty-input,
        .price-input {
          width: 100%;
          padding: 0.375rem 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.85rem;
          text-align: right;
          outline: none;
        }

        .qty-input:focus,
        .price-input:focus {
          border-color: #10b981;
        }

        .line-total {
          font-weight: 600;
          color: #10b981;
        }

        .btn-remove {
          padding: 0.25rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s;
        }

        .btn-remove:hover:not(:disabled) {
          background: #fef2f2;
          color: #dc2626;
        }

        .btn-remove:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-add-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .btn-add-line:hover {
          background: #f1f5f9;
          border-color: #10b981;
          color: #10b981;
        }

        /* Totals */
        .totals-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 2px solid #e2e8f0;
        }

        .totals-row {
          display: flex;
          justify-content: flex-end;
          gap: 2rem;
          padding: 0.5rem 0;
        }

        .totals-label {
          font-weight: 500;
          color: #64748b;
          min-width: 120px;
          text-align: right;
        }

        .totals-value {
          font-weight: 600;
          min-width: 120px;
          text-align: right;
        }

        .grand-total .totals-label {
          color: #10b981;
          font-size: 1rem;
        }

        .grand-total .totals-value {
          color: #10b981;
          font-size: 1.25rem;
        }

        .amount-due .totals-label,
        .amount-due .totals-value {
          color: #f472b6;
        }

        /* Save Section */
        .save-section {
          display: flex;
          justify-content: flex-end;
        }

        .btn-save {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          min-width: 180px;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Payment Modal - Light Theme */
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .payment-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
        }

        .payment-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 12px 12px 0 0;
        }

        .btn-new-payment {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-new-payment:hover {
          background: #1e293b;
        }

        .payment-number {
          color: #0f172a;
          font-size: 1rem;
          font-weight: 500;
          flex: 1;
        }

        .btn-close-modal {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
        }

        .btn-close-modal:hover {
          color: #ef4444;
        }

        .payment-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .payment-actions-left {
          display: flex;
          gap: 0.5rem;
        }

        .btn-payment-action {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-payment-action:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-payment-action.btn-confirm-payment {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .btn-payment-action.btn-confirm-payment:hover {
          background: #059669;
        }

        .payment-status-pills-modal {
          display: flex;
          gap: 0.5rem;
        }

        .payment-status-pill {
          padding: 0.375rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #f1f5f9;
          color: #94a3b8;
          border: 1px solid #e2e8f0;
        }

        .payment-status-pill.active {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-color: #10b981;
        }

        .payment-form {
          padding: 1.5rem;
        }

        .payment-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .payment-form-left,
        .payment-form-right {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .payment-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .payment-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
        }

        .payment-label.accent {
          color: #10b981;
        }

        .btn-payment-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payment-radio-group {
          display: flex;
          gap: 1.5rem;
        }

        .payment-radio {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #0f172a;
          cursor: pointer;
        }

        .payment-radio input[type='radio'] {
          accent-color: #10b981;
          width: 16px;
          height: 16px;
        }

        .payment-partner {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .partner-name {
          font-size: 1rem;
          color: #0f172a;
          font-weight: 500;
        }

        .partner-hint,
        .amount-hint,
        .date-hint {
          font-size: 0.75rem;
          color: #94a3b8;
          font-style: italic;
        }

        .payment-amount-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .payment-amount-input,
        .payment-date-input,
        .payment-note-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.5rem 0;
          font-size: 1rem;
          color: #0f172a;
          outline: none;
        }

        .payment-amount-input:focus,
        .payment-date-input:focus,
        .payment-note-input:focus {
          border-bottom-color: #10b981;
        }

        .payment-amount-input::placeholder,
        .payment-note-input::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
