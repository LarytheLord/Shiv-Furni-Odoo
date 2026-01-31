import React from 'react';
import { ArrowLeft, Printer, Download } from 'lucide-react';

/**
 * Portal Read-Only Form Layout
 * 
 * @param {string} title - Page title
 * @param {string} subtitle - Secondary text (e.g. date)
 * @param {string} status - Badge text
 * @param {string} statusColor - Badge color (success, warning, etc.)
 * @param {Function} onBack - Back button handler
 * @param {ReactNode} actions - Extra actions (Print, etc.)
 * @param {ReactNode} children - Main content
 */
export default function PortalFormView({
    title,
    subtitle,
    status,
    statusColor = 'neutral', // success, warning, danger, neutral
    onBack,
    actions,
    children
}) {
    const getStatusStyle = (color) => {
        switch (color) {
            case 'success': return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
            case 'warning': return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
            case 'danger': return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
        }
    };

    const statusStyle = getStatusStyle(statusColor);

    return (
        <div className="portal-form-container">
            {/* Header / Control Bar */}
            <div className="form-header">
                <div className="header-left">
                    {onBack && (
                        <button onClick={onBack} className="back-btn">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="title-group">
                        <div className="title-row">
                            <h1>{title}</h1>
                            {status && (
                                <span
                                    className="status-badge"
                                    style={{
                                        backgroundColor: statusStyle.bg,
                                        color: statusStyle.color,
                                        borderColor: statusStyle.border
                                    }}
                                >
                                    {status}
                                </span>
                            )}
                        </div>
                        {subtitle && <p className="subtitle">{subtitle}</p>}
                    </div>
                </div>

                <div className="header-actions">
                    <button className="action-btn" onClick={() => window.print()}>
                        <Printer size={18} />
                        <span>Print</span>
                    </button>
                    {actions}
                </div>
            </div>

            {/* Main Content Card */}
            <div className="form-content">
                {children}
            </div>

            <style>{`
                .portal-form-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .header-left {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }

                .back-btn {
                    background: white;
                    border: 1px solid #e2e8f0;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                    transition: all 0.2s;
                    margin-top: 4px; /* Align with title */
                }

                .back-btn:hover {
                    background: #f8fafc;
                    color: #0f172a;
                    border-color: #cbd5e1;
                }

                .title-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .title-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .title-group h1 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.025em;
                }

                .status-badge {
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.25rem 0.625rem;
                    border-radius: 20px;
                    text-transform: uppercase;
                    border: 1px solid transparent;
                }

                .subtitle {
                    font-size: 0.9375rem;
                    color: #64748b;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 0.75rem;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .action-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }

                .form-content {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    padding: 2.5rem;
                    min-height: 400px;
                }

                @media (max-width: 768px) {
                    .form-header {
                        flex-direction: column;
                    }
                    .header-actions {
                        width: 100%;
                    }
                    .action-btn {
                        flex: 1;
                        justify-content: center;
                    }
                    .form-content {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
