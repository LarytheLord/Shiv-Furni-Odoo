import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalFormView from '../PortalFormView';
import { Package, Truck, FileText } from 'lucide-react';

export default function VendorBillDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data
    const bill = {
        number: 'BILL-001',
        date: '2024-03-26',
        dueDate: '2024-04-10',
        status: 'OPEN',
        total: 156000,
        subtotal: 132203,
        tax: 23797,
        items: [
            { id: 1, name: 'Teak Wood Raw Planks', qty: 50, price: 2500, total: 125000 },
            { id: 2, name: 'Varnish Premium', qty: 20, price: 360, total: 7200 },
        ]
    };

    return (
        <PortalFormView
            title={`Bill ${bill.number}`}
            subtitle={`Created on ${bill.date}`}
            status={bill.status}
            statusColor={bill.status === 'PAID' ? 'success' : 'warning'}
            onBack={() => navigate('/portal/vendor/bills')}
        >
            <div className="bill-meta-grid">
                <div className="meta-card">
                    <span className="label">Total Amount</span>
                    <span className="amount-highlight">₹{bill.total.toLocaleString()}</span>
                </div>
                <div className="meta-card">
                    <span className="label">Due Date</span>
                    <span className="date-value">{bill.dueDate}</span>
                </div>
            </div>

            <div className="items-table-container">
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Unit Price</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td className="text-right">{item.qty}</td>
                                <td className="text-right">₹{item.price.toLocaleString()}</td>
                                <td className="text-right font-bold">₹{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="grand-total-row">
                            <td colSpan="3" className="text-right label">Total Payable</td>
                            <td className="text-right">₹{bill.total.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <style>{`
                 .bill-meta-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .meta-card {
                    background: #f8fafc;
                    padding: 1.25rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .label { font-size: 0.875rem; color: #64748b; }
                .amount-highlight { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
                .date-value { font-size: 1.125rem; font-weight: 500; color: #334155; }

                .items-table-container {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .portal-table { width: 100%; border-collapse: collapse; }
                .portal-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase; color: #64748b; }
                .portal-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
                 .font-bold { font-weight: 600; }
                .text-right { text-align: right; }
                
                 .grand-total-row td {
                    background: #f8fafc;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0f172a;
                }
            `}</style>
        </PortalFormView>
    );
}
