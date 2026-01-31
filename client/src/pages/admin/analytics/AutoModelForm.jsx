import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormView from '../../../components/ui/FormView';

export default function AutoModelForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        name: isNew ? '' : 'Vendor Bills - Azure',
        partner: isNew ? '' : 'Azure Interior',
        product: 'All',
        analytic: 'Deepawali',
        active: true
    });

    return (
        <FormView
            title={formData.name || 'New Analytic Model'}
            status={formData.active ? 'Active' : 'Archived'}
            statusOptions={['Active', 'Archived']}
            breadcrumbs={['Analytics', 'Models']}
            onBack={() => navigate('/admin/analytical-models')}
        >
            <div className="erp-form-grid">
                <div className="form-section">
                    <div className="form-group">
                        <label>Model Name</label>
                        <input type="text" className="erp-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div className="col-span-2">
                        <h3 className="text-sm font-bold text-slate-700 border-b pb-2 mb-4 uppercas mt-4">Conditions</h3>
                    </div>

                    <div className="form-group">
                        <label>Partner</label>
                        <input type="text" className="erp-input" value={formData.partner} onChange={(e) => setFormData({ ...formData, partner: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Product</label>
                        <input type="text" className="erp-input" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} />
                    </div>

                    <div className="col-span-2">
                        <h3 className="text-sm font-bold text-slate-700 border-b pb-2 mb-4 uppercas mt-4">Target</h3>
                    </div>

                    <div className="form-group">
                        <label>Analytic Account to Apply</label>
                        <input type="text" className="erp-input text-orange-600 font-medium" value={formData.analytic} onChange={(e) => setFormData({ ...formData, analytic: e.target.value })} />
                    </div>
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
