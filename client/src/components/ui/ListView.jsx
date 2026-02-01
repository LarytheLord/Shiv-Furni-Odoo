import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react';

/**
 * Enterprise List View Component (Table)
 *
 * @param {string} title - Page title
 * @param {Function} onCreate - Create button handler
 * @param {ReactNode} createButton - Optional custom create control (e.g. dropdown); when set, replaces default New button
 * @param {Function} onSearch - Search input handler
 * @param {Function} onPageChange - Pagination change handler
 * @param {Function} onEdit - Edit handler receiving (row)
 * @param {Function} onDelete - Delete handler receiving (row)
 * @param {Function} onRowClick - Row click handler receiving (row)
 * @param {Array} columns - Table columns definition { header, accessor, width, render }
 * @param {Array} data - Table data
 * @param {ReactNode} actions - Extra actions
 */
export default function ListView({
  title,
  onCreate,
  createButton,
  onSearch,
  onPageChange,
  onEdit,
  onDelete,
  onRowClick,
  columns = [],
  data = [],
  actions,
  pagination = { page: 1, limit: 10, total: 0 },
}) {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const menuRef = useRef(null);
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActionMenuOpen(null);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handlePrevPage = () => {
    if (pagination.page > 1 && onPageChange) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < totalPages && onPageChange) {
      onPageChange(pagination.page + 1);
    }
  };

  const hasRowActions = onEdit || onDelete;

  return (
    <div className='list-view-container'>
      {/* 1. List Header */}
      <div className='list-header'>
        <div className='header-title'>
          <h1>{title}</h1>
          <span className='item-count'>{pagination.total} records</span>
        </div>

        <div className='header-controls'>
          <div className='list-search'>
            <Search size={16} />
            <input
              type='text'
              placeholder='Search...'
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>

          <div className='control-group'>
            <button className='btn-erp btn-erp-secondary'>
              <Filter size={14} /> Filter
            </button>
            <button className='btn-erp btn-erp-secondary'>
              <Download size={14} /> Export
            </button>
            {(createButton != null ? createButton : onCreate) &&
              (createButton != null ? (
                createButton
              ) : (
                <button onClick={onCreate} className='btn-erp btn-erp-primary'>
                  <Plus size={16} /> New
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* 2. Table Area */}
      <div className='table-wrapper'>
        <table className='erp-table'>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type='checkbox' />
              </th>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type='checkbox' />
                  </td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessor] || '-'}
                    </td>
                  ))}
                  <td onClick={(e) => e.stopPropagation()}>
                    {hasRowActions ? (
                      <div
                        className='row-actions-wrapper'
                        ref={actionMenuOpen === row.id ? menuRef : null}
                      >
                        <button
                          type='button'
                          className='row-action-btn'
                          onClick={() =>
                            setActionMenuOpen(
                              actionMenuOpen === row.id ? null : row.id,
                            )
                          }
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {actionMenuOpen === row.id && (
                          <div className='row-action-dropdown'>
                            {onEdit && (
                              <button
                                type='button'
                                className='row-action-item'
                                onClick={() => {
                                  onEdit(row);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <Pencil size={14} /> Edit
                              </button>
                            )}
                            {onDelete && (
                              <button
                                type='button'
                                className='row-action-item row-action-item-danger'
                                onClick={() => {
                                  onDelete(row);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button type='button' className='row-action-btn' disabled>
                        <MoreHorizontal size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className='empty-state'>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Footer (Pagination) */}
      <div className='list-footer'>
        <span className='page-info'>
          {pagination.total > 0 ? (
            <>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} entries
            </>
          ) : (
            <>No entries</>
          )}
        </span>

        <div className='pagination-controls'>
          <button
            disabled={pagination.page <= 1}
            className='page-btn'
            onClick={handlePrevPage}
          >
            <ChevronLeft size={16} />
          </button>
          <span className='current-page'>
            {pagination.page} / {totalPages || 1}
          </span>
          <button
            disabled={pagination.page >= totalPages}
            className='page-btn'
            onClick={handleNextPage}
          >
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

        .erp-table tbody tr.clickable-row { cursor: pointer; }
        .erp-table tbody tr.clickable-row:hover { background: #f8fafc; }

        .row-actions-wrapper { position: relative; }
        .row-action-btn {
           background: transparent;
           border: none;
           padding: 4px;
           cursor: pointer;
           color: #94a3b8;
           border-radius: 4px;
        }
        .row-action-btn:hover { background: #e2e8f0; color: #1e293b; }
        .row-action-btn:disabled { cursor: default; opacity: 0.5; }

        .row-action-dropdown {
           position: absolute;
           right: 0;
           top: 100%;
           margin-top: 4px;
           min-width: 120px;
           background: white;
           border: 1px solid #e2e8f0;
           border-radius: 8px;
           box-shadow: 0 4px 12px rgba(0,0,0,0.15);
           z-index: 100;
           overflow: hidden;
        }
        .row-action-item {
           display: flex;
           align-items: center;
           gap: 0.5rem;
           width: 100%;
           padding: 0.5rem 0.75rem;
           border: none;
           background: none;
           cursor: pointer;
           font-size: 0.875rem;
           color: #374151;
           text-align: left;
        }
        .row-action-item:hover { background: #f1f5f9; }
        .row-action-item-danger { color: #dc2626; }
        .row-action-item-danger:hover { background: #fef2f2; }

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
