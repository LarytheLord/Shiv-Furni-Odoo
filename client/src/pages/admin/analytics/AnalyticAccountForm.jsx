import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormView from '../../../components/ui/FormView';

export default function AnalyticAccountForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        name: isNew ? '' : 'Deepawali',
        reference: isNew ? 'NEW' : 'ANA-001',
        customer: isNew ? '' : 'Azure Interior',
        plan: 'Default',
        status: 'Active'
    });

    return (
        <FormView
            title={formData.name || 'New Analytic Account'}
            status={formData.status}
            statusOptions={['Active', 'Archived']}
            breadcrumbs={['Analytics', 'Accounts']}
            onBack={() => navigate('/admin/analytics')}
            actions={<></>}
        >
            <div className="erp-form-grid">
                <div className="form-section">
                    <div className="form-group">
                        <label>Account Name</label>
                        <input type="text" className="erp-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Reference</label>
                        <input type="text" className="erp-input" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Customer</label>
                        <input type="text" className="erp-input" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Plan</label>
                        <select className="erp-input" value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}>
                            <option>Default</option>
                            <option>Project</option>
                        </select>
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
