import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { BedDouble, Phone, LogIn } from 'lucide-react';

const GuestLoginPage = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({
    phoneNumber: '',
    roomNumber: '',
    hotelId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    try {
      const res = await axiosInstance.get(
        '/auth/hotels');
      setHotels(res.data.data || []);
    } catch {
      // silently fail — hotel dropdown optional
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.phoneNumber ||
        !/^[0-9]{10}$/.test(form.phoneNumber))
      errs.phoneNumber = 'Enter valid 10-digit number';
    if (!form.roomNumber)
      errs.roomNumber = 'Room number is required';
    if (!form.hotelId)
      errs.hotelId = 'Please select a hotel';
    return errs;
  };

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        '/auth/guest/login', {
          phoneNumber: form.phoneNumber,
          roomNumber: form.roomNumber,
          hotelId: parseInt(form.hotelId)
        });

      const data = res.data.data;

      // store token and guest info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.guestName,
        role: 'GUEST',
        roomNumber: data.roomNumber,
        roomType: data.roomType,
        hotelName: data.hotelName,
        sessionId: data.sessionId
      }));

      toast.success(`Welcome, ${data.guestName}! 🎉`);
      window.location.href = '/guest/home';

    } catch (err) {
      toast.error(err.response?.data?.message ||
        'Login failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  const f = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{ fontSize: '36px',
                        fontWeight: 800,
                        color: '#f0a500' }}>
            Urban
          </div>
          <div style={{ fontSize: '14px',
                        fontWeight: 800,
                        color: '#f0a500',
                        letterSpacing: '6px' }}>
            INN
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)',
                        fontSize: '13px',
                        marginTop: '6px' }}>
            Guest Portal
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '32px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h5 className="fw-bold mb-1"
            style={{ color: '#1a1a2e' }}>
            Welcome Guest 👋
          </h5>
          <p className="text-muted mb-4"
            style={{ fontSize: '13px' }}>
            Enter your phone number and room details
          </p>

          {/* Hotel */}
          <div className="mb-3">
            <label className="form-label fw-semibold"
              style={{ fontSize: '13px' }}>
              Hotel
            </label>
            <select
              className={`form-select
                ${errors.hotelId ? 'is-invalid' : ''}`}
              value={form.hotelId}
              onChange={e => f('hotelId', e.target.value)}
              style={{ borderRadius: '10px',
                       padding: '11px 14px' }}>
              <option value="">Select your hotel</option>
              {hotels.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.city}
                </option>
              ))}
            </select>
            {errors.hotelId && (
              <div className="invalid-feedback">
                {errors.hotelId}
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label fw-semibold"
              style={{ fontSize: '13px' }}>
              Phone Number
            </label>
            <div className="input-group">
              <span className="input-group-text"
                style={{ borderRadius: '10px 0 0 10px',
                         background: '#f8f9fa' }}>
                <Phone size={15} color="#6c757d"/>
                <span className="ms-1"
                  style={{ fontSize: '13px' }}>
                  +91
                </span>
              </span>
              <input
                type="tel"
                maxLength={10}
                className={`form-control
                  ${errors.phoneNumber ? 'is-invalid' : ''}`}
                value={form.phoneNumber}
                onChange={e => f('phoneNumber',
                  e.target.value)}
                placeholder="10-digit mobile number"
                style={{ borderRadius: '0 10px 10px 0',
                         padding: '11px 14px' }}
              />
              {errors.phoneNumber && (
                <div className="invalid-feedback">
                  {errors.phoneNumber}
                </div>
              )}
            </div>
          </div>

          {/* Room Number */}
          <div className="mb-4">
            <label className="form-label fw-semibold"
              style={{ fontSize: '13px' }}>
              Room Number
            </label>
            <div className="input-group">
              <span className="input-group-text"
                style={{ borderRadius: '10px 0 0 10px',
                         background: '#f8f9fa' }}>
                <BedDouble size={15} color="#6c757d"/>
              </span>
              <input
                type="text"
                className={`form-control
                  ${errors.roomNumber ? 'is-invalid' : ''}`}
                value={form.roomNumber}
                onChange={e => f('roomNumber',
                  e.target.value)}
                placeholder="e.g. 101"
                style={{ borderRadius: '0 10px 10px 0',
                         padding: '11px 14px' }}
              />
              {errors.roomNumber && (
                <div className="invalid-feedback">
                  {errors.roomNumber}
                </div>
              )}
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn w-100 fw-bold"
            style={{
              background: '#f0a500',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px'
            }}>
            {loading ? (
              <span className="spinner-border
                spinner-border-sm me-2"/>
            ) : (
              <LogIn size={16} className="me-2"/>
            )}
            Access My Room
          </button>

          <p className="text-center text-muted mt-3 mb-0"
            style={{ fontSize: '12px' }}>
            Having trouble? Contact the front desk
          </p>
        </div>

        {/* Staff Login Link */}
        <p className="text-center mt-3"
          style={{ color: 'rgba(255,255,255,0.4)',
                   fontSize: '13px' }}>
          Staff?{' '}
          <a href="/login"
            style={{ color: '#f0a500' }}>
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default GuestLoginPage;