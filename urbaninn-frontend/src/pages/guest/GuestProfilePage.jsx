import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import GuestLayout from '../../layouts/GuestLayout';
import toast from 'react-hot-toast';
import { User, BedDouble, LogOut } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';

const GuestProfilePage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuthStore();

  useEffect(() => { fetchSession(); }, []);

  const fetchSession = async () => {
    try {
      const res = await axiosInstance.get('/guest/me');
      setSession(res.data.data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    window.location.href = '/guest/login';
  };

  if (loading) return (
    <GuestLayout title="Profile">
      <div className="text-center py-5">
        <div className="spinner-border"
          style={{ color: '#f0a500' }}/>
      </div>
    </GuestLayout>
  );

  return (
    <GuestLayout title="My Profile">

      {/* Profile Card */}
      <div className="card border-0 mb-3"
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1a1a2e, #0f3460)'
        }}>
        <div className="card-body p-4 text-center">
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: '#f0a500',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '28px', fontWeight: 700,
            color: '#1a1a2e'
          }}>
            {session?.guestName?.charAt(0).toUpperCase()}
          </div>
          <h5 className="fw-bold mb-1"
            style={{ color: '#fff' }}>
            {session?.guestName}
          </h5>
          <div style={{ color: 'rgba(255,255,255,0.6)',
                        fontSize: '13px' }}>
            {session?.phoneNumber}
          </div>
          {session?.email && (
            <div style={{ color: 'rgba(255,255,255,0.5)',
                          fontSize: '12px' }}>
              {session?.email}
            </div>
          )}
        </div>
      </div>

      {/* Stay Details */}
      <div className="card border-0 shadow-sm mb-3"
        style={{ borderRadius: '16px' }}>
        <div className="card-body p-3">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <BedDouble size={18} color="#f0a500"/>
            Stay Details
          </h6>
          {[
            { label: 'Hotel', value: session?.hotelName },
            { label: 'Room', value: `${session?.roomNumber} (${session?.roomType})` },
            { label: 'Floor', value: session?.floor },
            { label: 'Check-In',
              value: formatDate(session?.checkInDate) },
            { label: 'Check-Out',
              value: formatDate(session?.expectedCheckOutDate) },
            { label: 'Guests',
              value: session?.numberOfGuests },
          ].map((item, i) => (
            <div key={i}
              className="d-flex justify-content-between
                align-items-center py-2"
              style={{ borderBottom: i < 5
                ? '1px solid #f0f0f0' : 'none' }}>
              <span className="text-muted"
                style={{ fontSize: '13px' }}>
                {item.label}
              </span>
              <span className="fw-semibold"
                style={{ fontSize: '13px' }}>
                {item.value || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ID Info */}
      <div className="card border-0 shadow-sm mb-3"
        style={{ borderRadius: '16px' }}>
        <div className="card-body p-3">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <User size={18} color="#f0a500"/>
            ID Information
          </h6>
          <div className="d-flex justify-content-between py-2"
            style={{ borderBottom: '1px solid #f0f0f0' }}>
            <span className="text-muted"
              style={{ fontSize: '13px' }}>
              ID Type
            </span>
            <span className="fw-semibold"
              style={{ fontSize: '13px' }}>
              {session?.idType?.replace('_', ' ')}
            </span>
          </div>
          <div className="d-flex justify-content-between py-2">
            <span className="text-muted"
              style={{ fontSize: '13px' }}>
              ID Number
            </span>
            <span className="fw-semibold"
              style={{ fontSize: '13px' }}>
              {session?.idProof}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="btn w-100 fw-semibold mb-4"
        style={{ background: '#fee2e2', color: '#dc3545',
                 border: 'none', borderRadius: '12px',
                 padding: '13px', fontSize: '15px' }}>
        <LogOut size={16} className="me-2"/>
        Logout
      </button>
    </GuestLayout>
  );
};

export default GuestProfilePage;
