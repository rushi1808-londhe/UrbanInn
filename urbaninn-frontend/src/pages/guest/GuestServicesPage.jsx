import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import GuestLayout from '../../layouts/GuestLayout';
import toast from 'react-hot-toast';
import { Bell, Plus } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const SERVICE_TYPES = [
  { value: 'ROOM_CLEANING', label: '🧹 Room Cleaning',
    desc: 'Clean and tidy your room' },
  { value: 'LAUNDRY', label: '👕 Laundry',
    desc: 'Wash and fold your clothes' },
  { value: 'EXTRA_TOWELS', label: '🛁 Extra Towels',
    desc: 'Get additional towels' },
  { value: 'WAKE_UP_CALL', label: '⏰ Wake Up Call',
    desc: 'Schedule a morning wake up call' },
  { value: 'DO_NOT_DISTURB', label: '🚫 Do Not Disturb',
    desc: 'Set do not disturb status' },
  { value: 'MAINTENANCE', label: '🔧 Maintenance',
    desc: 'Report a maintenance issue' },
  { value: 'OTHER', label: '📋 Other',
    desc: 'Any other request' },
];

const statusColor = {
  PENDING:     { bg: '#fff8e7', color: '#f0a500' },
  IN_PROGRESS: { bg: '#e8f0ff', color: '#0d6efd' },
  COMPLETED:   { bg: '#e8f5ee', color: '#198754' },
  CANCELLED:   { bg: '#fee2e2', color: '#dc3545' },
};

const GuestServicesPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get('/guest/services');
      setRequests(res.data.data || []);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error('Please select a service type');
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post('/guest/services', {
        serviceType: selectedType,
        notes
      });
      toast.success('Service request submitted!');
      setShowForm(false);
      setSelectedType('');
      setNotes('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await axiosInstance.patch(
        `/guest/services/${id}/complete`);
      toast.success('Service marked as completed!');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <GuestLayout title="Room Services">

      {/* New Request Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="btn w-100 fw-bold mb-3"
        style={{ background: '#f0a500', color: '#000',
                 border: 'none', borderRadius: '12px',
                 padding: '14px', fontSize: '15px' }}>
        <Plus size={18} className="me-2"/>
        New Service Request
      </button>

      {/* Request Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4"
          style={{ borderRadius: '16px' }}>
          <div className="card-body p-3">
            <h6 className="fw-bold mb-3">
              What do you need?
            </h6>

            {/* Service Type Grid */}
            <div className="row g-2 mb-3">
              {SERVICE_TYPES.map(type => (
                <div key={type.value} className="col-6">
                  <div
                    onClick={() => setSelectedType(type.value)}
                    className="p-2 rounded text-center"
                    style={{
                      border: selectedType === type.value
                        ? '2px solid #f0a500'
                        : '1px solid #dee2e6',
                      background: selectedType === type.value
                        ? '#fff8e7' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                    <div style={{ fontSize: '22px' }}>
                      {type.label.split(' ')[0]}
                    </div>
                    <div style={{
                      fontSize: '12px', fontWeight: 600,
                      color: selectedType === type.value
                        ? '#f0a500' : '#333',
                      marginTop: '4px'
                    }}>
                      {type.label.split(' ').slice(1).join(' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="Additional notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ borderRadius: '10px',
                       fontSize: '13px', resize: 'none' }}
            />

            <div className="d-flex gap-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedType('');
                  setNotes('');
                }}
                className="btn btn-outline-secondary flex-fill"
                style={{ borderRadius: '10px' }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedType}
                className="btn flex-fill fw-semibold"
                style={{ background: '#f0a500', color: '#000',
                         border: 'none', borderRadius: '10px' }}>
                {submitting ? (
                  <span className="spinner-border
                    spinner-border-sm me-1"/>
                ) : null}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previous Requests */}
      <h6 className="fw-bold mb-3">My Requests</h6>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <Bell size={48}
            style={{ opacity: 0.2, display: 'block',
                     margin: '0 auto 12px' }}/>
          <p style={{ fontSize: '13px' }}>
            No service requests yet
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {requests.map(req => (
            <div key={req.id}
              className="card border-0 shadow-sm"
              style={{ borderRadius: '14px' }}>
              <div className="card-body p-3">

                {/* Header */}
                <div className="d-flex justify-content-between
                  align-items-start">
                  <div className="d-flex align-items-center
                    gap-2">
                    <div style={{
                      width: '40px', height: '40px',
                      borderRadius: '10px',
                      background: statusColor[req.status]?.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {SERVICE_TYPES.find(
                        t => t.value === req.serviceType
                      )?.label.split(' ')[0] || '📋'}
                    </div>
                    <div>
                      <div className="fw-bold"
                        style={{ fontSize: '14px' }}>
                        {req.serviceType?.replace(/_/g, ' ')}
                      </div>
                      <div className="text-muted"
                        style={{ fontSize: '11px' }}>
                        {formatDateTime(req.requestedAt)}
                      </div>
                    </div>
                  </div>
                  <span className="badge"
                    style={{
                      background: statusColor[req.status]?.bg,
                      color: statusColor[req.status]?.color,
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '11px', fontWeight: 600
                    }}>
                    {req.status}
                  </span>
                </div>

                {/* Notes */}
                {req.notes && (
                  <div className="mt-2 text-muted"
                    style={{ fontSize: '12px' }}>
                    📝 {req.notes}
                  </div>
                )}

                {/* Completed At */}
                {req.status === 'COMPLETED' &&
                  req.completedAt && (
                  <div className="mt-2"
                    style={{ fontSize: '12px',
                             color: '#198754' }}>
                    ✅ Completed at{' '}
                    {formatDateTime(req.completedAt)}
                  </div>
                )}

                {/* Mark Complete Button */}
                {req.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() =>
                      handleMarkComplete(req.id)}
                    className="btn btn-sm w-100 mt-3
                      fw-semibold"
                    style={{
                      background: '#e8f5ee',
                      color: '#198754',
                      border: '1px solid #198754',
                      borderRadius: '10px',
                      fontSize: '13px',
                      padding: '10px'
                    }}>
                    ✅ Mark as Completed
                  </button>
                )}

                {/* Cancelled info */}
                {req.status === 'CANCELLED' && (
                  <div className="mt-2"
                    style={{ fontSize: '12px',
                             color: '#dc3545' }}>
                    ❌ This request was cancelled
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </GuestLayout>
  );
};

export default GuestServicesPage;