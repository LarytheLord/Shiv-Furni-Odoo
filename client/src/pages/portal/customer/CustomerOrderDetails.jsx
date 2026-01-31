import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalFormView from '../PortalFormView';
import { Package, MapPin, Calendar, CreditCard } from 'lucide-react';

export default function CustomerOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data
    const order = {
        scanId: 'SO2024001',
        date: '2024-03-10',
        status: 'CONFIRMED',
        total: 45000,
        subtotal: 40000,
        tax: 5000,
        shippingAddress: '123, Gandhi Road, Ahmedabad, Gujarat',
        billingAddress: '123, Gandhi Road, Ahmedabad, Gujarat',
        items: [
            { id: 1, name: 'Office Desk Premium', qty: 2, price: 15000, total: 30000 },
            { id: 2, name: 'Ergonomic Chair', qty: 2, price: 5000, total: 10000 },
        ]
    };

    return (
        <PortalFormView
            title={`Order ${order.scanId}`}
            subtitle={order.date}
            status={order.status}
            statusColor="success" // dynamic based on status
            onBack={() => navigate('/portal/customer/orders')}
        >
            {/* Order Summary Grid */}
            <div className="detail-grid">
                <div className="detail-section">
                    <h3><Package size={18} /> Order Details</h3>
                    <div className="info-row">
                        <span className="label">Order Date:</span>
                        <span className="value">{order.date}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Payment Method:</span>
                        <span className="value">Bank Transfer</span>
                    </div>
                </div>

                <div className="detail-section">
                    <h3><MapPin size={18} /> Shipping</h3>
                    <p className="address-text">{order.shippingAddress}</p>
                </div>
            </div>

            {/* Items Table */}
            <div className="items-table-container">
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th className="text-right">Quantity</th>
                            <th className="text-right">Unit Price</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div className="product-cell">
                                        <div className="product-img-placeholder"></div>
                                        <span>{item.name}</span>
                                    </div>
                                </td>
                                <td className="text-right">{item.qty}</td>
                                <td className="text-right">₹{item.price.toLocaleString()}</td>
                                <td className="text-right font-bold">₹{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="text-right label">Subtotal</td>
                            <td className="text-right">₹{order.subtotal.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="text-right label">Tax (18%)</td>
                            <td className="text-right">₹{order.tax.toLocaleString()}</td>
                        </tr>
                        <tr className="grand-total-row">
                            <td colSpan="3" className="text-right label">Grand Total</td>
                            <td className="text-right">₹{order.total.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <style>{`
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2rem;
                    margin-bottom: 2.5rem;
                }

                .detail-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    font-size: 0.9375rem;
                }

                .label { color: #64748b; }
                .value { color: #334155; font-weight: 500; }
                .address-text { color: #334155; line-height: 1.5; margin: 0; font-size: 0.9375rem; }

                .items-table-container {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .portal-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .portal-table th {
                    background: #f8fafc;
                    padding: 0.875rem 1rem;
                    text-align: left;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .portal-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                    font-size: 0.9375rem;
                }

                .portal-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .text-right { text-align: right; }
                .font-bold { font-weight: 600; }

                .product-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 500;
                }

                .product-img-placeholder {
                    width: 32px;
                    height: 32px;
                    background: #e2e8f0;
                    border-radius: 6px;
                }

                .portal-table tfoot td {
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                }

                .grand-total-row td {
                    background: #f1f5f9;
                    font-weight: 700;
                    font-size: 1.125rem;
                    color: #0f172a;
                }

                @media (max-width: 640px) {
                    .detail-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </PortalFormView>
    );
}
