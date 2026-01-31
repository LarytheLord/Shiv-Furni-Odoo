import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Package,
  Tag,
  X,
  Loader2,
  IndianRupee,
} from 'lucide-react';

const initialFormData = {
  name: '',
  categoryId: '',
  categoryName: '',
  salePrice: '',
  costPrice: '',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories');
      setCategories(data.categories || []);
    } catch (err) {
      // Categories endpoint might not exist yet
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId || undefined,
        categoryName:
          !formData.categoryId && formData.categoryName
            ? formData.categoryName
            : undefined,
        salePrice: parseFloat(formData.salePrice) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
      };
      await api.post('/products', payload);
      setShowModal(false);
      setFormData(initialFormData);
      fetchProducts();
      fetchCategories();
    } catch (err) {
      alert('Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const selectCategory = (cat) => {
    setFormData({ ...formData, categoryId: cat.id, categoryName: cat.name });
    setShowCategoryDropdown(false);
  };

  const createNewCategory = () => {
    if (newCategoryInput.trim()) {
      setFormData({
        ...formData,
        categoryId: '',
        categoryName: newCategoryInput.trim(),
      });
      setNewCategoryInput('');
      setShowCategoryDropdown(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      (showArchived ? !p.isActive : p.isActive !== false) &&
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatCurrency = (a) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(a);

  return (
    <div className='page-container'>
      <div className='page-header'>
        <div className='header-content'>
          <h1>Product Master</h1>
          <p>Manage your product catalog and pricing</p>
        </div>
        <div className='header-actions'>
          <button
            className={`btn-secondary ${showArchived ? 'active' : ''}`}
            onClick={() => setShowArchived(!showArchived)}
          >
            <span>{showArchived ? 'Show Active' : 'Archived'}</span>
          </button>
          <button className='btn-primary' onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className='filters-bar'>
        <div className='search-box'>
          <Search size={18} />
          <input
            type='text'
            placeholder='Search products...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className='btn-secondary'>
          <Filter size={16} />
          <span>Filters</span>
        </button>
      </div>

      <div className='card'>
        {loading ? (
          <div className='loading-skeleton'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='skeleton-row'>
                <div className='skeleton skeleton-circle' />
                <div
                  className='skeleton skeleton-line'
                  style={{ width: '30%' }}
                />
                <div
                  className='skeleton skeleton-line'
                  style={{ width: '15%' }}
                />
                <div
                  className='skeleton skeleton-line'
                  style={{ width: '15%' }}
                />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>
              <Package size={32} />
            </div>
            <h3>No products found</h3>
            <p>Get started by adding your first product</p>
            <button className='btn-primary' onClick={() => setShowModal(true)}>
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </div>
        ) : (
          <table className='table'>
            <thead>
              <tr>
                <th className='th-checkbox'>
                  <input
                    type='checkbox'
                    checked={
                      selectedIds.length === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                    onChange={toggleSelectAll}
                    className='row-checkbox'
                  />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Sales Price</th>
                <th>Purchase Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className={selectedIds.includes(p.id) ? 'selected' : ''}
                >
                  <td className='td-checkbox'>
                    <input
                      type='checkbox'
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className='row-checkbox'
                    />
                  </td>
                  <td>
                    <div className='cell-with-avatar'>
                      <div className='avatar purple'>
                        <Package size={18} />
                      </div>
                      <span className='primary-text'>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className='badge category'>
                      {p.category?.name || '—'}
                    </span>
                  </td>
                  <td>
                    <span className='price sale'>
                      {formatCurrency(p.salePrice)}
                    </span>
                  </td>
                  <td>
                    <span className='price cost'>
                      {formatCurrency(p.costPrice)}
                    </span>
                  </td>
                  <td>
                    <button className='icon-btn'>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Add New Product</h2>
              <button className='close-btn' onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                <div className='form-group'>
                  <label>Product Name</label>
                  <div className='input-wrapper'>
                    <Package size={18} className='input-icon' />
                    <input
                      type='text'
                      required
                      placeholder='Enter product name'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <label>Category</label>
                  <div className='category-select-wrapper'>
                    <div
                      className='category-select-trigger'
                      onClick={() =>
                        setShowCategoryDropdown(!showCategoryDropdown)
                      }
                    >
                      <Tag size={18} className='input-icon-static' />
                      <span
                        className={
                          formData.categoryName
                            ? 'selected-value'
                            : 'placeholder'
                        }
                      >
                        {formData.categoryName || 'Select category'}
                      </span>
                    </div>
                    {showCategoryDropdown && (
                      <div className='category-dropdown'>
                        <div className='category-list'>
                          {categories.map((cat) => (
                            <div
                              key={cat.id}
                              className='category-option'
                              onClick={() => selectCategory(cat)}
                            >
                              {cat.name}
                            </div>
                          ))}
                        </div>
                        <div className='category-create'>
                          <input
                            type='text'
                            placeholder='Create new category...'
                            value={newCategoryInput}
                            onChange={(e) =>
                              setNewCategoryInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                createNewCategory();
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button type='button' onClick={createNewCategory}>
                            <Plus size={16} />
                          </button>
                        </div>
                        <p className='category-hint'>
                          *Category can be created and saved on the fly (Many 2
                          One field)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className='form-row'>
                  <div className='form-group'>
                    <label>Sales Price</label>
                    <div className='input-wrapper price-input'>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        placeholder='0.00'
                        value={formData.salePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salePrice: e.target.value,
                          })
                        }
                      />
                      <span className='price-suffix'>Rs</span>
                    </div>
                  </div>
                  <div className='form-group'>
                    <label>Purchase Price</label>
                    <div className='input-wrapper price-input'>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        placeholder='0.00'
                        value={formData.costPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            costPrice: e.target.value,
                          })
                        }
                      />
                      <span className='price-suffix'>Rs</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn-secondary'
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='btn-primary'
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className='spin' />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Add Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-container { max-width: 1400px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; letter-spacing: -0.025em; }
        .page-header p { font-size: 0.9375rem; color: #64748b; margin: 0; }
        
        .header-actions { display: flex; align-items: center; gap: 0.75rem; }
        
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 600; color: white; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        
        .btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; font-size: 0.875rem; font-weight: 500; color: #475569; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
        .btn-secondary.active { background: rgba(249, 115, 22, 0.1); border-color: #f97316; color: #f97316; }
        
        .filters-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
        .search-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; flex: 1; max-width: 400px; transition: all 0.2s; }
        .search-box:focus-within { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
        .search-box svg { color: #94a3b8; flex-shrink: 0; }
        .search-box input { border: none; outline: none; background: none; font-size: 0.875rem; color: #0f172a; width: 100%; }
        .search-box input::placeholder { color: #94a3b8; }
        
        .card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04); overflow: hidden; }
        
        .table { width: 100%; border-collapse: collapse; }
        .table th { padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .table td { padding: 1rem 1.5rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .table tbody tr { transition: background 0.15s; }
        .table tbody tr:hover { background: #fafafa; }
        .table tbody tr.selected { background: rgba(249, 115, 22, 0.06); }
        .table tbody tr:last-child td { border-bottom: none; }
        
        .th-checkbox, .td-checkbox { width: 50px; padding-left: 1.5rem !important; padding-right: 0.5rem !important; }
        .row-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #f97316; }
        
        .cell-with-avatar { display: flex; align-items: center; gap: 0.75rem; }
        .avatar { width: 38px; height: 38px; background: linear-gradient(135deg, #0f172a 0%, #334155 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.875rem; }
        .avatar.purple { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
        .primary-text { font-weight: 500; color: #0f172a; }
        
        .badge { display: inline-flex; padding: 0.3rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 6px; }
        .badge.category { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
        
        .price { font-family: 'SF Mono', Monaco, monospace; font-weight: 600; }
        .price.cost { color: #64748b; }
        .price.sale { color: #059669; }
        
        .icon-btn { background: none; border: none; padding: 0.375rem; color: #94a3b8; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
        .icon-btn:hover { background: #f1f5f9; color: #475569; }
        
        .loading-skeleton { padding: 1rem; }
        .skeleton-row { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        .skeleton-circle { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; }
        .skeleton-line { height: 14px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        
        .empty-state { display: flex; flex-direction: column; align-items: center; padding: 4rem 2rem; text-align: center; }
        .empty-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 1.25rem; }
        .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0 0 0.5rem; }
        .empty-state p { font-size: 0.875rem; color: #64748b; margin: 0 0 1.5rem; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
        .modal { background: white; border-radius: 20px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); overflow: visible; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }
        .close-btn { background: none; border: none; padding: 0.5rem; color: #94a3b8; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .close-btn:hover { background: #f1f5f9; color: #475569; }
        
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 500; color: #334155; }
        
        .input-wrapper { position: relative; }
        .input-wrapper .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        .input-wrapper input { width: 100%; padding: 0.875rem 1rem 0.875rem 2.875rem; font-size: 0.9375rem; color: #0f172a; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; transition: all 0.2s; }
        .input-wrapper input::placeholder { color: #94a3b8; }
        .input-wrapper input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
        
        .price-input input { padding-left: 1rem; padding-right: 3rem; }
        .price-suffix { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); font-size: 0.875rem; font-weight: 500; color: #64748b; }
        
        .category-select-wrapper { position: relative; }
        .category-select-trigger { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .category-select-trigger:hover { border-color: #cbd5e1; }
        .input-icon-static { color: #94a3b8; flex-shrink: 0; }
        .category-select-trigger .placeholder { color: #94a3b8; }
        .category-select-trigger .selected-value { color: #0f172a; font-weight: 500; }
        
        .category-dropdown { position: absolute; top: 100%; left: 0; right: 0; margin-top: 0.5rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 50; overflow: hidden; }
        .category-list { max-height: 150px; overflow-y: auto; }
        .category-option { padding: 0.75rem 1rem; cursor: pointer; transition: background 0.15s; font-size: 0.875rem; }
        .category-option:hover { background: #f8fafc; }
        
        .category-create { display: flex; gap: 0.5rem; padding: 0.75rem; border-top: 1px solid #f1f5f9; }
        .category-create input { flex: 1; padding: 0.5rem 0.75rem; font-size: 0.8rem; border: 1.5px solid #e2e8f0; border-radius: 6px; outline: none; }
        .category-create input:focus { border-color: #f97316; }
        .category-create button { padding: 0.5rem; background: #f97316; border: none; border-radius: 6px; color: white; cursor: pointer; }
        .category-create button:hover { background: #ea580c; }
        
        .category-hint { font-size: 0.7rem; color: #f97316; margin: 0; padding: 0.5rem 0.75rem; font-style: italic; background: #fffbeb; }
        
        .modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 768px) { 
          .page-header { flex-direction: column; gap: 1rem; } 
          .header-actions { width: 100%; justify-content: flex-end; }
          .filters-bar { flex-direction: column; align-items: stretch; } 
          .search-box { max-width: none; } 
          .form-row { grid-template-columns: 1fr; } 
          .table th:nth-child(4), .table td:nth-child(4) { display: none; } 
        }
      `}</style>
    </div>
  );
}
