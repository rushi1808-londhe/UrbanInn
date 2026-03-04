import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X,
         UtensilsCrossed } from 'lucide-react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';

const CATEGORIES = ['BREAKFAST', 'LUNCH', 'DINNER',
                    'SNACKS', 'BEVERAGES', 'DESSERTS'];

const emptyForm = {
  name: '', description: '', category: 'BREAKFAST',
  price: '', available: true, vegetarian: false, imageUrl: ''
};

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const res = await axiosInstance.get('/admin/menu');
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      available: item.available,
      vegetarian: item.vegetarian,
      imageUrl: item.imageUrl || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
  const errs = {};
  if (!form.name || form.name.trim() === '') 
    errs.name = 'Required';
  if (!form.price || form.price === '') 
    errs.price = 'Required';
  return errs;
};

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axiosInstance.post(
        '/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      setForm(prev => ({ ...prev, imageUrl: res.data.data }));
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message ||
        'Upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price)
    };
    try {
      if (editItem) {
        await axiosInstance.put(
          `/admin/menu/${editItem.id}`, payload);
        toast.success('Menu item updated!');
      } else {
        await axiosInstance.post('/admin/menu', payload);
        toast.success('Menu item added!');
      }
      setShowModal(false);
      fetchMenu();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await axiosInstance.patch(
        `/admin/menu/${item.id}/toggle-availability`);
      toast.success(item.available
        ? 'Item marked unavailable'
        : 'Item marked available');
      fetchMenu();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await axiosInstance.delete(`/admin/menu/${item.id}`);
      toast.success('Item deleted');
      fetchMenu();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = items.filter(item => {
    const matchCat = categoryFilter === 'ALL' ||
      item.category === categoryFilter;
    const matchSearch = item.name.toLowerCase()
      .includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <StaffLayout>
      {/* Header */}
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Menu Management</h4>
          <p className="text-muted mb-0"
            style={{ fontSize: '14px' }}>
            {items.length} items on menu
          </p>
        </div>
        <button onClick={openCreate}
          className="btn fw-semibold"
          style={{ background: '#f0a500', color: '#000',
                   border: 'none', borderRadius: '10px',
                   padding: '10px 20px' }}>
          <Plus size={16} className="me-1"/>
          Add Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {['ALL', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className="btn btn-sm"
            style={{
              borderRadius: '20px',
              border: categoryFilter === cat
                ? '2px solid #f0a500'
                : '1px solid #dee2e6',
              background: categoryFilter === cat
                ? '#fff8e7' : '#fff',
              color: categoryFilter === cat
                ? '#f0a500' : '#6c757d',
              fontWeight: categoryFilter === cat ? 600 : 400,
              fontSize: '12px', padding: '5px 12px'
            }}>
            {cat}
            {cat !== 'ALL' && (
              <span className="ms-1">
                ({items.filter(i =>
                  i.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search menu items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '260px', borderRadius: '10px',
                   padding: '9px 14px' }}
        />
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <UtensilsCrossed size={48}
            style={{ opacity: 0.3, display: 'block',
                     margin: '0 auto 12px' }}/>
          <p>No menu items found</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(item => (
            <div key={item.id}
              className="col-12 col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '14px',
                         overflow: 'hidden',
                         opacity: item.available ? 1 : 0.65 }}>

                {/* Image */}
                {item.imageUrl ? (
                  <img
                    src={`http://localhost:8080${item.imageUrl}`}
                    alt={item.name}
                    style={{ width: '100%', height: '160px',
                             objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100px',
                                background: '#f8f9fa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center' }}>
                    <UtensilsCrossed size={32}
                      style={{ opacity: 0.2 }}/>
                  </div>
                )}

                <div className="card-body p-3">
                  <div className="d-flex justify-content-between
                    align-items-start mb-2">
                    <div className="flex-fill">
                      <div className="d-flex align-items-center
                        gap-2">
                        <h6 className="fw-bold mb-0">
                          {item.name}
                        </h6>
                        {item.vegetarian && (
                          <span style={{
                            width: '16px', height: '16px',
                            borderRadius: '3px',
                            border: '2px solid #198754',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px',
                            color: '#198754',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>V</span>
                        )}
                      </div>
                      <small className="text-muted">
                        {item.category}
                      </small>
                    </div>
                    <span
                      className={`badge ${item.available
                        ? 'badge-available'
                        : 'badge-cancelled'}`}
                      style={{ fontSize: '10px',
                               padding: '4px 8px',
                               borderRadius: '20px',
                               flexShrink: 0 }}>
                      {item.available
                        ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-muted mb-2"
                      style={{ fontSize: '12px',
                               lineHeight: '1.4' }}>
                      {item.description}
                    </p>
                  )}

                  <div className="fw-bold mb-3"
                    style={{ color: '#f0a500',
                             fontSize: '18px' }}>
                    ₹{item.price}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleToggle(item)}
                      className="btn btn-sm flex-fill"
                      style={{
                        background: item.available
                          ? '#fee2e2' : '#e8f5ee',
                        color: item.available
                          ? '#dc3545' : '#198754',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}>
                      {item.available ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="btn btn-sm"
                      style={{ background: '#e8f0ff',
                               color: '#0d6efd',
                               border: 'none',
                               borderRadius: '8px' }}>
                      <Edit2 size={13}/>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="btn btn-sm"
                      style={{ background: '#fee2e2',
                               color: '#dc3545',
                               border: 'none',
                               borderRadius: '8px' }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered
            modal-dialog-scrollable">
            <div className="modal-content"
              style={{ borderRadius: '16px', border: 'none' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editItem ? 'Edit Item' : 'Add Menu Item'}
                </h5>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-sm"
                  style={{ background: '#f8f9fa',
                           border: 'none',
                           borderRadius: '8px' }}>
                  <X size={16}/>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSave}>
                  <div className="row g-3">

                    {/* Name */}
                    <div className="col-12">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Item Name *
                      </label>
                      <input
                        className={`form-control
                          ${errors.name ? 'is-invalid' : ''}`}
                        value={form.name}
                        onChange={e => setForm({
                          ...form, name: e.target.value})}
                        placeholder="e.g. Masala Dosa"
                      />
                      {errors.name && (
                        <div className="invalid-feedback">
                          {errors.name}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={form.description}
                        onChange={e => setForm({
                          ...form,
                          description: e.target.value})}
                        placeholder="Short description"
                        style={{ resize: 'none' }}
                      />
                    </div>

                    {/* Category + Price */}
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Category *
                      </label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={e => setForm({
                          ...form,
                          category: e.target.value})}>
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        className={`form-control
                          ${errors.price ? 'is-invalid' : ''}`}
                        value={form.price}
                        onChange={e => setForm({
                          ...form, price: e.target.value})}
                        placeholder="e.g. 150"
                      />
                      {errors.price && (
                        <div className="invalid-feedback">
                          {errors.price}
                        </div>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="col-12">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Item Image
                      </label>

                      {/* Preview */}
                      {form.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={`http://localhost:8080${form.imageUrl}`}
                            alt="preview"
                            style={{ width: '100%',
                                     height: '160px',
                                     objectFit: 'cover',
                                     borderRadius: '10px' }}
                          />
                        </div>
                      )}

                      {/* Upload Button */}
                      <div className="d-flex gap-2
                        align-items-center">
                        <label
                          htmlFor="imageUpload"
                          className="btn fw-semibold mb-0"
                          style={{ background: '#f0a500',
                                   color: '#000', border: 'none',
                                   borderRadius: '10px',
                                   cursor: 'pointer',
                                   fontSize: '13px',
                                   padding: '8px 16px' }}>
                          {uploadingImage ? (
                            <>
                              <span className="spinner-border
                                spinner-border-sm me-1"/>
                              Uploading...
                            </>
                          ) : '📷 Upload Image'}
                        </label>
                        <input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageUpload}
                        />
                        {form.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setForm({
                              ...form, imageUrl: ''})}
                            className="btn btn-sm"
                            style={{ background: '#fee2e2',
                                     color: '#dc3545',
                                     border: 'none',
                                     borderRadius: '8px' }}>
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="form-text"
                        style={{ fontSize: '11px' }}>
                        JPG, PNG, WEBP — max 5MB
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="col-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.available}
                          onChange={e => setForm({
                            ...form,
                            available: e.target.checked})}
                        />
                        <label className="form-check-label"
                          style={{ fontSize: '13px' }}>
                          Available
                        </label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.vegetarian}
                          onChange={e => setForm({
                            ...form,
                            vegetarian: e.target.checked})}
                        />
                        <label className="form-check-label"
                          style={{ fontSize: '13px' }}>
                          Vegetarian
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn btn-outline-secondary
                        flex-fill"
                      style={{ borderRadius: '10px' }}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || uploadingImage}
                      className="btn flex-fill fw-semibold"
                      style={{ background: '#f0a500',
                               color: '#000', border: 'none',
                               borderRadius: '10px' }}>
                      {saving && (
                        <span className="spinner-border
                          spinner-border-sm me-1"/>
                      )}
                      {editItem ? 'Update' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default MenuPage;