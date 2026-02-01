import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  X,
  Archive,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import FormView from '../../../components/ui/FormView';
import api from '../../../api/axios';

export default function AnalyticAccountForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (!isNew) {
      fetchAccount();
    }
  }, [id]);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytical-accounts/${id}`);
      const account = res.data.account;
      setFormData({
        name: account.name,
        code: account.code,
        description: account.description || '',
        isActive: account.isActive,
      });
    } catch (err) {
      console.error('Failed to fetch account', err);
      navigate('/admin/analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      alert('Name and Code are required');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        isActive: formData.isActive,
      };

      if (isNew) {
        const res = await api.post('/analytical-accounts', payload);
        navigate(`/admin/analytics/${res.data.account.id}`);
      } else {
        await api.patch(`/analytical-accounts/${id}`, payload);
        fetchAccount(); // Refresh
        alert('Saved successfully');
      }
    } catch (err) {
      console.error('Save failed', err);
      alert(err.response?.data?.message || 'Failed to save account');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/analytical-accounts/${id}`);
      navigate('/admin/analytics');
    } catch (err) {
      console.error('Delete failed', err);
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <FormView
      title={isNew ? 'New Cost Center' : formData.name}
      status={formData.isActive ? 'Active' : 'Archived'}
      statusOptions={['Active', 'Archived']}
      breadcrumbs={['Analytics', 'Cost Centers']}
      onBack={() => navigate('/admin/analytics')}
      onSave={handleSave}
      onCancel={() => navigate('/admin/analytics')}
      actions={
        !isNew && (
          <button
            onClick={handleDelete}
            className='btn-erp btn-erp-danger flex items-center gap-2 text-red-600 hover:bg-red-50 border-red-200'
          >
            <Trash2 size={16} /> Delete
          </button>
        )
      }
    >
      <div className='erp-form-grid'>
        <div className='form-section'>
          <div className='form-group'>
            <label className='required'>Account Name</label>
            <input
              type='text'
              className='erp-input font-medium'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder='e.g. Research & Development'
              required
            />
          </div>
          <div className='form-group'>
            <label className='required'>Reference Code</label>
            <input
              type='text'
              className='erp-input font-mono text-slate-600'
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder='e.g. RD-001'
              required
            />
          </div>
          <div className='form-group col-span-2'>
            <label>Description</label>
            <textarea
              className='erp-input'
              rows='3'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='Optional description of this cost center...'
            />
          </div>

          <div className='form-group mt-4'>
            <label className='checkbox-label flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
              />
              <span className='text-sm font-medium text-slate-700'>Active</span>
            </label>
            <p className='text-xs text-slate-500 mt-1 pl-6'>
              Inactive accounts cannot be selected in new budgets/lines.
            </p>
          </div>
        </div>
      </div>
      <style>{`
                .erp-form-grid { display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px; }
                .form-section { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
                .form-group.col-span-2 { grid-column: span 2; }
                .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
                .form-group label.required::after { content: " *"; color: #ef4444; }
                .erp-input { 
                    border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; 
                    font-size: 0.9rem; outline: none; transition: all 0.2s;
                    background-color: #fff;
                }
                .erp-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            `}</style>
    </FormView>
  );
}
