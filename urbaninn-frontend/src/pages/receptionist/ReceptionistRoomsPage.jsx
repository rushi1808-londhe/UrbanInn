import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { BedDouble } from 'lucide-react';

const STATUS_COLORS = {
  AVAILABLE:   { bg: '#e8f5ee', color: '#198754',
                 bar: '#198754' },
  OCCUPIED:    { bg: '#fee2e2', color: '#dc3545',
                 bar: '#dc3545' },
  CLEANING:    { bg: '#fff8e7', color: '#f0a500',
                 bar: '#f0a500' },
  MAINTENANCE: { bg: '#f0ebff', color: '#6f42c1',
                 bar: '#6f42c1' },
  RESERVED:    { bg: '#e8f0ff', color: '#0d6efd',
                 bar: '#0d6efd' },
};

const ALL_STATUSES = ['AVAILABLE', 'OCCUPIED',
  'CLEANING', 'MAINTENANCE', 'RESERVED'];

const ReceptionistRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const res = await axiosInstance.get(
        '/receptionist/rooms');
      setRooms(res.data.data || []);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (roomId, status) => {
    // prevent changing occupied room manually
    const room = rooms.find(r => r.id === roomId);
    if (room?.status === 'OCCUPIED') {
      toast.error(
        'Cannot change occupied room. Use checkout.');
      return;
    }
    setUpdating(roomId);
    try {
      await axiosInstance.patch(
        `/receptionist/rooms/${roomId}/status?status=${status}`);
      toast.success(`Room status → ${status}`);
      fetchRooms();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = statusFilter === 'ALL'
    ? rooms
    : rooms.filter(r => r.status === statusFilter);

  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = rooms.filter(r => r.status === s).length;
    return acc;
  }, {});

  return (
    <StaffLayout>
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Room Overview</h4>
        <p className="text-muted mb-0"
          style={{ fontSize: '14px' }}>
          {rooms.length} total rooms
        </p>
      </div>

      {/* Summary Cards */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <div
          onClick={() => setStatusFilter('ALL')}
          className="p-3 rounded text-center"
          style={{
            background: statusFilter === 'ALL'
              ? '#1a1a2e' : '#f8f9fa',
            cursor: 'pointer',
            minWidth: '80px',
            border: statusFilter === 'ALL'
              ? '2px solid #f0a500'
              : '2px solid transparent',
            borderRadius: '12px'
          }}>
          <div style={{
            fontSize: '22px', fontWeight: 700,
            color: statusFilter === 'ALL'
              ? '#f0a500' : '#1a1a2e'
          }}>
            {rooms.length}
          </div>
          <div style={{
            fontSize: '11px', fontWeight: 600,
            color: statusFilter === 'ALL'
              ? 'rgba(255,255,255,0.7)' : '#6c757d'
          }}>
            ALL
          </div>
        </div>

        {ALL_STATUSES.map(status => (
          <div
            key={status}
            onClick={() => setStatusFilter(
              statusFilter === status ? 'ALL' : status)}
            className="p-3 rounded text-center"
            style={{
              background: STATUS_COLORS[status].bg,
              cursor: 'pointer',
              minWidth: '90px',
              border: statusFilter === status
                ? `2px solid ${STATUS_COLORS[status].color}`
                : '2px solid transparent',
              borderRadius: '12px',
              transition: 'all 0.2s'
            }}>
            <div style={{
              fontSize: '22px', fontWeight: 700,
              color: STATUS_COLORS[status].color
            }}>
              {statusCounts[status] || 0}
            </div>
            <div style={{
              fontSize: '10px', fontWeight: 600,
              color: STATUS_COLORS[status].color
            }}>
              {status}
            </div>
          </div>
        ))}
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
            style={{ opacity: 0.2,
                     display: 'block',
                     margin: '0 auto 12px' }}/>
          <p>No rooms found</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(room => {
            const sc = STATUS_COLORS[room.status] ||
              STATUS_COLORS.AVAILABLE;
            const isUpdating = updating === room.id;

            return (
              <div key={room.id}
                className="col-6 col-md-4 col-lg-3">
                <div className="card border-0 shadow-sm"
                  style={{ borderRadius: '14px',
                           overflow: 'hidden' }}>

                  {/* Color bar */}
                  <div style={{ height: '4px',
                                background: sc.bar }}/>

                  <div className="card-body p-3">
                    {/* Room Number + Type */}
                    <div className="d-flex
                      justify-content-between
                      align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-0">
                          Room {room.roomNumber}
                        </h6>
                        <small className="text-muted">
                          {room.roomType} •
                          Floor {room.floor}
                        </small>
                      </div>
                      <BedDouble size={18}
                        color="#6c757d"/>
                    </div>

                    {/* Status Badge */}
                    <span className="badge mb-2"
                      style={{
                        background: sc.bg,
                        color: sc.color,
                        fontSize: '10px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: 600
                      }}>
                      {room.status}
                    </span>

                    {/* Current Guest */}
                    {room.currentGuestName && (
                      <div className="mb-2"
                        style={{ fontSize: '12px',
                                 color: '#6c757d' }}>
                        👤 {room.currentGuestName}
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-3"
                      style={{ fontSize: '12px',
                               color: '#f0a500',
                               fontWeight: 600 }}>
                      ₹{room.pricePerNight}/night
                    </div>

                    {/* Status Change Dropdown */}
                    {room.status !== 'OCCUPIED' && (
                      <div>
                        <label style={{
                          fontSize: '11px',
                          color: '#6c757d',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          Change Status
                        </label>
                        <select
                          className="form-select
                            form-select-sm"
                          value={room.status}
                          disabled={isUpdating}
                          onChange={e =>
                            handleStatusChange(
                              room.id, e.target.value)}
                          style={{
                            borderRadius: '8px',
                            fontSize: '12px',
                            border: '1px solid #dee2e6',
                            cursor: 'pointer'
                          }}>
                          {ALL_STATUSES
                            .filter(s => s !== 'OCCUPIED')
                            .map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <div className="text-center mt-1">
                            <span className="spinner-border
                              spinner-border-sm"
                              style={{
                                color: '#f0a500',
                                width: '14px',
                                height: '14px'
                              }}/>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Occupied — show checkout info */}
                    {room.status === 'OCCUPIED' && (
                      <div className="p-2 rounded"
                        style={{
                          background: '#fee2e2',
                          fontSize: '11px',
                          color: '#dc3545',
                          textAlign: 'center'
                        }}>
                        🔒 Use checkout to change status
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StaffLayout>
  );
};

export default ReceptionistRoomsPage;