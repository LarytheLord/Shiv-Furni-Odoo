import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalFormView from '../PortalFormView';
import { FileText, Calendar, CreditCard } from 'lucide-react';

export default function CustomerInvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data
    const invoice = {
        number: 'INV-2024-001',
        date: '2024-03-12',
        dueDate: '2024-03-19',
        status: 'PAID',
        total: 47200,
        subtotal: 40000,
        tax: 7200,
        billingAddress: '123, Gandhi Road, Ahmedabad, Gujarat',
        items: [
            { id: 1, name: 'Office Desk Premium', qty: 2, price: 15000, total: 30000 },
            { id: 2, name: 'Ergonomic Chair', qty: 2, price: 5000, total: 10000 },
        ]
    };

    return (
        <PortalFormView
            title={`Invoice ${invoice.number}`}
            subtitle={`Due on ${invoice.dueDate}`}
            status={invoice.status}
            statusColor={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'danger' : 'warning'}
            onBack={() => navigate('/portal/customer/invoices')}
        >
            <div className="invoice-grid">
                <div className="invoice-to">
                    <h3>Billed To:</h3>
                    <p className="address">{invoice.billingAddress}</p>
                </div>
                <div className="invoice-meta">
                    <div className="meta-row">
                        <span>Invoice Date:</span>
                        <strong>{invoice.date}</strong>
                    </div>
                    <div className="meta-row">
                        <span>Due Date:</span>
                        <strong>{invoice.dueDate}</strong>
                    </div>
                </div>
            </div>

            <div className="items-table-container">
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td className="text-right">{item.qty}</td>
                                <td className="text-right">₹{item.price.toLocaleString()}</td>
                                <td className="text-right font-bold">₹{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="text-right label">Subtotal</td>
                            <td className="text-right">₹{invoice.subtotal.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="text-right label">Tax (18%)</td>
                            <td className="text-right">₹{invoice.tax.toLocaleString()}</td>
                        </tr>
                        <tr className="grand-total-row">
                            <td colSpan="3" className="text-right label">Total Due</td>
                            <td className="text-right">₹{invoice.total.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <style>{`
                .invoice-grid {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .invoice-to h3 {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin: 0 0 0.5rem;
                    text-transform: uppercase;
                }
                
                .address {
                    font-size: 1rem;
                    color: #0f172a;
                    max-width: 300px;
                    line-height: 1.5;
                }

                .invoice-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .meta-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 2rem;
                    font-size: 0.9375rem;
                }

                .meta-row span { color: #64748b; }
                .meta-row strong { color: #0f172a; }
                
                .font-bold { font-weight: 600; }
                .text-right { text-align: right; }
                
                .items-table-container {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .portal-table { width: 100%; border-collapse: collapse; }
                .portal-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase; color: #64748b; }
                .portal-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
                
                .grand-total-row td {
                    background: #f8fafc;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                
                @media (max-width: 640px) {
                    .invoice-grid { flex-direction: column; gap: 1.5rem; }
                }
            `}</style>
        </PortalFormView>
    );
}
