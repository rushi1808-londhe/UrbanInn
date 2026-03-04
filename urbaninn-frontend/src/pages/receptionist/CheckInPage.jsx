import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const CheckInPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    guestName: '', phoneNumber: '', email: '',
    idProof: '', idType: 'AADHAR',
    roomId: '', numberOfGuests: 1,
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOutDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchAvailableRooms(); }, []);

  const fetchAvailableRooms = async () => {
    try {
      const res = await axiosInstance.get(
        '/receptionist/rooms');
      const available = (res.data.data || []).filter(
        r => r.status === 'AVAILABLE');
      setRooms(available);
    } catch {
      toast.error('Failed to load rooms');
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.guestName) errs.guestName = 'Required';
    if (!form.phoneNumber) errs.phoneNumber = 'Required';
    else if (!/^[0-9]{10}$/.test(form.phoneNumber))
      errs.phoneNumber = 'Must be 10 digits';
    if (!form.idProof) errs.idProof = 'Required';
    if (!form.roomId) errs.roomId = 'Required';
    if (!form.checkInDate) errs.checkInDate = 'Required';
    if (!form.expectedCheckOutDate)
      errs.expectedCheckOutDate = 'Required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/receptionist/checkin', {
        ...form,
        roomId: parseInt(form.roomId),
        numberOfGuests: parseInt(form.numberOfGuests),
      });
      toast.success(`${form.guestName} checked in!`);
      navigate('/receptionist/guests');
    } catch (err) {
      toast.error(err.response?.data?.message ||
        'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  return (
    <StaffLayout>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Guest Check-In</h4>
        <p className="text-muted mb-0"
          style={{ fontSize: '14px' }}>
          Fill in guest details to complete check-in
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                {/* Guest Info */}
                <div className="col-12">
                  <h6 className="fw-bold mb-0"
                    style={{ color: '#f0a500' }}>
                    Guest Information
                  </h6>
                  <hr className="mt-2"/>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    Full Name *
                  </label>
                  <input
                    className={`form-control
                      ${errors.guestName ? 'is-invalid' : ''}`}
                    value={form.guestName}
                    onChange={e => f('guestName', e.target.value)}
                    placeholder="Guest full name"
                  />
                  {errors.guestName && (
                    <div className="invalid-feedback">
                      {errors.guestName}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    Phone Number *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      className={`form-control
                        ${errors.phoneNumber ? 'is-invalid' : ''}`}
                      value={form.phoneNumber}
                      onChange={e =>
                        f('phoneNumber', e.target.value)}
                      placeholder="10-digit number"
                    />
                    {errors.phoneNumber && (
                      <div className="invalid-feedback">
                        {errors.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={e => f('email', e.target.value)}
                    placeholder="guest@email.com"
                  />
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    ID Type *
                  </label>
                  <select
                    className="form-select"
                    value={form.idType}
                    onChange={e => f('idType', e.target.value)}>
                    {['AADHAR', 'PASSPORT',
                      'DRIVING_LICENSE', 'VOTER_ID'].map(t => (
                      <option key={t} value={t}>
                        {t.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    ID Number *
                  </label>
                  <input
                    className={`form-control
                      ${errors.idProof ? 'is-invalid' : ''}`}
                    value={form.idProof}
                    onChange={e => f('idProof', e.target.value)}
                    placeholder="ID number"
                  />
                  {errors.idProof && (
                    <div className="invalid-feedback">
                      {errors.idProof}
                    </div>
                  )}
                </div>

                {/* Room Info */}
                <div className="col-12 mt-2">
                  <h6 className="fw-bold mb-0"
                    style={{ color: '#f0a500' }}>
                    Room & Stay Details
                  </h6>
                  <hr className="mt-2"/>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    Select Room *
                  </label>
                  <select
                    className={`form-select
                      ${errors.roomId ? 'is-invalid' : ''}`}
                    value={form.roomId}
                    onChange={e => f('roomId', e.target.value)}>
                    <option value="">
                      -- Select available room --
                    </option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} — {r.roomType}
                        (Floor {r.floor}) — ₹{r.pricePerNight}/night
                      </option>
                    ))}
                  </select>
                  {errors.roomId && (
                    <div className="invalid-feedback">
                      {errors.roomId}
                    </div>
                  )}
                  {rooms.length === 0 && (
                    <div className="text-danger mt-1"
                      style={{ fontSize: '12px' }}>
                      No available rooms
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    min={1} max={10}
                    className="form-control"
                    value={form.numberOfGuests}
                    onChange={e =>
                      f('numberOfGuests', e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    Check-In Date *
                  </label>
                  <input
                    type="date"
                    className={`form-control
                      ${errors.checkInDate ? 'is-invalid' : ''}`}
                    value={form.checkInDate}
                    onChange={e =>
                      f('checkInDate', e.target.value)}
                  />
                  {errors.checkInDate && (
                    <div className="invalid-feedback">
                      {errors.checkInDate}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: '13px' }}>
                    Expected Check-Out *
                  </label>
                  <input
                    type="date"
                    className={`form-control
                      ${errors.expectedCheckOutDate
                        ? 'is-invalid' : ''}`}
                    value={form.expectedCheckOutDate}
                    min={form.checkInDate}
                    onChange={e =>
                      f('expectedCheckOutDate', e.target.value)}
                  />
                  {errors.expectedCheckOutDate && (
                    <div className="invalid-feedback">
                      {errors.expectedCheckOutDate}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="col-12 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn fw-semibold w-100"
                    style={{ background: '#f0a500',
                             color: '#000', border: 'none',
                             borderRadius: '10px',
                             padding: '13px' }}>
                    {loading ? (
                      <span className="spinner-border
                        spinner-border-sm me-2"/>
                    ) : (
                      <UserPlus size={16} className="me-2"/>
                    )}
                    Complete Check-In
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default CheckInPage;