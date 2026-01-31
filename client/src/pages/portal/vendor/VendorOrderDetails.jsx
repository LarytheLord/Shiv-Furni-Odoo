import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalFormView from '../PortalFormView';
import { Package, Truck } from 'lucide-react';

export default function VendorOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data
    const order = {
        poNumber: 'PO-2024-055',
        date: '2024-03-25',
        status: 'CONFIRMED',
        total: 156000,
        subtotal: 132203,
        tax: 23797,
        deliveryAddress: 'Shiv Furniture Warehouse, Ahmedabad',
        items: [
            { id: 1, name: 'Teak Wood Raw Planks', qty: 50, price: 2500, total: 125000 },
            { id: 2, name: 'Varnish Premium', qty: 20, price: 360, total: 7200 },
        ]
    };

    return (
        <PortalFormView
            title={`Purchase Order ${order.poNumber}`}
            subtitle={order.date}
            status={order.status}
            statusColor="primary"
            onBack={() => navigate('/portal/vendor/orders')}
        >
            <div className="order-grid">
                <div className="grid-section">
                    <h3>Delivery To</h3>
                    <div className="delivery-box">
                        <Truck size={20} />
                        <div>
                            <p className="location-name">Warehouse</p>
                            <p className="address">{order.deliveryAddress}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="items-table-container">
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>Product / Material</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Unit Cost</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
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
                            <td colSpan="3" className="text-right label">Total Value</td>
                            <td className="text-right">₹{order.total.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <style>{`
                .order-grid {
                    margin-bottom: 2rem;
                }
                
                .grid-section h3 {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin: 0 0 1rem;
                    text-transform: uppercase;
                }

                .delivery-box {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                }

                .location-name {
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 0.25rem;
                }

                .address { margin: 0; font-size: 0.9rem; }
                
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
