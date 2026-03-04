import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2,
         ToggleLeft, ToggleRight, X } from 'lucide-react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', address: '', city: '',
  country: '', phone: '', email: ''
};

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editHotel, setEditHotel] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    try {
      const res = await axiosInstance.get('/superadmin/hotels');
      setHotels(res.data.data || []);
    } catch {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditHotel(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (hotel) => {
    setEditHotel(hotel);
    setForm({
      name: hotel.name, address: hotel.address,
      city: hotel.city, country: hotel.country,
      phone: hotel.phone || '', email: hotel.email || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Required';
    if (!form.address) errs.address = 'Required';
    if (!form.city) errs.city = 'Required';
    if (!form.country) errs.country = 'Required';
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      if (editHotel) {
        await axiosInstance.put(
          `/superadmin/hotels/${editHotel.id}`, form);
        toast.success('Hotel updated!');
      } else {
        await axiosInstance.post('/superadmin/hotels', form);
        toast.success('Hotel created!');
      }
      setShowModal(false);
      fetchHotels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (hotel) => {
    try {
      await axiosInstance.patch(
        `/superadmin/hotels/${hotel.id}/toggle-status`);
      toast.success(`Hotel ${hotel.active ? 'deactivated' : 'activated'}`);
      fetchHotels();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (hotel) => {
    if (!window.confirm(
      `Delete "${hotel.name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/superadmin/hotels/${hotel.id}`);
      toast.success('Hotel deleted');
      fetchHotels();
    } catch {
      toast.error('Failed to delete hotel');
    }
  };

  const filtered = hotels.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StaffLayout>
      {/* Header */}
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Hotels</h4>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            {hotels.length} hotels registered
          </p>
        </div>
        <button onClick={openCreate}
          className="btn fw-semibold"
          style={{ background: '#f0a500', color: '#000',
                   border: 'none', borderRadius: '10px',
                   padding: '10px 20px' }}>
          <Plus size={16} className="me-1"/>
          Add Hotel
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search hotels by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '360px', borderRadius: '10px',
                   padding: '10px 14px' }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Hotel Name</th>
                  <th className="hide-mobile">Location</th>
                  <th className="hide-mobile">Contact</th>
                  <th>Rooms</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}
                      className="text-center text-muted py-5">
                      <Building2 size={40}
                        style={{ opacity: 0.3,
                                 marginBottom: '8px',
                                 display: 'block',
                                 margin: '0 auto 8px' }}/>
                      No hotels found
                    </td>
                  </tr>
                ) : (
                  filtered.map((hotel, i) => (
                    <tr key={hotel.id}>
                      <td className="text-muted"
                        style={{ fontSize: '13px' }}>
                        {i + 1}
                      </td>
                      <td>
                        <div className="fw-semibold">
                          {hotel.name}
                        </div>
                        <div className="text-muted"
                          style={{ fontSize: '12px' }}>
                          ID: {hotel.id}
                        </div>
                      </td>
                      <td className="hide-mobile">
                        {hotel.city}, {hotel.country}
                      </td>
                      <td className="hide-mobile">
                        <div style={{ fontSize: '13px' }}>
                          {hotel.email}
                        </div>
                        <div className="text-muted"
                          style={{ fontSize: '12px' }}>
                          {hotel.phone}
                        </div>
                      </td>
                      <td>{hotel.totalRooms}</td>
                      <td>{hotel.activeGuests}</td>
                      <td>
                        <span className={`badge rounded-pill
                          ${hotel.active
                            ? 'badge-available'
                            : 'badge-cancelled'}`}
                          style={{ padding: '5px 10px',
                                   fontSize: '11px' }}>
                          {hotel.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            onClick={() => openEdit(hotel)}
                            className="btn btn-sm"
                            style={{ background: '#e8f0ff',
                                     color: '#0d6efd',
                                     border: 'none',
                                     borderRadius: '8px' }}
                            title="Edit">
                            <Edit2 size={14}/>
                          </button>
                          <button
                            onClick={() => handleToggle(hotel)}
                            className="btn btn-sm"
                            style={{
                              background: hotel.active
                                ? '#fff8e7' : '#e8f5ee',
                              color: hotel.active
                                ? '#f0a500' : '#198754',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                            title="Toggle Status">
                            {hotel.active
                              ? <ToggleRight size={14}/>
                              : <ToggleLeft size={14}/>}
                          </button>
                          <button
                            onClick={() => handleDelete(hotel)}
                            className="btn btn-sm"
                            style={{ background: '#fee2e2',
                                     color: '#dc3545',
                                     border: 'none',
                                     borderRadius: '8px' }}
                            title="Delete">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                  {editHotel ? 'Edit Hotel' : 'Add New Hotel'}
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
                    <div className="col-12">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Hotel Name *
                      </label>
                      <input
                        className={`form-control
                          ${errors.name ? 'is-invalid' : ''}`}
                        value={form.name}
                        onChange={e => setForm({
                          ...form, name: e.target.value})}
                        placeholder="e.g. UrbanInn Mumbai"
                      />
                      {errors.name && (
                        <div className="invalid-feedback">
                          {errors.name}
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Address *
                      </label>
                      <input
                        className={`form-control
                          ${errors.address ? 'is-invalid' : ''}`}
                        value={form.address}
                        onChange={e => setForm({
                          ...form, address: e.target.value})}
                        placeholder="Street address"
                      />
                      {errors.address && (
                        <div className="invalid-feedback">
                          {errors.address}
                        </div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        City *
                      </label>
                      <input
                        className={`form-control
                          ${errors.city ? 'is-invalid' : ''}`}
                        value={form.city}
                        onChange={e => setForm({
                          ...form, city: e.target.value})}
                        placeholder="City"
                      />
                      {errors.city && (
                        <div className="invalid-feedback">
                          {errors.city}
                        </div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Country *
                      </label>
                      <input
                        className={`form-control
                          ${errors.country ? 'is-invalid' : ''}`}
                        value={form.country}
                        onChange={e => setForm({
                          ...form, country: e.target.value})}
                        placeholder="Country"
                      />
                      {errors.country && (
                        <div className="invalid-feedback">
                          {errors.country}
                        </div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Phone
                      </label>
                      <input
                        className="form-control"
                        value={form.phone}
                        onChange={e => setForm({
                          ...form, phone: e.target.value})}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={e => setForm({
                          ...form, email: e.target.value})}
                        placeholder="hotel@email.com"
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn btn-outline-secondary flex-fill"
                      style={{ borderRadius: '10px' }}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn flex-fill fw-semibold"
                      style={{ background: '#f0a500',
                               color: '#000', border: 'none',
                               borderRadius: '10px' }}>
                      {saving ? (
                        <span className="spinner-border
                          spinner-border-sm me-1"/>
                      ) : null}
                      {editHotel ? 'Update Hotel' : 'Create Hotel'}
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

export default HotelsPage;