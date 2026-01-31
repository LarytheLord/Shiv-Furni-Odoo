import React from 'react';
import { ArrowLeft, Save, X, MoreHorizontal } from 'lucide-react';

/**
 * Enterprise Form Layout Component
 * 
 * @param {string} title - Page title
 * @param {string} status - Current status (draft, sent, paid, etc.)
 * @param {string[]} statusOptions - All possible status steps
 * @param {Function} onBack - Back button handler
 * @param {Function} onSave - Save button handler
 * @param {Function} onCancel - Cancel button handler
 * @param {ReactNode} actions - Additional custom actions
 * @param {ReactNode} children - Form content
 */
export default function FormView({
    title,
    status,
    statusOptions = [],
    onBack,
    onSave,
    onCancel,
    actions,
    children,
    breadcrumbs = []
}) {
    return (
        <div className="form-view-container">
            {/* 1. Top Control Bar */}
            <div className="form-control-bar">
                <div className="control-left">
                    {onBack && (
                        <button onClick={onBack} className="back-btn" title="Go Back">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div className="form-breadcrumbs">
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="crumb-item">{crumb} / </span>
                        ))}
                        <span className="crumb-current">{title}</span>
                    </div>
                </div>

                <div className="control-right">
                    {/* Status Pipeline Ribbon */}
                    {statusOptions.length > 0 && (
                        <div className="status-ribbon-container">
                            {statusOptions.map((step) => {
                                const isActive = step.toLowerCase() === status?.toLowerCase();
                                // Simple logic: if status is "Paid", then "Draft" and "Sent" are also "past" or "completed"
                                // For now, we just mark the EXACT match as active.
                                return (
                                    <div
                                        key={step}
                                        className={`ribbon-step ${isActive ? 'active' : ''}`}
                                    >
                                        {step}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Action Bar (Sticky) */}
            <div className="form-action-bar">
                <div className="action-group">
                    <button onClick={onSave} className="btn-erp btn-erp-primary">
                        <Save size={16} /> Save
                    </button>
                    <button onClick={onCancel} className="btn-erp btn-erp-secondary">
                        <X size={16} /> Discard
                    </button>
                    {actions}
                </div>
                <div className="action-group">
                    <button className="btn-icon-only">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* 3. Main Sheet (Paper) */}
            <div className="form-sheet-wrapper">
                <div className="form-sheet">
                    <div className="sheet-content">
                        {children}
                    </div>
                </div>
            </div>

            <style>{`
        .form-view-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }

        /* Control Bar */
        .form-control-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
        }

        .control-left { display: flex; align-items: center; gap: 1rem; }
        
        .back-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--slate-500);
          padding: 4px;
          border-radius: 4px;
        }
        .back-btn:hover { background: #e2e8f0; color: var(--slate-900); }

        .form-breadcrumbs {
          font-size: 0.9rem;
          color: var(--slate-500);
        }
        .crumb-current { color: var(--slate-800); font-weight: 600; }

        /* Status Ribbon */
        .status-ribbon-container {
          display: flex;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .ribbon-step {
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--slate-500);
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          position: relative;
          cursor: default;
        }

        .ribbon-step:last-child { border-right: none; }

        .ribbon-step.active {
          background: var(--accent-600);
          color: white;
        }

        /* Action Bar */
        .form-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .action-group { display: flex; align-items: center; gap: 0.5rem; }

        .btn-icon-only {
           background: transparent;
           border: none;
           padding: 6px;
           color: var(--slate-500);
           cursor: pointer;
           border-radius: 4px;
        }
        .btn-icon-only:hover { background: #f1f5f9; color: var(--slate-900); }

        /* Sheet Wrapper */
        .form-sheet-wrapper {
          flex: 1;
          overflow-y: auto;
          display: flex;
          justify-content: center;
          padding-bottom: 2rem;
        }

        .form-sheet {
          background: white;
          width: 100%;
          max-width: 960px;
          min-height: 500px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e2e8f0;
          border-radius: 2px;
        }

        .sheet-content { padding: 2.5rem; }
        
        @media (max-width: 768px) {
           .sheet-content { padding: 1.5rem; }
           .form-control-bar { flex-direction: column; align-items: flex-start; gap: 1rem; }
           .control-right { width: 100%; overflow-x: auto; }
        }
      `}</style>
        </div>
    );
}
