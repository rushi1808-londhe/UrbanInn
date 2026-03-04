import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const GuestVerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setGuestAuth } = useAuthStore();

  // get phone + hotelId passed from OTP page
  const { phoneNumber, hotelId } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [errors, setErrors] = useState({});
  const inputRefs = useRef([]);

  // redirect if no phone/hotel
  useEffect(() => {
    if (!phoneNumber || !hotelId) {
      navigate('/guest/login');
    }
  }, [phoneNumber, hotelId, navigate]);

  // countdown timer
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  // OTP input handler
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // OTP backspace handler
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // paste handler
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await axiosInstance.post('/auth/guest/request-otp', {
        phoneNumber, hotelId
      });
      toast.success('OTP resent!');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    const errs = {};

    if (otpString.length < 6)
      errs.otp = 'Enter complete 6-digit OTP';
    if (!roomNumber)
      errs.roomNumber = 'Room number is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/guest/verify', {
        phoneNumber,
        hotelId,
        otp: otpString,
        roomNumber
      });
      const { token, ...guestData } = res.data.data;
      setGuestAuth(token, guestData);
      toast.success(`Welcome, ${guestData.guestName}!`);
      navigate('/guest/home');
    } catch (err) {
      const msg = err.response?.data?.message ||
        'Invalid OTP or room number';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Back */}
        <Link
          to="/guest/login"
          className="d-flex align-items-center gap-1 mb-4"
          style={{ color: '#6c757d', fontSize: '13px',
                   textDecoration: 'none' }}
        >
          <ArrowLeft size={15}/> Back
        </Link>

        {/* Icon */}
        <div className="text-center mb-4">
          <div
            style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              borderRadius: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <ShieldCheck size={28} color="#f0a500"/>
          </div>
          <h5 className="fw-bold mb-1">Verify OTP</h5>
          <p className="text-muted" style={{ fontSize: '13px' }}>
            OTP sent to{' '}
            <strong>+91 {phoneNumber}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* OTP Boxes */}
          <div className="mb-4">
            <label className="form-label fw-semibold"
              style={{ fontSize: '13px' }}>
              Enter OTP
            </label>
            <div className="d-flex gap-2 justify-content-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`form-control text-center fw-bold
                    ${errors.otp ? 'is-invalid' : ''}`}
                  style={{
                    width: '46px', height: '52px',
                    fontSize: '20px', borderRadius: '10px',
                    border: digit
                      ? '2px solid #f0a500'
                      : '1px solid #dee2e6',
                    padding: 0
                  }}
                />
              ))}
            </div>
            {errors.otp && (
              <div className="text-danger mt-1"
                style={{ fontSize: '12px' }}>
                {errors.otp}
              </div>
            )}

            {/* Resend */}
            <div className="text-center mt-3">
              {timer > 0 ? (
                <span className="text-muted"
                  style={{ fontSize: '12px' }}>
                  Resend OTP in{' '}
                  <strong style={{ color: '#f0a500' }}>
                    {timer}s
                  </strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={handleResend}
                  disabled={resendLoading}
                  style={{ color: '#f0a500',
                           fontSize: '13px',
                           textDecoration: 'none' }}
                >
                  {resendLoading ? 'Resending...' : 'Resend OTP'}
                </button>
              )}
            </div>
          </div>

          {/* Room Number */}
          <div className="mb-4">
            <label className="form-label fw-semibold"
              style={{ fontSize: '13px' }}>
              Room Number
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => {
                setRoomNumber(e.target.value);
                setErrors({ ...errors, roomNumber: '' });
              }}
              className={`form-control
                ${errors.roomNumber ? 'is-invalid' : ''}`}
              placeholder="e.g. 101, 202A"
              style={{ padding: '11px 14px', fontSize: '14px' }}
            />
            {errors.roomNumber && (
              <div className="invalid-feedback">
                {errors.roomNumber}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn w-100 fw-semibold"
            disabled={loading}
            style={{
              background: '#f0a500', color: '#000',
              padding: '12px', fontSize: '15px',
              borderRadius: '10px', border: 'none'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border
                  spinner-border-sm me-2"/>
                Verifying...
              </>
            ) : (
              'Verify & Login'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default GuestVerifyPage;
