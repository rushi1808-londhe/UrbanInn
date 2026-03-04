import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BedDouble } from 'lucide-react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { getRoomStatusBadge } from '../../utils/helpers';

const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'TWIN',
                    'SUITE', 'DELUXE', 'FAMILY'];
const STATUSES = ['AVAILABLE', 'OCCUPIED',
                  'CLEANING', 'MAINTENANCE', 'RESERVED'];

const emptyForm = {
  roomNumber: '', roomType: 'SINGLE',
  floor: '', pricePerNight: ''
};

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const res = await axiosInstance.get('/admin/rooms');
      setRooms(res.data.data || []);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditRoom(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      floor: room.floor,
      pricePerNight: room.pricePerNight
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.roomNumber) errs.roomNumber = 'Required';
    if (!form.floor) errs.floor = 'Required';
    if (!form.pricePerNight) errs.pricePerNight = 'Required';
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
      floor: parseInt(form.floor),
      pricePerNight: parseFloat(form.pricePerNight)
    };
    try {
      if (editRoom) {
        await axiosInstance.put(
          `/admin/rooms/${editRoom.id}`, payload);
        toast.success('Room updated!');
      } else {
        await axiosInstance.post('/admin/rooms', payload);
        toast.success('Room created!');
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (room, status) => {
    try {
      await axiosInstance.patch(
        `/admin/rooms/${room.id}/status?status=${status}`);
      toast.success('Status updated!');
      fetchRooms();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete room ${room.roomNumber}?`)) return;
    try {
      await axiosInstance.delete(`/admin/rooms/${room.id}`);
      toast.success('Room deleted');
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = rooms.filter(r => {
    const matchStatus = statusFilter === 'ALL' ||
      r.status === statusFilter;
    const matchSearch = r.roomNumber.toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <StaffLayout>
      {/* Header */}
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Rooms</h4>
          <p className="text-muted mb-0"
            style={{ fontSize: '14px' }}>
            {rooms.length} rooms total
          </p>
        </div>
        <button onClick={openCreate}
          className="btn fw-semibold"
          style={{ background: '#f0a500', color: '#000',
                   border: 'none', borderRadius: '10px',
                   padding: '10px 20px' }}>
          <Plus size={16} className="me-1"/>
          Add Room
        </button>
      </div>

      {/* Status Cards */}
      <div className="row g-2 mb-3">
        {['ALL', ...STATUSES].map(s => (
          <div key={s} className="col-auto">
            <button
              onClick={() => setStatusFilter(s)}
              className="btn btn-sm"
              style={{
                borderRadius: '20px',
                border: statusFilter === s
                  ? '2px solid #f0a500' : '1px solid #dee2e6',
                background: statusFilter === s
                  ? '#fff8e7' : '#fff',
                color: statusFilter === s
                  ? '#f0a500' : '#6c757d',
                fontWeight: statusFilter === s ? 600 : 400,
                fontSize: '12px', padding: '5px 12px'
              }}>
              {s === 'ALL' ? 'All' : s}
              {s !== 'ALL' && (
                <span className="ms-1">
                  ({rooms.filter(r => r.status === s).length})
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search room number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '260px', borderRadius: '10px',
                   padding: '9px 14px' }}
        />
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <BedDouble size={48}
            style={{ opacity: 0.3,
                     display: 'block',
                     margin: '0 auto 12px' }}/>
          <p>No rooms found</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(room => (
            <div key={room.id}
              className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card h-100 border-0 shadow-sm"
                style={{ borderRadius: '14px',
                         overflow: 'hidden' }}>
                {/* Color bar */}
                <div style={{
                  height: '4px',
                  background: room.status === 'AVAILABLE'
                    ? '#198754'
                    : room.status === 'OCCUPIED'
                    ? '#dc3545'
                    : room.status === 'CLEANING'
                    ? '#f0a500'
                    : '#6c757d'
                }}/>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between
                    align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold mb-0">
                        Room {room.roomNumber}
                      </h5>
                      <small className="text-muted">
                        Floor {room.floor} • {room.roomType}
                      </small>
                    </div>
                    <span className={`badge ${getRoomStatusBadge(room.status)}`}
                      style={{ fontSize: '10px',
                               padding: '4px 8px',
                               borderRadius: '20px' }}>
                      {room.status}
                    </span>
                  </div>

                  <div className="fw-bold mt-2"
                    style={{ color: '#f0a500',
                             fontSize: '16px' }}>
                    ₹{room.pricePerNight}/night
                  </div>

                  {/* Guest info if occupied */}
                  {room.currentGuestName && (
                    <div className="mt-2 p-2 rounded"
                      style={{ background: '#fee2e2',
                               fontSize: '12px' }}>
                      👤 {room.currentGuestName}
                    </div>
                  )}

                  {/* Status Change */}
                  <select
                    className="form-select form-select-sm mt-3"
                    value={room.status}
                    onChange={e =>
                      handleStatusChange(room, e.target.value)}
                    style={{ borderRadius: '8px',
                             fontSize: '12px' }}>
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {/* Actions */}
                  <div className="d-flex gap-2 mt-2">
                    <button
                      onClick={() => openEdit(room)}
                      className="btn btn-sm flex-fill"
                      style={{ background: '#e8f0ff',
                               color: '#0d6efd',
                               border: 'none',
                               borderRadius: '8px',
                               fontSize: '12px' }}>
                      <Edit2 size={12} className="me-1"/>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room)}
                      className="btn btn-sm flex-fill"
                      style={{ background: '#fee2e2',
                               color: '#dc3545',
                               border: 'none',
                               borderRadius: '8px',
                               fontSize: '12px' }}>
                      <Trash2 size={12} className="me-1"/>
                      Delete
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content"
              style={{ borderRadius: '16px', border: 'none' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editRoom ? 'Edit Room' : 'Add New Room'}
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
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Room Number *
                      </label>
                      <input
                        className={`form-control
                          ${errors.roomNumber ? 'is-invalid' : ''}`}
                        value={form.roomNumber}
                        onChange={e => setForm({
                          ...form, roomNumber: e.target.value})}
                        placeholder="e.g. 101"
                        disabled={!!editRoom}
                      />
                      {errors.roomNumber && (
                        <div className="invalid-feedback">
                          {errors.roomNumber}
                        </div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Room Type *
                      </label>
                      <select
                        className="form-select"
                        value={form.roomType}
                        onChange={e => setForm({
                          ...form, roomType: e.target.value})}>
                        {ROOM_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Floor *
                      </label>
                      <input
                        type="number"
                        className={`form-control
                          ${errors.floor ? 'is-invalid' : ''}`}
                        value={form.floor}
                        onChange={e => setForm({
                          ...form, floor: e.target.value})}
                        placeholder="e.g. 1"
                      />
                      {errors.floor && (
                        <div className="invalid-feedback">
                          {errors.floor}
                        </div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold"
                        style={{ fontSize: '13px' }}>
                        Price/Night (₹) *
                      </label>
                      <input
                        type="number"
                        className={`form-control
                          ${errors.pricePerNight
                            ? 'is-invalid' : ''}`}
                        value={form.pricePerNight}
                        onChange={e => setForm({
                          ...form,
                          pricePerNight: e.target.value})}
                        placeholder="e.g. 2500"
                      />
                      {errors.pricePerNight && (
                        <div className="invalid-feedback">
                          {errors.pricePerNight}
                        </div>
                      )}
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
                      {saving && (
                        <span className="spinner-border
                          spinner-border-sm me-1"/>
                      )}
                      {editRoom ? 'Update' : 'Create Room'}
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

export default RoomsPage;