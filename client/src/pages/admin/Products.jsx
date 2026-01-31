import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import ListView from '../../components/ui/ListView';
import { X, Plus, Loader2, ChevronDown } from 'lucide-react';

const initialFormData = {
  name: '',
  categoryId: '',
  categoryName: '',
  salePrice: '',
  costPrice: '',
};

const PAGE_LIMIT = 10;

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: PAGE_LIMIT,
        ...(searchQuery && { search: searchQuery }),
      };
      const { data: response } = await api.get('/products');
      console.log(response);

      const mappedData = (response.products || []).map((product) => ({
        id: product.id,
        name: product.name,
        ref: product.code || '-',
        category: product.category?.name || '-',
        price: Number(product.salePrice) || 0,
        costPrice: Number(product.costPrice) || 0,
      }));

      setData(mappedData);
      setTotalRecords(response.pagination?.total || mappedData.length);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/products/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCreate = () => {
    setFormData(initialFormData);
    setShowModal(true);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns = [
    { header: 'Internal Reference', accessor: 'ref', width: '150px' },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <span className='font-medium text-slate-800'>{row.name}</span>
      ),
    },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Sales Price',
      accessor: 'price',
      render: (row) => formatCurrency(row.price),
    },
    {
      header: 'Purchase Price',
      accessor: 'costPrice',
      render: (row) => formatCurrency(row.costPrice),
    },
  ];

  const pagination = {
    page: currentPage,
    limit: PAGE_LIMIT,
    total: totalRecords,
  };

  return (
    <>
      <ListView
        title='Products'
        columns={columns}
        data={data}
        pagination={pagination}
        onCreate={handleCreate}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
      />

      {/* Create Product Modal */}
      {showModal && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Product Master</h2>
              <button className='close-btn' onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                <div className='form-group'>
                  <label>Product Name</label>
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

                <div className='form-row'>
                  <div className='form-group' style={{ flex: 1 }}>
                    <label>Category</label>
                    <div className='category-select-wrapper'>
                      <div
                        className='category-select-trigger'
                        onClick={() =>
                          setShowCategoryDropdown(!showCategoryDropdown)
                        }
                      >
                        <span
                          className={
                            formData.categoryName
                              ? 'selected-value'
                              : 'placeholder'
                          }
                        >
                          {formData.categoryName || 'Select category'}
                        </span>
                        <ChevronDown size={16} />
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
                            {categories.length === 0 && (
                              <div className='category-empty'>
                                No categories yet
                              </div>
                            )}
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
                            *Category can be created and saved on the fly (Many
                            2 One field)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='price-fields'>
                    <div className='form-group'>
                      <label>Sales Price</label>
                      <div className='price-input'>
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
                      <div className='price-input'>
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
                      <span>Create Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal { background: white; border-radius: 16px; width: 100%; max-width: 550px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); overflow: visible; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 600; color: #0f172a; margin: 0; }
        .close-btn { background: none; border: none; padding: 0.5rem; color: #64748b; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
        .close-btn:hover { background: #e2e8f0; color: #0f172a; }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .form-row { display: flex; gap: 1.5rem; align-items: flex-start; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 500; color: #374151; }
        .form-group input { padding: 0.625rem 0.875rem; font-size: 0.875rem; border: 1px solid #d1d5db; border-radius: 6px; outline: none; transition: all 0.2s; }
        .form-group input:focus { border-color: var(--accent-500); box-shadow: 0 0 0 3px rgba(0, 135, 139, 0.1); }
        .form-group input::placeholder { color: #9ca3af; }
        .price-fields { display: flex; flex-direction: column; gap: 1rem; }
        .price-input { position: relative; display: flex; align-items: center; }
        .price-input input { width: 120px; padding-right: 2.5rem; }
        .price-suffix { position: absolute; right: 0.75rem; font-size: 0.875rem; font-weight: 500; color: #64748b; }
        .category-select-wrapper { position: relative; }
        .category-select-trigger { display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 0.875rem; background: white; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; transition: all 0.2s; min-width: 200px; }
        .category-select-trigger:hover { border-color: #9ca3af; }
        .category-select-trigger .placeholder { color: #9ca3af; }
        .category-select-trigger .selected-value { color: #0f172a; }
        .category-dropdown { position: absolute; top: 100%; left: 0; right: 0; margin-top: 0.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); z-index: 50; overflow: hidden; }
        .category-list { max-height: 150px; overflow-y: auto; }
        .category-option { padding: 0.625rem 0.875rem; cursor: pointer; transition: background 0.15s; font-size: 0.875rem; }
        .category-option:hover { background: #f8fafc; }
        .category-empty { padding: 0.625rem 0.875rem; color: #9ca3af; font-size: 0.875rem; }
        .category-create { display: flex; gap: 0.5rem; padding: 0.625rem; border-top: 1px solid #e2e8f0; }
        .category-create input { flex: 1; padding: 0.5rem 0.75rem; font-size: 0.8rem; border: 1px solid #d1d5db; border-radius: 6px; outline: none; }
        .category-create input:focus { border-color: var(--accent-500); }
        .category-create button { padding: 0.5rem; background: var(--accent-600); border: none; border-radius: 6px; color: white; cursor: pointer; }
        .category-create button:hover { background: var(--accent-700); }
        .category-hint { font-size: 0.7rem; color: var(--accent-600); margin: 0; padding: 0.5rem 0.625rem; font-style: italic; background: rgba(0, 135, 139, 0.05); }
        .modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background: var(--accent-600); border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: var(--accent-700); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background: white; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: #f9fafb; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) { .form-row { flex-direction: column; } .category-select-trigger { min-width: 100%; } .price-fields { width: 100%; } .price-input input { width: 100%; } }
      `}</style>
    </>
  );
}
