import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft,
         ToggleRight, X, Users } from 'lucide-react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';

const ROLES = [
  'HOTEL_ADMIN', 'RECEPTIONIST', 'KITCHEN_STAFF', 'SUPER_ADMIN'
];

const emptyForm = {
  name: '', email: '', password: '',
  role: 'RECEPTIONIST', hotelId: ''
};

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [staffRes, hotelsRes] = await Promise.all([
        axiosInstance.get('/superadmin/staff'),
        axiosInstance.get('/superadmin/hotels'),
      ]);
      setStaff(staffRes.data.data || []);
      setHotels(hotelsRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditStaff(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditStaff(s);
    setForm({
      name: s.name, email: s.email,
      password: '', role: s.role,
      hotelId: s.hotelId || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Required';
    if (!form.email) errs.email = 'Required';
    if (!editStaff && !form.password)
      errs.password = 'Required';
    if (form.role !== 'SUPER_ADMIN' && !form.hotelId)
      errs.hotelId = 'Required for this role';
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
    const payload = {
      ...form,
      hotelId: form.hotelId ? parseInt(form.hotelId) : null
    };
    try {
      if (editStaff) {
        await axiosInstance.put(
          `/superadmin/staff/${editStaff.id}`, payload);
        toast.success('Staff updated!');
      } else {
        await axiosInstance.post('/superadmin/staff', payload);
        toast.success('Staff created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (s) => {
    try {
      await axiosInstance.patch(
        `/superadmin/staff/${s.id}/toggle-status`);
      toast.success(`Staff ${s.active ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    try {
      await axiosInstance.delete(`/superadmin/staff/${s.id}`);
      toast.success('Staff deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = staff.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === 'ALL' || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColor = {
    SUPER_ADMIN:   { bg: '#fee2e2', color: '#dc3545' },
    HOTEL_ADMIN:   { bg: '#e8f0ff', color: '#0d6efd' },
    RECEPTIONIST:  { bg: '#e8f5ee', color: '#198754' },
    KITCHEN_STAFF: { bg: '#fff8e7', color: '#f0a500' },
  };

  return (
    <StaffLayout>
      {/* Header */}
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Staff Management</h4>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            {staff.length} staff members
          </p>
        </div>
        <button onClick={openCreate}
          className="btn fw-semibold"
          style={{ background: '#f0a500', color: '#000',
                   border: 'none', borderRadius: '10px',
                   padding: '10px 20px' }}>
          <Plus size={16} className="me-1"/>
          Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input
          type="text"
          className="form-control"
          placeholder="Search staff..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '260px', borderRadius: '10px',
                   padding: '9px 14px' }}
        />
        <select
          className="form-select"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ maxWidth: '180px', borderRadius: '10px' }}>
          <option value="ALL">All Roles</option>
          {ROLES.map(r => (
            <option key={r} value={r}>
              {r.replace('_', ' ')}
            </option>
          ))}
        </select>
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
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th className="hide-mobile">Hotel</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}
                      className="text-center text-muted py-5">
                      <Users size={40}
                        style={{ opacity: 0.3,
                                 display: 'block',
                                 margin: '0 auto 8px' }}/>
                      No staff found
                    </td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="d-flex
                          align-items-center gap-2">
                          <div style={{
                            width: '36px', height: '36px',
                            borderRadius: '50%',
                            background: '#1a1a2e',
                            color: '#f0a500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px', fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold"
                              style={{ fontSize: '14px' }}>
                              {s.name}
                            </div>
                            <div className="text-muted"
                              style={{ fontSize: '12px' }}>
                              {s.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge"
                          style={{
                            background: roleColor[s.role]?.bg,
                            color: roleColor[s.role]?.color,
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '11px', fontWeight: 600
                          }}>
                          {s.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="hide-mobile"
                        style={{ fontSize: '13px' }}>
                        {s.hotelName || '—'}
                      </td>
                      <td>
                        <span className={`badge rounded-pill
                          ${s.active
                            ? 'badge-available'
                            : 'badge-cancelled'}`}
                          style={{ padding: '5px 10px',
                                   fontSize: '11px' }}>
                          {s.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="btn btn-sm"
                            style={{ background: '#e8f0ff',
                                     color: '#0d6efd',
                                     border: 'none',
                                     borderRadius: '8px' }}>
                            <Edit2 size={14}/>
                          </button>
                          <button
                            onClick={() => handleToggle(s)}
                            className="btn btn-sm"
                            style={{
                              background: s.active
                                ? '#fff8e7' : '#e8f5ee',
                              color: s.active
                                ? '#f0a500' : '#198754',
                              border: 'none',
                              borderRadius: '8px'
                            }}>
                            {s.active
                              ? <ToggleRight size={14}/>
                              : <ToggleLeft size={14}/>}
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="btn btn-sm"
                            style={{ background: '#fee2e2',
                                     color: '#dc3545',
                                     border: 'none',
                                     borderRadius: '8px' }}>
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
                  {editStaff ? 'Edit Staff' : 'Add Staff Member'}
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
                        Full Name *
                      </label>
                      <input
                        className={`form-control
                          ${errors.name ? 'is-invalid' : ''}`}
                        value={form.name}
                        onChange={e => setForm({
                          ...form, name: e.target.value})}
                        placeholder="Full name"
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
                        Email *
                      </label>
                      <input
                        type="email"
                        className={`form-control
                          ${errors.email ? 'is-invalid' : ''}`}
                        value={form.email}
                        onChange={e => setForm({
                          ...form, email: e.target.value})}
                        placeholder="staff@urbaninn.com"
                        disabled={!!editStaff}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email}
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        {editStaff
                          ? 'New Password (leave blank to keep)'
                          : 'Password *'}
                      </label>
                      <input
                        type="password"
                        className={`form-control
                          ${errors.password ? 'is-invalid' : ''}`}
                        value={form.password}
                        onChange={e => setForm({
                          ...form, password: e.target.value})}
                        placeholder="Password"
                      />
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Role *
                      </label>
                      <select
                        className="form-select"
                        value={form.role}
                        onChange={e => setForm({
                          ...form, role: e.target.value,
                          hotelId: ''
                        })}>
                        {ROLES.map(r => (
                          <option key={r} value={r}>
                            {r.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    {form.role !== 'SUPER_ADMIN' && (
                      <div className="col-6">
                        <label className="form-label fw-semibold"
                          style={{ fontSize: '13px' }}>
                          Hotel *
                        </label>
                        <select
                          className={`form-select
                            ${errors.hotelId ? 'is-invalid' : ''}`}
                          value={form.hotelId}
                          onChange={e => setForm({
                            ...form, hotelId: e.target.value})}>
                          <option value="">Select hotel</option>
                          {hotels.map(h => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        </select>
                        {errors.hotelId && (
                          <div className="invalid-feedback">
                            {errors.hotelId}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                      disabled={saving}
                      className="btn flex-fill fw-semibold"
                      style={{ background: '#f0a500',
                               color: '#000', border: 'none',
                               borderRadius: '10px' }}>
                      {saving && (
                        <span className="spinner-border
                          spinner-border-sm me-1"/>
                      )}
                      {editStaff ? 'Update' : 'Create Staff'}
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

export default StaffPage;