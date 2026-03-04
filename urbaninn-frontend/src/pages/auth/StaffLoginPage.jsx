import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import { Eye, EyeOff } from 'lucide-react';

const StaffLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', {
        email, password
      });

      console.log('Response:', res.data);

      const data = res.data.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role,
        hotelId: data.hotelId,
      }));

      toast.success('Login successful!');

      // direct redirect based on role
      if (data.role === 'SUPER_ADMIN') {
        window.location.href = '/superadmin/dashboard';
      } else if (data.role === 'HOTEL_ADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (data.role === 'RECEPTIONIST') {
        window.location.href = '/receptionist/dashboard';
      } else if (data.role === 'KITCHEN_STAFF') {
        window.location.href = '/kitchen/dashboard';
      }

    } catch (err) {
      console.log('Error:', err);
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="text-center mb-4">
          <div className="auth-logo">
            Urban<span>Inn</span>
          </div>
          <p className="text-muted" style={{ fontSize: '13px' }}>
            Hotel Management Platform
          </p>
        </div>

        <h5 className="fw-bold mb-1">Staff Login</h5>
        <p className="text-muted mb-4" style={{ fontSize: '13px' }}>
          Sign in to your account to continue
        </p>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label fw-semibold"
            style={{ fontSize: '13px' }}>
            Email Address
          </label>
          <input
            type="email"
            className="form-control"
            placeholder="you@urbaninn.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ padding: '11px 14px', fontSize: '14px' }}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="form-label fw-semibold"
            style={{ fontSize: '13px' }}>
            Password
          </label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ padding: '11px 14px', fontSize: '14px' }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="btn w-100 fw-semibold"
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
              Signing in...
            </>
          ) : 'Sign In'}
        </button>

        <div className="text-center my-4">
          <span className="text-muted" style={{ fontSize: '13px' }}>
            ── or ──
          </span>
        </div>

        <Link
          to="/guest/login"
          className="btn w-100 fw-semibold"
          style={{
            background: '#1a1a2e', color: '#f0a500',
            padding: '12px', fontSize: '14px',
            borderRadius: '10px', border: 'none',
            textDecoration: 'none'
          }}
        >
          Guest? Login with Room Number
        </Link>

      </div>
    </div>
  );
};

export default StaffLoginPage;