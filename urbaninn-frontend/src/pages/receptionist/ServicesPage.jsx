import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const STATUSES = ['PENDING', 'IN_PROGRESS',
                  'COMPLETED', 'CANCELLED'];

const statusColor = {
  PENDING:     { bg: '#fff8e7', color: '#f0a500' },
  IN_PROGRESS: { bg: '#e8f0ff', color: '#0d6efd' },
  COMPLETED:   { bg: '#e8f5ee', color: '#198754' },
  CANCELLED:   { bg: '#fee2e2', color: '#dc3545' },
};

const ServicesPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { fetchRequests(); }, [showAll]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = showAll
        ? '/receptionist/service-requests/all'
        : '/receptionist/service-requests';
      const res = await axiosInstance.get(url);
      setRequests(res.data.data || []);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axiosInstance.patch(
        `/receptionist/service-requests/${id}/status?status=${status}`);
      toast.success('Status updated!');
      fetchRequests();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <StaffLayout>
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Service Requests</h4>
          <p className="text-muted mb-0"
            style={{ fontSize: '14px' }}>
            {requests.length} {showAll ? 'total' : 'pending'}
          </p>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="btn btn-outline-secondary btn-sm"
          style={{ borderRadius: '10px' }}>
          {showAll ? 'Pending Only' : 'Show All'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <Bell size={48}
            style={{ opacity: 0.3,
                     display: 'block',
                     margin: '0 auto 12px' }}/>
          <p>No service requests</p>
        </div>
      ) : (
        <div className="row g-3">
          {requests.map(req => (
            <div key={req.id} className="col-12 col-md-6">
              <div className="card border-0 shadow-sm"
                style={{ borderRadius: '14px' }}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between
                    align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{
                        width: '40px', height: '40px',
                        borderRadius: '10px',
                        background: statusColor[req.status]?.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Bell size={18}
                          color={statusColor[req.status]?.color}/>
                      </div>
                      <div>
                        <div className="fw-bold"
                          style={{ fontSize: '14px' }}>
                          {req.serviceType?.replace(/_/g, ' ')}
                        </div>
                        <div className="text-muted"
                          style={{ fontSize: '12px' }}>
                          Room {req.roomNumber} • {req.guestName}
                        </div>
                      </div>
                    </div>
                    <span className="badge"
                      style={{
                        background: statusColor[req.status]?.bg,
                        color: statusColor[req.status]?.color,
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '11px'
                      }}>
                      {req.status}
                    </span>
                  </div>

                  {req.notes && (
                    <p className="text-muted mb-2"
                      style={{ fontSize: '12px' }}>
                      📝 {req.notes}
                    </p>
                  )}

                  <div className="text-muted mb-3"
                    style={{ fontSize: '11px' }}>
                    {formatDateTime(req.requestedAt)}
                  </div>

                  {/* Status buttons */}
                  <div className="d-flex gap-2 flex-wrap">
                    {STATUSES.filter(s => s !== req.status)
                      .map(s => (
                      <button
                        key={s}
                        onClick={() =>
                          handleStatusUpdate(req.id, s)}
                        className="btn btn-sm"
                        style={{
                          background: statusColor[s]?.bg,
                          color: statusColor[s]?.color,
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '11px',
                          padding: '4px 10px'
                        }}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
};

export default ServicesPage;
