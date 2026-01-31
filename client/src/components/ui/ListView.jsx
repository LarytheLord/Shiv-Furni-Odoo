import React from 'react';
import { Search, Filter, Plus, Download, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Enterprise List View Component (Table)
 * 
 * @param {string} title - Page title
 * @param {Function} onCreate - Create button handler
 * @param {Function} onSearch - Search input handler
 * @param {Array} columns - Table columns definition { header, accessor, width, render }
 * @param {Array} data - Table data
 * @param {ReactNode} actions - Extra actions
 */
export default function ListView({
    title,
    onCreate,
    onSearch,
    columns = [],
    data = [],
    actions,
    pagination = { page: 1, limit: 10, total: 0 }
}) {
    return (
        <div className="list-view-container">
            {/* 1. List Header */}
            <div className="list-header">
                <div className="header-title">
                    <h1>{title}</h1>
                    <span className="item-count">{pagination.total} records</span>
                </div>

                <div className="header-controls">
                    <div className="list-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                        />
                    </div>

                    <div className="control-group">
                        <button className="btn-erp btn-erp-secondary">
                            <Filter size={14} /> Filter
                        </button>
                        <button className="btn-erp btn-erp-secondary">
                            <Download size={14} /> Export
                        </button>
                        {onCreate && (
                            <button onClick={onCreate} className="btn-erp btn-erp-primary">
                                <Plus size={16} /> New
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Table Area */}
            <div className="table-wrapper">
                <table className="erp-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}><input type="checkbox" /></th>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{ width: col.width }}>{col.header}</th>
                            ))}
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr key={row.id || rowIndex}>
                                    <td><input type="checkbox" /></td>
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex}>
                                            {col.render ? col.render(row) : (row[col.accessor] || '-')}
                                        </td>
                                    ))}
                                    <td>
                                        <button className="row-action-btn">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 2} className="empty-state">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 3. Footer (Pagination) */}
            <div className="list-footer">
                <span className="page-info">
                    Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </span>

                <div className="pagination-controls">
                    <button disabled={pagination.page <= 1} className="page-btn">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="current-page">{pagination.page}</span>
                    <button disabled={pagination.page * pagination.limit >= pagination.total} className="page-btn">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <style>{`
        .list-view-container {
           background: white;
           border: 1px solid #e2e8f0;
           border-radius: 4px;
           box-shadow: 0 1px 3px rgba(0,0,0,0.05);
           height: 100%;
           display: flex;
           flex-direction: column;
           overflow: hidden;
        }

        /* Header */
        .list-header {
           padding: 1rem 1.5rem;
           border-bottom: 1px solid #e2e8f0;
           display: flex;
           justify-content: space-between;
           align-items: center;
           background: #f8fafc;
        }

        .header-title { display: flex; align-items: baseline; gap: 0.75rem; }
        .header-title h1 { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--slate-800); }
        .item-count { color: var(--slate-500); font-size: 0.85rem; }

        .header-controls { display: flex; gap: 1rem; align-items: center; }

        .list-search {
           display: flex;
           align-items: center;
           gap: 0.5rem;
           background: white;
           border: 1px solid #cbd5e1;
           padding: 0.4rem 0.75rem;
           border-radius: 4px;
           color: #64748b;
        }

        .list-search input { border: none; outline: none; font-size: 0.9rem; width: 200px; }
        
        .control-group { display: flex; gap: 0.5rem; }

        /* Table */
        .table-wrapper {
           flex: 1;
           overflow: auto;
        }

        .erp-table { width: 100%; border-collapse: collapse; }
        .erp-table th { 
           position: sticky; 
           top: 0; 
           background: #f1f5f9; 
           z-index: 10; 
           text-transform: uppercase;
           font-size: 0.75rem;
           letter-spacing: 0.05em;
        }

        .empty-state { text-align: center; padding: 3rem; color: #94a3b8; }
        
        .row-action-btn { 
           background: transparent; 
           border: none; 
           padding: 4px; 
           cursor: pointer; 
           color: #94a3b8; 
           border-radius: 4px;
        }
        .row-action-btn:hover { background: #e2e8f0; color: #1e293b; }

        /* Footer */
        .list-footer {
           padding: 0.75rem 1.5rem;
           border-top: 1px solid #e2e8f0;
           display: flex;
           justify-content: space-between;
           align-items: center;
           background: #f8fafc;
           font-size: 0.85rem;
           color: var(--slate-600);
        }

        .pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
        
        .page-btn {
           background: white;
           border: 1px solid #cbd5e1;
           padding: 4px 8px;
           border-radius: 4px;
           cursor: pointer;
           color: #64748b;
        }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .page-btn:hover:not(:disabled) { border-color: var(--accent-500); color: var(--accent-600); }
        
        .current-page { font-weight: 600; padding: 0 0.5rem; }

        @media (max-width: 768px) {
           .list-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
           .header-controls { flex-wrap: wrap; width: 100%; }
           .list-search { flex: 1; }
        }
      `}</style>
        </div>
    );
}
