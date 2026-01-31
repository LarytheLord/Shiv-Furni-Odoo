import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormView from '../../../components/ui/FormView';

export default function PurchaseOrderForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        name: isNew ? 'PO (Auto)' : 'PO0001',
        vendor: isNew ? '' : 'Azure Interior',
        date: '2026-01-15',
        reference: 'REQ-25-0001',
        status: isNew ? 'Draft' : 'Confirm',
        lines: [
            { id: 1, product: 'Table', budget: 'Deepawali', qty: 6, price: 2300, total: 13800 },
            { id: 2, product: 'Chair', budget: 'Deepawali', qty: 3, price: 950, total: 2850 },
        ]
    });

    const statusOptions = ['Draft', 'Confirm', 'Cancelled'];

    return (
        <FormView
            title={formData.name}
            status={formData.status}
            statusOptions={statusOptions}
            breadcrumbs={['Purchase', 'Orders']}
            onBack={() => navigate('/admin/purchase-orders')}
            actions={
                formData.status === 'Confirm' && (
                    <button className="btn-erp btn-erp-secondary" onClick={() => navigate('/admin/bills/new')}>
                        Create Bill
                    </button>
                )
            }
        >
            <div className="erp-form-grid">
                <div className="form-section">
                    <div className="form-group">
                        <label>Vendor</label>
                        <input type="text" className="erp-input" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Order Date</label>
                        <input type="date" className="erp-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Vendor Reference</label>
                        <input type="text" className="erp-input" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
                    </div>
                </div>

                <div className="mt-8">
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
                                    <td className="py-2 text-orange-600">{line.budget}</td>
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
        .erp-input:focus { border-color: var(--accent-500); }
       `}</style>
        </FormView>
    );
}
