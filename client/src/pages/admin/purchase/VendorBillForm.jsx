import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../../api/axios";
import { Loader2, Printer, Send, X } from "lucide-react";

export default function VendorBillForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const poId = searchParams.get("poId");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentType: "Send",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "BANK_TRANSFER",
    amount: 0,
    notes: "",
  });

  const [formData, setFormData] = useState({
    billNo: "",
    vendorId: "",
    vendorName: "",
    billReference: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "DRAFT",
    paymentStatus: "Not Paid",
    paidViaCash: 0,
    paidViaBank: 0,
    purchaseOrderId: "",
    lines: [],
  });

  // Fetch PO data to pre-fill the form
  const fetchPOData = useCallback(async () => {
    if (!poId) return;

    setLoading(true);
    try {
      const { data: response } = await api.get(`/purchase-orders/${poId}`);
      const order = response.data?.order || response.order;

      if (order) {
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + 30);

        setFormData({
          billNo: "",
          vendorId: order.vendorId,
          vendorName: order.vendor?.name || "",
          billReference: order.poNumber || "",
          billDate: today.toISOString().split("T")[0],
          dueDate: dueDate.toISOString().split("T")[0],
          status: "DRAFT",
          paymentStatus: "Not Paid",
          paidViaCash: 0,
          paidViaBank: 0,
          purchaseOrderId: poId,
          lines:
            order.lines?.map((line, index) => ({
              id: line.id || index + 1,
              productId: line.productId,
              product: line.product?.name || "",
              analyticalAccountId: line.analyticalAccountId || "",
              budget: line.analyticalAccount?.name || "",
              qty: Number(line.quantity),
              price: Number(line.unitPrice),
              total:
                Number(line.total) ||
                Number(line.quantity) * Number(line.unitPrice),
            })) || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch PO data:", err);
    } finally {
      setLoading(false);
    }
  }, [poId]);

  // Fetch existing bill data
  const fetchBillData = useCallback(async () => {
    if (isNew || !id) return;

    setLoading(true);
    try {
      const { data: response } = await api.get(`/vendor-bills/${id}`);
      const bill = response.data?.bill || response.bill;

      if (bill) {
        const paidCash =
          bill.payments
            ?.filter((p) => p.paymentMethod === "CASH")
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        const paidBank =
          bill.payments
            ?.filter((p) => p.paymentMethod !== "CASH")
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        setFormData({
          billNo: bill.billNumber,
          vendorId: bill.vendorId,
          vendorName: bill.vendor?.name || "",
          billReference: bill.purchaseOrder?.poNumber || "",
          billDate: new Date(bill.billDate).toISOString().split("T")[0],
          dueDate: new Date(bill.dueDate).toISOString().split("T")[0],
          status: bill.status,
          paymentStatus:
            Number(bill.amountDue) === 0
              ? "Paid"
              : Number(bill.amountDue) < Number(bill.total)
                ? "Partial"
                : "Not Paid",
          paidViaCash: paidCash,
          paidViaBank: paidBank,
          purchaseOrderId: bill.purchaseOrderId || "",
          lines:
            bill.lines?.map((line, index) => ({
              id: line.id || index + 1,
              productId: line.productId,
              product: line.product?.name || "",
              analyticalAccountId: line.analyticalAccountId || "",
              budget: line.analyticalAccount?.name || "",
              qty: Number(line.quantity),
              price: Number(line.unitPrice),
              total: Number(line.total),
            })) || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch bill:", err);
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    if (isNew && poId) {
      fetchPOData();
    } else if (!isNew) {
      fetchBillData();
    }
  }, [isNew, poId, fetchPOData, fetchBillData]);

  const calculateTotal = () =>
    formData.lines.reduce((sum, l) => sum + l.total, 0);
  const amountDue =
    calculateTotal() - formData.paidViaCash - formData.paidViaBank;

  // Open payment modal
  const openPaymentModal = () => {
    setPaymentData({
      paymentType: "Send",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "BANK_TRANSFER",
      amount: amountDue,
      notes: "",
    });
    setShowPaymentModal(true);
  };

  // Submit payment
  const handlePaymentSubmit = async () => {
    if (!id || isNew) {
      alert("Please save the bill first");
      return;
    }

    if (paymentData.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (paymentData.amount > amountDue) {
      alert(`Amount cannot exceed amount due (${amountDue.toLocaleString()})`);
      return;
    }

    setSaving(true);
    try {
      await api.post("/bill-payments", {
        vendorBillId: id,
        paymentDate: paymentData.paymentDate,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
      });

      // Refresh bill data
      await fetchBillData();
      setShowPaymentModal(false);
    } catch (err) {
      console.error("Failed to record payment:", err);
      alert(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  // Save bill
  const handleSave = async () => {
    if (!formData.vendorId) {
      alert("Please select a vendor");
      return;
    }
    if (!formData.dueDate) {
      alert("Please select a due date");
      return;
    }
    if (formData.lines.length === 0) {
      alert("Please add at least one line item");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vendorId: formData.vendorId,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        billDate: formData.billDate,
        dueDate: formData.dueDate,
        lines: formData.lines.map((line) => ({
          productId: line.productId,
          quantity: line.qty,
          unitPrice: line.price,
          analyticalAccountId: line.analyticalAccountId || undefined,
        })),
      };

      if (isNew) {
        const response = await api.post("/vendor-bills", payload);
        const newBill = response.data?.data?.bill || response.data?.bill;
        if (newBill?.id) {
          navigate(`/admin/bills/${newBill.id}`);
        } else {
          navigate("/admin/bills");
        }
      } else {
        await api.patch(`/vendor-bills/${id}`, payload);
        await fetchBillData();
      }
    } catch (err) {
      console.error("Failed to save bill:", err);
      alert(err.response?.data?.message || "Failed to save bill");
    } finally {
      setSaving(false);
    }
  };

  // Confirm bill
  const handleConfirm = async () => {
    // Validate first
    if (!formData.vendorId) {
      alert("Please select a vendor");
      return;
    }
    if (!formData.dueDate) {
      alert("Please select a due date");
      return;
    }
    if (formData.lines.length === 0) {
      alert("Please add at least one line item");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        // First save the bill
        const payload = {
          vendorId: formData.vendorId,
          purchaseOrderId: formData.purchaseOrderId || undefined,
          billDate: formData.billDate,
          dueDate: formData.dueDate,
          lines: formData.lines.map((line) => ({
            productId: line.productId,
            quantity: line.qty,
            unitPrice: line.price,
            analyticalAccountId: line.analyticalAccountId || undefined,
          })),
        };

        const response = await api.post("/vendor-bills", payload);
        const newBill = response.data?.data?.bill || response.data?.bill;

        if (newBill?.id) {
          // Then confirm the newly created bill
          await api.post(`/vendor-bills/${newBill.id}/confirm`);
          navigate(`/admin/bills/${newBill.id}`);
        } else {
          navigate("/admin/bills");
        }
      } else {
        // For existing bills, just confirm
        await api.post(`/vendor-bills/${id}/confirm`);
        setFormData((prev) => ({ ...prev, status: "CONFIRMED" }));
      }
    } catch (err) {
      console.error("Failed to confirm bill:", err);
      alert(err.response?.data?.message || "Failed to confirm bill");
    } finally {
      setSaving(false);
    }
  };

  // Print bill
  const handlePrint = async () => {
    if (isNew || !id) {
      alert("Please save the bill first");
      return;
    }

    try {
      const response = await api.get(`/vendor-bills/${id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${formData.billNo || "bill"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF");
    }
  };

  // Get payment status
  const getPaymentStatus = () => {
    const total = calculateTotal();
    const paid = formData.paidViaCash + formData.paidViaBank;
    if (paid >= total) return "Paid";
    if (paid > 0) return "Partial";
    return "Not Paid";
  };

  // Check if can pay
  const canPay =
    (formData.status === "CONFIRMED" || formData.status === "PARTIALLY_PAID") &&
    getPaymentStatus() !== "Paid" &&
    !isNew;

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={32} className="spin" />
        <style>{`
                    .loading-container { display: flex; justify-content: center; align-items: center; height: 100vh; }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
      </div>
    );
  }

  return (
    <div className="vendor-bill-container">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                Payment - Pay/{new Date().getFullYear().toString().slice(-2)}
                /0001
              </span>
            </div>

            <div className="modal-actions">
              <button
                className="btn-modal-action btn-pay-modal"
                onClick={handlePaymentSubmit}
                disabled={saving}
              >
                {saving ? <Loader2 size={14} className="spin" /> : null}
                Pay
              </button>
              <button
                className="btn-modal-action"
                onClick={() => setShowPaymentModal(false)}
              >
                Close
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                {/* Left Column */}
                <div className="modal-col">
                  <div className="modal-field">
                    <label>Payment Type</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="paymentType"
                          value="Send"
                          checked={paymentData.paymentType === "Send"}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              paymentType: e.target.value,
                            })
                          }
                        />
                        Send
                      </label>
                      <label className="radio-label disabled-option">
                        <input
                          type="radio"
                          name="paymentType"
                          value="Receive"
                          checked={paymentData.paymentType === "Receive"}
                          disabled={true}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              paymentType: e.target.value,
                            })
                          }
                        />
                        Receive
                      </label>
                    </div>
                  </div>
                  <div className="modal-field">
                    <label>Partner</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={formData.vendorName}
                      readOnly
                    />
                    <span className="field-hint">
                      ( auto fill partner name from Invoice/Bill)
                    </span>
                  </div>
                  <div className="modal-field">
                    <label className="label-accent">Amount</label>
                    <input
                      type="number"
                      className="modal-input amount-input"
                      value={paymentData.amount}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          amount: Number(e.target.value),
                        })
                      }
                    />
                    <span className="field-hint">
                      ( auto fill amount due from Invoice/Bill)
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="modal-col">
                  <div className="modal-field">
                    <label>Date</label>
                    <input
                      type="date"
                      className="modal-input"
                      value={paymentData.paymentDate}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          paymentDate: e.target.value,
                        })
                      }
                    />
                    <span className="field-hint">(Default Today Date)</span>
                  </div>
                  <div className="modal-field">
                    <label>Payment Via</label>
                    <select
                      className="modal-input"
                      value={paymentData.paymentMethod}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="BANK_TRANSFER">Bank</option>
                      <option value="CASH">Cash</option>
                    </select>
                    <span className="field-hint">
                      (Default Bank can be adjustable to Cash)
                    </span>
                  </div>
                  <div className="modal-field">
                    <label>Note</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={paymentData.notes}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Alpha numeric ( text )"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bill-card">
        {/* Top Header Row */}
        <div className="card-header">
          <button
            className="btn-new"
            onClick={() => navigate("/admin/bills/new")}
          >
            New
          </button>
          <div className="header-right-btns">
            <button className="btn-nav" onClick={() => navigate("/admin")}>
              Home
            </button>
            <button
              className="btn-nav"
              onClick={() => navigate("/admin/bills")}
            >
              Back
            </button>
          </div>
        </div>

        {/* Bill Info Section */}
        <div className="bill-info-section">
          {/* Left Column */}
          <div className="bill-info-left">
            <div className="info-row">
              <label className="info-label">Vendor Bill No.</label>
              <div className="info-value">
                <input
                  type="text"
                  className="erp-input-underline"
                  value={formData.billNo || "(Auto-generated)"}
                  readOnly
                />
              </div>
            </div>
            <div className="info-row">
              <label className="info-label info-label-accent">
                Vendor Name
              </label>
              <div className="info-value">
                <input
                  type="text"
                  className="erp-input-underline"
                  value={formData.vendorName}
                  readOnly
                />
              </div>
            </div>
            <div className="info-row">
              <label className="info-label info-label-accent">
                Bill Reference
              </label>
              <div className="info-value">
                <input
                  type="text"
                  className="erp-input-underline"
                  value={formData.billReference}
                  onChange={(e) =>
                    setFormData({ ...formData, billReference: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="bill-info-right">
            <div className="info-row">
              <label className="info-label">Bill Date</label>
              <div className="info-value">
                <input
                  type="date"
                  className="erp-input-underline"
                  value={formData.billDate}
                  onChange={(e) =>
                    setFormData({ ...formData, billDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="info-row">
              <label className="info-label">Due Date</label>
              <div className="info-value">
                <input
                  type="date"
                  className="erp-input-underline"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="info-row">
              <label className="info-label">Status</label>
              <div className="status-buttons">
                <button
                  className={`status-btn ${getPaymentStatus() === "Paid" ? "active" : ""}`}
                >
                  Paid
                </button>
                <button
                  className={`status-btn ${getPaymentStatus() === "Partial" ? "active" : ""}`}
                >
                  Partial
                </button>
                <button
                  className={`status-btn ${getPaymentStatus() === "Not Paid" ? "active" : ""}`}
                >
                  Not Paid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="action-buttons-row">
          <div className="action-left">
            {formData.status === "DRAFT" && (
              <button
                className="btn-action btn-confirm"
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving ? <Loader2 size={14} className="spin" /> : null}
                Confirm
              </button>
            )}
            <button className="btn-action" onClick={handlePrint}>
              <Printer size={14} /> Print
            </button>
            <button className="btn-action">
              <Send size={14} /> Send
            </button>
            <button
              className="btn-action"
              onClick={() => navigate("/admin/bills")}
            >
              <X size={14} /> Cancel
            </button>
            <button
              className={`btn-action btn-pay ${canPay ? "" : "disabled"}`}
              onClick={canPay ? openPaymentModal : undefined}
              disabled={!canPay}
            >
              Pay
            </button>
            {/* <button
              className="btn-action"
              onClick={() => navigate("/admin/budgets")}
            >
              Budget
            </button> */}
          </div>
          <div className="status-tabs">
            <button
              className={`status-tab ${formData.status === "DRAFT" ? "active" : ""}`}
            >
              Draft
            </button>
            <button
              className={`status-tab ${formData.status === "CONFIRMED" ? "active" : ""}`}
            >
              Confirm
            </button>
            <button
              className={`status-tab ${formData.status === "CANCELLED" ? "active" : ""}`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th className="col-sr">Sr. No.</th>
                <th className="col-product">Product</th>
                <th className="col-budget">Budget Analytics</th>
                <th className="col-qty">
                  <span className="col-number">1</span>Qty
                </th>
                <th className="col-price">
                  <span className="col-number">2</span>Unit Price
                </th>
                <th className="col-total">
                  <span className="col-number">3</span>Total
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.lines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-message">
                    No line items.{" "}
                    {isNew &&
                      !poId &&
                      "Create from a Purchase Order to add items."}
                  </td>
                </tr>
              ) : (
                formData.lines.map((line, index) => (
                  <tr key={line.id}>
                    <td className="col-sr">{index + 1}</td>
                    <td className="col-product">{line.product}</td>
                    <td className="col-budget budget-value">{line.budget}</td>
                    <td className="col-qty">{line.qty}</td>
                    <td className="col-price">{line.price.toLocaleString()}</td>
                    <td className="col-total">
                      <span className="total-value">
                        {line.total.toLocaleString()}
                      </span>
                      <span className="total-calc">
                        ({line.qty} Qty × {line.price})
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan="3" className="total-label">
                  Total
                </td>
                <td></td>
                <td></td>
                <td className="grand-total">
                  {calculateTotal().toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="payment-summary">
          <div className="payment-row">
            <span className="payment-label">Paid Via Cash</span>
            <span className="payment-value">
              {formData.paidViaCash > 0
                ? formData.paidViaCash.toLocaleString()
                : ""}
            </span>
          </div>
          <div className="payment-row">
            <span className="payment-label">Paid Via Bank</span>
            <span className="payment-value">
              {formData.paidViaBank > 0
                ? formData.paidViaBank.toLocaleString()
                : ""}
            </span>
          </div>
          <div className="payment-row amount-due">
            <span className="payment-label">Amount Due</span>
            <span className="payment-value due-value">
              {amountDue.toLocaleString()}
            </span>
          </div>
          <div className="payment-hint">(Total - Payment)</div>
        </div>
      </div>

      <style>{`
                .vendor-bill-container {
                    padding: 1.5rem;
                    min-height: 100vh;
                    background: #f1f5f9;
                }

                .bill-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    max-width: 1100px;
                    margin: 0 auto;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                }

                .btn-new, .btn-nav {
                    background: white;
                    color: var(--slate-700, #334155);
                    border: 1px solid #d1d5db;
                    padding: 0.5rem 1.25rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-new:hover, .btn-nav:hover {
                    background: #f8fafc;
                    border-color: #9ca3af;
                }

                .header-right-btns {
                    display: flex;
                    gap: 0.5rem;
                }

                .bill-info-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .info-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .info-label {
                    min-width: 120px;
                    color: var(--slate-600, #475569);
                    font-size: 0.875rem;
                    font-weight: 500;
                    padding-top: 0.25rem;
                }

                .info-label-accent {
                    color: var(--accent-600, #007175);
                }

                .info-value {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .erp-input-underline {
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid #d1d5db;
                    color: var(--slate-800, #1e293b);
                    padding: 0.25rem 0;
                    font-size: 0.9rem;
                    width: 100%;
                    transition: border-color 0.2s;
                }

                .erp-input-underline:focus {
                    outline: none;
                    border-bottom-color: var(--accent-500, #00878b);
                }

                .erp-input-underline:read-only {
                    color: var(--slate-600, #475569);
                }

                .status-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .status-btn {
                    background: white;
                    color: var(--slate-600, #475569);
                    border: 1px solid #d1d5db;
                    padding: 0.375rem 0.875rem;
                    border-radius: 6px;
                    cursor: default;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .status-btn.active {
                    background: var(--accent-600, #007175);
                    border-color: var(--accent-600, #007175);
                    color: white;
                }

                .action-buttons-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                }

                .action-left {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-action {
                    background: white;
                    color: var(--slate-700, #334155);
                    border: 1px solid #d1d5db;
                    padding: 0.5rem 0.875rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .btn-action:hover:not(:disabled):not(.disabled) {
                    background: #f8fafc;
                    border-color: #9ca3af;
                }

                .btn-action:disabled, .btn-action.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-action.btn-confirm {
                    border-color: var(--accent-600, #007175);
                    color: var(--accent-600, #007175);
                }

                .btn-action.btn-pay {
                    background: var(--accent-600, #007175);
                    border-color: var(--accent-600, #007175);
                    color: white;
                }

                .btn-action.btn-pay:hover:not(:disabled):not(.disabled) {
                    background: var(--accent-700, #005a5d);
                }

                .status-tabs {
                    display: flex;
                    gap: 0.25rem;
                    background: #e2e8f0;
                    padding: 0.25rem;
                    border-radius: 6px;
                }

                .status-tab {
                    background: transparent;
                    color: var(--slate-600, #475569);
                    border: none;
                    padding: 0.4rem 0.875rem;
                    border-radius: 4px;
                    cursor: default;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .status-tab.active {
                    background: white;
                    color: var(--slate-800, #1e293b);
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }

                .products-table-container {
                    padding: 0;
                }

                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                }

                .products-table th {
                    text-align: left;
                    padding: 0.875rem 1rem;
                    color: var(--slate-600, #475569);
                    font-weight: 600;
                    border-bottom: 2px solid #e2e8f0;
                    background: #f8fafc;
                }

                .products-table th .col-number {
                    display: block;
                    color: var(--accent-600, #007175);
                    font-size: 0.7rem;
                    margin-bottom: 0.25rem;
                }

                .products-table td {
                    padding: 0.875rem 1rem;
                    color: var(--slate-700, #334155);
                    border-bottom: 1px solid #f1f5f9;
                }

                .products-table tr:hover td {
                    background: #f8fafc;
                }

                .col-sr { width: 60px; }
                .col-product { width: 200px; }
                .col-budget { width: 150px; }
                .col-qty { width: 80px; text-align: center; }
                .col-price { width: 100px; text-align: right; }
                .col-total { width: 120px; text-align: right; }

                .empty-message {
                    text-align: center;
                    color: #9ca3af;
                    padding: 2rem !important;
                }

                .budget-value {
                    color: #d97706 !important;
                    font-weight: 500;
                }

                .total-value {
                    display: block;
                    color: var(--accent-600, #007175);
                    font-weight: 600;
                }

                .total-calc {
                    display: block;
                    color: var(--accent-500, #00878b);
                    font-size: 0.75rem;
                }

                .total-row td {
                    border-top: 2px solid #e2e8f0;
                    padding-top: 1rem;
                    background: #f8fafc;
                }

                .total-label {
                    color: var(--accent-600, #007175) !important;
                    font-weight: 600;
                }

                .grand-total {
                    color: var(--accent-600, #007175) !important;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .payment-summary {
                    padding: 1.25rem 1.5rem;
                    border-top: 1px dashed #d1d5db;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.5rem;
                    background: #f8fafc;
                }

                .payment-row {
                    display: flex;
                    gap: 2rem;
                    min-width: 280px;
                    justify-content: space-between;
                }

                .payment-label {
                    color: var(--slate-600, #475569);
                    font-size: 0.875rem;
                }

                .payment-value {
                    color: var(--slate-800, #1e293b);
                    font-size: 0.875rem;
                    font-weight: 500;
                    min-width: 80px;
                    text-align: right;
                }

                .amount-due .payment-label {
                    color: var(--accent-600, #007175);
                    font-weight: 600;
                }

                .due-value {
                    color: var(--accent-600, #007175) !important;
                    font-weight: 700;
                }

                .payment-hint {
                    color: #9ca3af;
                    font-size: 0.75rem;
                    text-align: right;
                    font-style: italic;
                }

                /* Payment Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .payment-modal {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 700px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }

                .btn-new-modal {
                    background: white;
                    color: var(--slate-700, #334155);
                    border: 1px solid #d1d5db;
                    padding: 0.4rem 1rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                }

                .modal-title {
                    font-weight: 600;
                    color: var(--slate-800, #1e293b);
                }

                .modal-tabs {
                    display: flex;
                    gap: 0.25rem;
                    background: #e2e8f0;
                    padding: 0.25rem;
                    border-radius: 6px;
                }

                .modal-tab {
                    padding: 0.35rem 0.75rem;
                    font-size: 0.75rem;
                    border-radius: 4px;
                    color: var(--slate-600, #475569);
                }

                .modal-tab.active {
                    background: white;
                    color: var(--slate-800, #1e293b);
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }

                .modal-actions {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                }

                .btn-modal-action {
                    background: white;
                    color: var(--slate-700, #334155);
                    border: 1px solid #d1d5db;
                    padding: 0.4rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    transition: all 0.2s;
                }

                .btn-modal-action:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #9ca3af;
                }

                .btn-modal-action:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-pay-modal {
                    background: var(--accent-600, #007175);
                    border-color: var(--accent-600, #007175);
                    color: white;
                }

                .btn-pay-modal:hover:not(:disabled) {
                    background: var(--accent-700, #005a5d);
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .modal-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .modal-field {
                    margin-bottom: 1.25rem;
                }

                .modal-field label {
                    display: block;
                    color: var(--slate-600, #475569);
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .modal-field .label-accent {
                    color: var(--accent-600, #007175);
                }

                .modal-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid #d1d5db;
                    padding: 0.5rem 0;
                    font-size: 0.9rem;
                    color: var(--slate-800, #1e293b);
                    transition: border-color 0.2s;
                }

                .modal-input:focus {
                    outline: none;
                    border-bottom-color: var(--accent-500, #00878b);
                }

                .amount-input {
                    font-weight: 600;
                    font-size: 1rem;
                }

                .field-hint {
                    display: block;
                    color: #9ca3af;
                    font-size: 0.7rem;
                    font-style: italic;
                    margin-top: 0.25rem;
                }

                .radio-group {
                    display: flex;
                    gap: 1.5rem;
                }

                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--slate-700, #334155);
                    font-size: 0.875rem;
                    cursor: pointer;
                }

                .radio-label input[type="radio"] {
                    accent-color: var(--accent-600, #007175);
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .bill-info-section, .modal-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .action-buttons-row {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .action-left, .status-tabs {
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .products-table-container {
                        overflow-x: auto;
                    }

                    .payment-modal {
                        width: 95%;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                }
            `}</style>
    </div>
  );
}
