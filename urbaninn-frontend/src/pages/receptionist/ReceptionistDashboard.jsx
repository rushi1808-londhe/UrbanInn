import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BedDouble, Bell, UserPlus } from 'lucide-react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { getRoomStatusBadge, formatDate } from '../../utils/helpers';

const ReceptionistDashboard = () => {
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [guestsRes, roomsRes, servicesRes] = await Promise.all([
        axiosInstance.get('/receptionist/guests'),
        axiosInstance.get('/receptionist/rooms'),
        axiosInstance.get('/receptionist/service-requests'),
      ]);
      setGuests(guestsRes.data.data || []);
      setRooms(roomsRes.data.data || []);
      setServices(servicesRes.data.data || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const availableRooms = rooms.filter(
    r => r.status === 'AVAILABLE').length;
  const occupiedRooms = rooms.filter(
    r => r.status === 'OCCUPIED').length;

  if (loading) return (
    <StaffLayout>
      <div className="d-flex justify-content-center
        align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border"
          style={{ color: '#f0a500' }}/>
      </div>
    </StaffLayout>
  );

  return (
    <StaffLayout>
      {/* Header */}
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">
            Receptionist Dashboard
          </h4>
          <p className="text-muted mb-0"
            style={{ fontSize: '14px' }}>
            Manage check-ins, check-outs and guest requests
          </p>
        </div>
        <Link to="/receptionist/checkin"
          className="btn fw-semibold"
          style={{ background: '#f0a500', color: '#000',
                   border: 'none', borderRadius: '10px',
                   padding: '10px 20px' }}>
          <UserPlus size={16} className="me-1"/>
          New Check-In
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Active Guests', value: guests.length,
            icon: <Users size={22} color="#0d6efd"/>,
            bg: '#e8f0ff', link: '/receptionist/guests' },
          { label: 'Available Rooms', value: availableRooms,
            icon: <BedDouble size={22} color="#198754"/>,
            bg: '#e8f5ee', link: '/receptionist/rooms' },
          { label: 'Occupied Rooms', value: occupiedRooms,
            icon: <BedDouble size={22} color="#dc3545"/>,
            bg: '#fee2e2', link: '/receptionist/rooms' },
          { label: 'Pending Requests', value: services.length,
            icon: <Bell size={22} color="#f0a500"/>,
            bg: '#fff8e7', link: '/receptionist/services' },
        ].map((stat, i) => (
          <div key={i} className="col-6 col-lg-3">
            <Link to={stat.link}
              style={{ textDecoration: 'none' }}>
              <div className="stat-card"
                style={{ background: '#fff' }}>
                <div className="d-flex justify-content-between
                  align-items-start">
                  <div>
                    <div style={{ fontSize: '28px',
                                  fontWeight: 700,
                                  color: '#1a1a2e' }}>
                      {stat.value}
                    </div>
                    <div className="fw-semibold mt-1"
                      style={{ fontSize: '14px' }}>
                      {stat.label}
                    </div>
                  </div>
                  <div className="stat-icon"
                    style={{ background: stat.bg }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Active Guests */}
        <div className="col-12 col-lg-7">
          <div className="table-card">
            <div className="d-flex justify-content-between
              align-items-center p-3 border-bottom">
              <h6 className="fw-bold mb-0">Active Guests</h6>
              <Link to="/receptionist/guests"
                style={{ fontSize: '13px', color: '#f0a500',
                         textDecoration: 'none' }}>
                View All →
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Room</th>
                    <th className="hide-mobile">Check-in</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.length === 0 ? (
                    <tr>
                      <td colSpan={4}
                        className="text-center text-muted py-4">
                        No active guests
                      </td>
                    </tr>
                  ) : guests.slice(0, 5).map(g => (
                    <tr key={g.id}>
                      <td>
                        <div className="fw-semibold"
                          style={{ fontSize: '14px' }}>
                          {g.guestName}
                        </div>
                        <div className="text-muted"
                          style={{ fontSize: '12px' }}>
                          {g.phoneNumber}
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
                      <td>
                        <CheckOutButton
                          sessionId={g.id}
                          onSuccess={fetchData}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Services */}
        <div className="col-12 col-lg-5">
          <div className="table-card h-100">
            <div className="d-flex justify-content-between
              align-items-center p-3 border-bottom">
              <h6 className="fw-bold mb-0">
                Pending Requests
              </h6>
              <Link to="/receptionist/services"
                style={{ fontSize: '13px', color: '#f0a500',
                         textDecoration: 'none' }}>
                View All →
              </Link>
            </div>
            {services.length === 0 ? (
              <div className="text-center text-muted py-4">
                <Bell size={32}
                  style={{ opacity: 0.3,
                           display: 'block',
                           margin: '0 auto 8px' }}/>
                No pending requests
              </div>
            ) : (
              services.slice(0, 5).map(s => (
                <div key={s.id}
                  className="d-flex align-items-center
                    gap-3 p-3 border-bottom">
                  <div
                    style={{ width: '36px', height: '36px',
                             borderRadius: '10px',
                             background: '#fff8e7',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             flexShrink: 0 }}>
                    <Bell size={16} color="#f0a500"/>
                  </div>
                  <div className="flex-fill">
                    <div className="fw-semibold"
                      style={{ fontSize: '13px' }}>
                      {s.serviceType?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-muted"
                      style={{ fontSize: '12px' }}>
                      Room {s.roomNumber} • {s.guestName}
                    </div>
                  </div>
                  <span className="badge badge-placed"
                    style={{ fontSize: '10px',
                             padding: '4px 8px',
                             borderRadius: '20px' }}>
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

// Mini checkout button component
const CheckOutButton = ({ sessionId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!window.confirm('Check out this guest?')) return;
    setLoading(true);
    try {
      await axiosInstance.patch(
        `/receptionist/checkout/${sessionId}`);
      toast.success('Guest checked out!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="btn btn-sm"
      style={{ background: '#fee2e2', color: '#dc3545',
               border: 'none', borderRadius: '8px',
               fontSize: '12px', padding: '4px 10px' }}>
      {loading
        ? <span className="spinner-border spinner-border-sm"/>
        : 'Check Out'}
    </button>
  );
};

export default ReceptionistDashboard;