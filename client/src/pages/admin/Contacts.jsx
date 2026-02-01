import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';
import ListView from '../../components/ui/ListView';
import { X, Plus, Upload, Loader2, User, Truck } from 'lucide-react';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  image: '',
  tags: [],
  type: 'CUSTOMER',
};

const defaultTags = ['B2B', 'MSME', 'Retailer', 'Local'];
const PAGE_LIMIT = 10;

export default function Contacts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [createPortalUser, setCreatePortalUser] = useState(false); // New state
  const [availableTags, setAvailableTags] = useState(defaultTags);
  const [newTagInput, setNewTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: PAGE_LIMIT,
        ...(searchQuery && { search: searchQuery }),
      };
      const { data: response } = await api.get('/contacts');

      // Contacts are in response.data.contacts, pagination at response.pagination
      const contacts = response.data?.contacts || response.contacts || [];
      const mappedData = contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        email: contact.email || '-',
        phone: contact.phone || '-',
        city: contact.city || '-',
        country: contact.country || '-',
        street: contact.street,
        state: contact.state,
        pincode: contact.pincode,
        image: contact.image,
        tags: contact.tags,
        isActive: contact.isActive,
      }));

      setData(mappedData);
      setTotalRecords(
        response.pagination?.total ||
          response.data?.pagination?.total ||
          mappedData.length,
      );
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get('/contacts/tags');
      if (data.tags && data.tags.length > 0) {
        setAvailableTags([
          ...new Set([...defaultTags, ...data.tags.map((t) => t.name)]),
        ]);
      }
    } catch (err) {
      // Tags endpoint might not exist yet, use defaults
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCreate = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setCreatePortalUser(false); // Reset checkbox
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate that email is present if creating a user
    if (createPortalUser && !formData.email) {
      alert('Email is required when creating a portal user.');
      setSubmitting(false);
      return;
    }

    try {
      // 1. Create Contact
      const { data: contactResponse } = await api.post('/contacts', formData);
      const newContact = contactResponse.contact;

      // 2. If checked, Create User (Invite)
      if (createPortalUser) {
        try {
          await api.post('/users', {
            email: newContact.email,
            name: newContact.name,
            role: 'PORTAL_USER',
            contactId: newContact.id,
            loginId: newContact.email, // Use email as loginId by default
          });
          alert('Contact created and Portal User invitation sent!');
        } catch (userErr) {
          console.error('Failed to invite user:', userErr);
          alert(
            `Contact created, but failed to invite user: ${userErr.response?.data?.message || userErr.message}`,
          );
        }
      } else {
        // alert('Contact created successfully');
      }

      setShowModal(false);
      setFormData(initialFormData);
      setImagePreview(null);
      setCreatePortalUser(false);
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert(
        'Failed to create contact: ' +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tag)) {
      setFormData({ ...formData, tags: currentTags.filter((t) => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
  };

  const addNewTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !availableTags.includes(trimmedTag)) {
      setAvailableTags([...availableTags, trimmedTag]);
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), trimmedTag],
      });
      setNewTagInput('');
    } else if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), trimmedTag],
      });
      setNewTagInput('');
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <span className='font-medium text-slate-800'>{row.name}</span>
      ),
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'City', accessor: 'city' },
    { header: 'Country', accessor: 'country' },
  ];

  const pagination = {
    page: currentPage,
    limit: PAGE_LIMIT,
    total: totalRecords,
  };

  return (
    <>
      <ListView
        title='Contacts'
        columns={columns}
        data={data}
        pagination={pagination}
        onCreate={handleCreate}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
      />

      {/* Create Contact Modal */}
      {showModal && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div
            className='modal modal-large modal-enter'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h2>Contact Master</h2>
              <button className='close-btn' onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                <div className='form-layout'>
                  {/* Left Column - Basic Info & Address */}
                  <div className='form-column'>
                    <div className='form-group'>
                      <label>Contact Name</label>
                      <input
                        type='text'
                        required
                        placeholder='Enter contact name'
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className='form-group'>
                      <label>Email</label>
                      <input
                        type='email'
                        placeholder='unique email'
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className='form-group'>
                      <label>Phone</label>
                      <input
                        type='text'
                        placeholder='Phone number'
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className='form-group'>
                      <label>Address</label>
                      <div className='address-fields'>
                        <input
                          type='text'
                          placeholder='Street'
                          value={formData.street}
                          onChange={(e) =>
                            setFormData({ ...formData, street: e.target.value })
                          }
                        />
                        <input
                          type='text'
                          placeholder='City'
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                        <input
                          type='text'
                          placeholder='State'
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                        />
                        <input
                          type='text'
                          placeholder='Country'
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                        />
                        <input
                          type='text'
                          placeholder='Pincode'
                          value={formData.pincode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pincode: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div
                      className='form-group checkbox-group'
                      style={{ marginTop: '1rem' }}
                    >
                      <label
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type='checkbox'
                          checked={createPortalUser}
                          onChange={(e) =>
                            setCreatePortalUser(e.target.checked)
                          }
                          style={{ width: 'auto' }}
                        />
                        <span
                          style={{
                            fontWeight: '600',
                            color: 'var(--accent-600)',
                          }}
                        >
                          Create Portal User & Send Invite
                        </span>
                      </label>
                      {createPortalUser && (
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            marginLeft: '1.5rem',
                            marginTop: '0.25rem',
                          }}
                        >
                          An invitation will be sent to the email address.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Image & Tags */}
                  <div className='form-column'>
                    <div className='form-group'>
                      <label>Upload Image</label>
                      <div
                        className='image-upload-box'
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt='Preview'
                            className='image-preview'
                          />
                        ) : (
                          <div className='upload-placeholder'>
                            <Upload size={32} />
                            <span>Upload image</span>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type='file'
                          accept='image/*'
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <div className='form-group'>
                      <label>Tags</label>
                      <div className='tags-container'>
                        <div className='tags-list'>
                          {availableTags.map((tag) => (
                            <button
                              key={tag}
                              type='button'
                              className={`tag-btn ${formData.tags?.includes(tag) ? 'selected' : ''}`}
                              onClick={() => toggleTag(tag)}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <div className='add-tag-row'>
                          <input
                            type='text'
                            placeholder='Add new tag...'
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addNewTag();
                              }
                            }}
                          />
                          <button
                            type='button'
                            className='btn-add-tag'
                            onClick={addNewTag}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <p className='tags-hint'>
                          *Tags can be created and saved on the fly
                        </p>
                      </div>
                    </div>

                    <div className='form-group'>
                      <label>Type</label>
                      <div className='type-toggle'>
                        <button
                          type='button'
                          className={`type-option ${(formData.type || 'CUSTOMER') === 'CUSTOMER' ? 'active' : ''}`}
                          onClick={() =>
                            setFormData({ ...formData, type: 'CUSTOMER' })
                          }
                        >
                          <User size={16} />
                          <span>Customer</span>
                        </button>
                        <button
                          type='button'
                          className={`type-option ${formData.type === 'VENDOR' ? 'active' : ''}`}
                          onClick={() =>
                            setFormData({ ...formData, type: 'VENDOR' })
                          }
                        >
                          <Truck size={16} />
                          <span>Vendor</span>
                        </button>
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
                      <span>Create Contact</span>
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
        .modal { background: white; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); overflow: hidden; }
        .modal-large { max-width: 700px; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 600; color: #0f172a; margin: 0; }
        .close-btn { background: none; border: none; padding: 0.5rem; color: #64748b; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
        .close-btn:hover { background: #e2e8f0; color: #0f172a; }
        .modal-body { padding: 1.5rem; }
        .form-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-column { display: flex; flex-direction: column; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 500; color: #374151; }
        .form-group input, .form-group select { padding: 0.625rem 0.875rem; font-size: 0.875rem; border: 1px solid #d1d5db; border-radius: 6px; outline: none; transition: all 0.2s; }
        .form-group input:focus, .form-group select:focus { border-color: var(--accent-500); box-shadow: 0 0 0 3px rgba(0, 135, 139, 0.1); }
        .form-group input::placeholder { color: #9ca3af; }
        .address-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .address-fields input:first-child { grid-column: 1 / -1; }
        .image-upload-box { width: 100%; height: 150px; border: 2px dashed #d1d5db; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; overflow: hidden; }
        .image-upload-box:hover { border-color: var(--accent-500); background: rgba(0, 135, 139, 0.05); }
        .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #9ca3af; }
        .upload-placeholder span { font-size: 0.875rem; }
        .image-preview { width: 100%; height: 100%; object-fit: cover; }
        .tags-container { display: flex; flex-direction: column; gap: 0.75rem; }
        .tags-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag-btn { padding: 0.375rem 0.75rem; font-size: 0.8rem; font-weight: 500; color: #64748b; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .tag-btn:hover { border-color: var(--accent-500); color: var(--accent-600); }
        .tag-btn.selected { background: rgba(0, 135, 139, 0.15); border-color: var(--accent-500); color: var(--accent-600); }
        .add-tag-row { display: flex; gap: 0.5rem; }
        .add-tag-row input { flex: 1; padding: 0.5rem 0.75rem; font-size: 0.8rem; border: 1px solid #d1d5db; border-radius: 6px; outline: none; }
        .add-tag-row input:focus { border-color: var(--accent-500); }
        .btn-add-tag { padding: 0.5rem; background: var(--accent-600); border: none; border-radius: 6px; color: white; cursor: pointer; }
        .btn-add-tag:hover { background: var(--accent-700); }
        .tags-hint { font-size: 0.75rem; color: var(--accent-600); margin: 0; font-style: italic; }
        .type-toggle { display: flex; gap: 0.5rem; }
        .type-option { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem 1rem; font-size: 0.875rem; font-weight: 500; color: #64748b; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .type-option:hover { border-color: var(--accent-400); color: var(--accent-600); background: rgba(0, 135, 139, 0.06); }
        .type-option.active { background: rgba(0, 135, 139, 0.12); border-color: var(--accent-500); color: var(--accent-700); }
        .modal-enter { animation: modalSlideIn 0.2s ease-out; }
        @keyframes modalSlideIn { from { opacity: 0; transform: scale(0.98) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background: var(--accent-600); border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: var(--accent-700); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background: white; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: #f9fafb; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) { .form-layout { grid-template-columns: 1fr; } .modal-large { max-width: 95%; } .address-fields { grid-template-columns: 1fr; } .address-fields input:first-child { grid-column: 1; } }
      `}</style>
    </>
  );
}
