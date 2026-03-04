import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { Users } from 'lucide-react';

const GuestsPage = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchGuests(); }, [showAll]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const url = showAll
        ? '/receptionist/guests/all'
        : '/receptionist/guests';
      const res = await axiosInstance.get(url);
      setGuests(res.data.data || []);
    } catch {
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (sessionId, guestName) => {
    if (!window.confirm(`Check out ${guestName}?`)) return;
    try {
      await axiosInstance.patch(
        `/receptionist/checkout/${sessionId}`);
      toast.success('Guest checked out!');
      fetchGuests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = guests.filter(g =>
    g.guestName.toLowerCase().includes(search.toLowerCase()) ||
    g.phoneNumber.includes(search) ||
    g.roomNumber?.includes(search)
  );

  return (
    <StaffLayout>
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Guests</h4>
          <p className="text-muted mb-0"
            style={{ fontSize: '14px' }}>
            {guests.length} {showAll ? 'total' : 'active'} guests
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn btn-outline-secondary btn-sm"
            style={{ borderRadius: '10px' }}>
            {showAll ? 'Active Only' : 'Show All'}
          </button>
          <Link to="/receptionist/checkin"
            className="btn fw-semibold btn-sm"
            style={{ background: '#f0a500', color: '#000',
                     border: 'none', borderRadius: '10px',
                     padding: '8px 16px' }}>
            + Check In
          </Link>
        </div>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, phone or room..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px', borderRadius: '10px',
                   padding: '9px 14px' }}
        />
      </div>

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
                  <th>Guest</th>
                  <th>Room</th>
                  <th className="hide-mobile">Check-In</th>
                  <th className="hide-mobile">Check-Out</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}
                      className="text-center text-muted py-5">
                      <Users size={40}
                        style={{ opacity: 0.3,
                                 display: 'block',
                                 margin: '0 auto 8px' }}/>
                      No guests found
                    </td>
                  </tr>
                ) : filtered.map(g => (
                  <tr key={g.id}>
                    <td>
                      <div className="d-flex
                        align-items-center gap-2">
                        <div style={{
                          width: '34px', height: '34px',
                          borderRadius: '50%',
                          background: '#1a1a2e',
                          color: '#f0a500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          flexShrink: 0
                        }}>
                          {g.guestName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold"
                            style={{ fontSize: '14px' }}>
                            {g.guestName}
                          </div>
                          <div className="text-muted"
                            style={{ fontSize: '12px' }}>
                            {g.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold">
                        {g.roomNumber}
                      </span>
                      <div className="text-muted"
                        style={{ fontSize: '11px' }}>
                        {g.roomType}
                      </div>
                    </td>
                    <td className="hide-mobile"
                      style={{ fontSize: '13px' }}>
                      {formatDate(g.checkInDate)}
                    </td>
                    <td className="hide-mobile"
                      style={{ fontSize: '13px' }}>
                      {formatDate(g.expectedCheckOutDate)}
                    </td>
                    <td>
                      <span className={`badge rounded-pill
                        ${g.active
                          ? 'badge-available'
                          : 'badge-cancelled'}`}
                        style={{ padding: '5px 10px',
                                 fontSize: '11px' }}>
                        {g.active ? 'Active' : 'Checked Out'}
                      </span>
                    </td>
                    <td>
                      {g.active && (
                        <button
                          onClick={() => handleCheckout(
                            g.id, g.guestName)}
                          className="btn btn-sm"
                          style={{ background: '#fee2e2',
                                   color: '#dc3545',
                                   border: 'none',
                                   borderRadius: '8px',
                                   fontSize: '12px' }}>
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default GuestsPage;