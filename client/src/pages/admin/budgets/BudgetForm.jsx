import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormView from '../../../components/ui/FormView';

export default function BudgetForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        name: isNew ? '' : 'January 2026',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        status: isNew ? 'Draft' : 'Confirm',
        lines: [
            { id: 1, analytic: 'Deepawali', type: 'Income', budgeted: 400000, achieved: 21600 },
            { id: 2, analytic: 'Marriage Session 2026', type: 'Income', budgeted: 0, achieved: 0, isMonetary: true },
            { id: 3, analytic: 'Deepawali', type: 'Expense', budgeted: 280000, achieved: 16350 },
        ]
    });

    const statusOptions = ['Draft', 'Confirm', 'Revised', 'Cancelled'];

    const handleRevise = () => {
        // Logic to handle revision
        const newName = `${formData.name} (Rev ${new Date().toLocaleDateString()})`;
        setFormData({ ...formData, name: newName, status: 'Revised' });
        // In real app, this would create a new record
    };

    return (
        <FormView
            title={isNew ? 'New Budget' : formData.name}
            status={formData.status}
            statusOptions={statusOptions}
            breadcrumbs={['Budgets']}
            onBack={() => navigate('/admin/budgets')}
            onSave={() => console.log('Save', formData)}
            actions={
                formData.status === 'Confirm' && (
                    <button onClick={handleRevise} className="btn-erp btn-erp-secondary">
                        Revise
                    </button>
                )
            }
        >
            <div className="erp-form-grid">
                {/* Header Fields */}
                <div className="form-section">
                    <div className="form-group">
                        <label>Budget Name</label>
                        <input
                            type="text"
                            className="erp-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Budget Period</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                className="erp-input"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <span className="self-center">To</span>
                            <input
                                type="date"
                                className="erp-input"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Lines Table */}
                <div className="mt-8">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-500">
                                <th className="py-2 font-medium">Analytic Name</th>
                                <th className="py-2 font-medium">Type</th>
                                <th className="py-2 font-medium text-right">Budgeted Amount</th>
                                <th className="py-2 font-medium text-right">Achieved Amount</th>
                                <th className="py-2 font-medium text-right">Achieved %</th>
                                <th className="py-2 font-medium text-right">Amount to Achieve</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.lines.map((line) => {
                                const achievedPct = line.budgeted > 0 ? (line.achieved / line.budgeted) * 100 : 0;
                                const toAchieve = line.budgeted - line.achieved;

                                return (
                                    <tr key={line.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-2">{line.analytic}</td>
                                        <td className="py-2">{line.type}</td>
                                        <td className="py-2 text-right">
                                            {line.isMonetary ? 'Monetary' : line.budgeted.toLocaleString()}
                                        </td>
                                        <td className="py-2 text-right">
                                            {line.isMonetary ? 'Compute' : (
                                                <div className="flex items-center justify-end gap-2">
                                                    {line.achieved.toLocaleString()}
                                                    <button className="text-blue-600 text-xs hover:underline">View</button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 text-right">
                                            {line.isMonetary ? '-' : `${achievedPct.toFixed(2)}%`}
                                        </td>
                                        <td className="py-2 text-right">
                                            {line.isMonetary ? '-' : toAchieve.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* Add Line Row (Placeholder) */}
                            <tr>
                                <td colSpan="6" className="py-2 text-blue-600 cursor-pointer hover:underline">
                                    Add a line
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
        .erp-form-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--slate-700);
        }
        .erp-input {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 0.4rem 0.6rem;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .erp-input:focus {
           border-color: var(--accent-500);
           box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
        }
      `}</style>
        </FormView>
    );
}
