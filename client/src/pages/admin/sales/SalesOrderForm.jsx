import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormView from '../../../components/ui/FormView';

export default function SalesOrderForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        name: isNew ? 'SO (Auto)' : 'SO0001',
        customer: isNew ? '' : 'Gemini Furniture',
        date: '2026-01-18',
        status: isNew ? 'Draft' : 'Confirm',
        lines: [
            { id: 1, product: 'Office Chair', budget: 'Deepawali', qty: 10, price: 2500, total: 25000 },
        ]
    });

    const statusOptions = ['Draft', 'Confirm', 'Cancelled'];

    return (
        <FormView
            title={formData.name}
            status={formData.status}
            statusOptions={statusOptions}
            breadcrumbs={['Sales', 'Orders']}
            onBack={() => navigate('/admin/sales-orders')}
            actions={
                formData.status === 'Confirm' && (
                    <button className="btn-erp btn-erp-primary" onClick={() => navigate('/admin/invoices/new')}>
                        Create Invoice
                    </button>
                )
            }
        >
            <div className="erp-form-grid">
                <div className="form-section">
                    <div className="form-group">
                        <label>Customer</label>
                        <input type="text" className="erp-input" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Order Date</label>
                        <input type="date" className="erp-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold text-slate-700 mb-2">Order Lines</h3>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-500">
                                <th className="py-2">Product</th>
                                <th className="py-2">Budget Analytics</th>
                                <th className="py-2 text-right">Qty</th>
                                <th className="py-2 text-right">Unit Price</th>
                                <th className="py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.lines.map(line => (
                                <tr key={line.id} className="border-b border-slate-100">
                                    <td className="py-2">{line.product}</td>
                                    <td className="py-2 text-green-600">{line.budget}</td>
                                    <td className="py-2 text-right">{line.qty}</td>
                                    <td className="py-2 text-right">{line.price}</td>
                                    <td className="py-2 text-right">{line.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="4" className="text-right font-bold py-4">Total:</td>
                                <td className="text-right font-bold py-4">
                                    {formData.lines.reduce((sum, l) => sum + l.total, 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <style>{`
        .erp-form-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-section { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--slate-700); }
        .erp-input { border: 1px solid #cbd5e1; border-radius: 4px; padding: 0.4rem 0.6rem; font-size: 0.9rem; outline: none; }
       `}</style>
        </FormView>
    );
}
