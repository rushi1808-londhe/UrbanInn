import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, UtensilsCrossed,
         Users, TrendingUp, IndianRupee } from 'lucide-react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('today');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, revenueRes] = await Promise.all([
        axiosInstance.get('/admin/dashboard'),
        axiosInstance.get('/admin/revenue'),
      ]);
      setStats(statsRes.data.data);
      setRevenue(revenueRes.data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <StaffLayout>
      <div className="d-flex justify-content-center
        align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border"
          style={{ color: '#f0a500' }}/>
      </div>
    </StaffLayout>
  );

  const occupancyRate = stats?.totalRooms > 0
    ? Math.round((stats?.occupiedRooms /
        stats?.totalRooms) * 100)
    : 0;

  const occupancyColor = occupancyRate >= 70
    ? '#198754' : occupancyRate >= 40
    ? '#f0a500' : '#dc3545';

  const currentRevenue = revenuePeriod === 'today'
    ? revenue?.today
    : revenuePeriod === 'week'
    ? revenue?.thisWeek
    : revenue?.thisMonth;

  return (
    <StaffLayout>
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Hotel Dashboard</h4>
        <p className="text-muted mb-0"
          style={{ fontSize: '14px' }}>
          Overview of your hotel operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Rooms',
            value: stats?.totalRooms || 0,
            sub: `${stats?.availableRooms || 0} available`,
            icon: <BedDouble size={22} color="#0d6efd"/>,
            bg: '#e8f0ff',
            link: '/admin/rooms' },
          { label: 'Occupied Rooms',
            value: stats?.occupiedRooms || 0,
            sub: `${occupancyRate}% occupancy`,
            icon: <BedDouble size={22} color="#dc3545"/>,
            bg: '#fee2e2',
            link: '/admin/rooms' },
          { label: 'Active Guests',
            value: stats?.activeGuests || 0,
            sub: 'Currently checked in',
            icon: <Users size={22} color="#198754"/>,
            bg: '#e8f5ee',
            link: '/admin/rooms' },
          { label: 'Menu Items',
            value: stats?.menuItems || 0,
            sub: `${stats?.staffCount || 0} staff members`,
            icon: <UtensilsCrossed size={22} color="#f0a500"/>,
            bg: '#fff8e7',
            link: '/admin/menu' },
        ].map((stat, i) => (
          <div key={i} className="col-6 col-lg-3">
            <Link to={stat.link}
              style={{ textDecoration: 'none' }}>
              <div className="card border-0 shadow-sm p-3"
                style={{ borderRadius: '14px' }}>
                <div className="d-flex justify-content-between
                  align-items-start">
                  <div>
                    <div style={{ fontSize: '28px',
                                  fontWeight: 700,
                                  color: '#1a1a2e' }}>
                      {stat.value}
                    </div>
                    <div className="fw-semibold mt-1"
                      style={{ fontSize: '14px',
                               color: '#1a1a2e' }}>
                      {stat.label}
                    </div>
                    <div className="text-muted"
                      style={{ fontSize: '12px' }}>
                      {stat.sub}
                    </div>
                  </div>
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: stat.bg,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3">

        {/* Occupancy Rate */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100"
            style={{ borderRadius: '14px' }}>
            <div className="card-body p-4 text-center">
              <h6 className="fw-bold mb-3">
                Occupancy Rate
              </h6>
              <div style={{ fontSize: '56px',
                            fontWeight: 800,
                            color: occupancyColor,
                            lineHeight: 1 }}>
                {occupancyRate}%
              </div>
              <div className="text-muted mt-2 mb-3"
                style={{ fontSize: '13px' }}>
                {stats?.occupiedRooms} of{' '}
                {stats?.totalRooms} rooms occupied
              </div>
              <div className="progress"
                style={{ height: '8px',
                         borderRadius: '10px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${occupancyRate}%`,
                    background: occupancyColor,
                    borderRadius: '10px',
                    transition: 'width 1s'
                  }}
                />
              </div>
              <div className="row mt-3 g-2">
                {[
                  { label: 'Available',
                    value: stats?.availableRooms || 0,
                    color: '#198754' },
                  { label: 'Occupied',
                    value: stats?.occupiedRooms || 0,
                    color: '#dc3545' },
                  { label: 'Other',
                    value: (stats?.totalRooms || 0) -
                      (stats?.availableRooms || 0) -
                      (stats?.occupiedRooms || 0),
                    color: '#f0a500' },
                ].map((s, i) => (
                  <div key={i} className="col-4">
                    <div style={{ fontSize: '18px',
                                  fontWeight: 700,
                                  color: s.color }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '11px',
                                  color: '#6c757d' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100"
            style={{ borderRadius: '14px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between
                align-items-center mb-4">
                <h6 className="fw-bold mb-0">
                  <IndianRupee size={16}
                    className="me-1"
                    style={{ color: '#f0a500' }}/>
                  Revenue
                </h6>
                {/* Period Toggle */}
                <div className="d-flex gap-1">
                  {['today', 'week', 'month'].map(p => (
                    <button
                      key={p}
                      onClick={() => setRevenuePeriod(p)}
                      className="btn btn-sm"
                      style={{
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        border: revenuePeriod === p
                          ? '2px solid #f0a500'
                          : '1px solid #dee2e6',
                        background: revenuePeriod === p
                          ? '#fff8e7' : '#fff',
                        color: revenuePeriod === p
                          ? '#f0a500' : '#6c757d',
                        fontWeight: revenuePeriod === p
                          ? 600 : 400
                      }}>
                      {p === 'today' ? 'Today'
                        : p === 'week' ? 'This Week'
                        : 'This Month'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Revenue Number */}
              <div className="text-center mb-4">
                <div style={{ fontSize: '48px',
                              fontWeight: 800,
                              color: '#f0a500' }}>
                  ₹{currentRevenue?.total?.toLocaleString()
                    || 0}
                </div>
                <div className="text-muted"
                  style={{ fontSize: '13px' }}>
                  Total revenue for{' '}
                  {revenuePeriod === 'today' ? 'today'
                    : revenuePeriod === 'week'
                    ? 'this week' : 'this month'}
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="row g-3">
                {[
                  { label: 'Room Revenue',
                    value: currentRevenue?.roomRevenue || 0,
                    color: '#0d6efd', bg: '#e8f0ff',
                    icon: <BedDouble size={18}
                      color="#0d6efd"/> },
                  { label: 'Food Revenue',
                    value: currentRevenue?.foodRevenue || 0,
                    color: '#198754', bg: '#e8f5ee',
                    icon: <UtensilsCrossed size={18}
                      color="#198754"/> },
                  { label: 'Checkouts',
                    value: currentRevenue?.checkouts || 0,
                    color: '#6f42c1', bg: '#f0ebff',
                    icon: <TrendingUp size={18}
                      color="#6f42c1"/> },
                ].map((item, i) => (
                  <div key={i} className="col-4">
                    <div className="p-3 rounded text-center"
                      style={{ background: item.bg,
                               borderRadius: '12px' }}>
                      <div className="mb-1">
                        {item.icon}
                      </div>
                      <div style={{ fontSize: '20px',
                                    fontWeight: 700,
                                    color: item.color }}>
                        {item.label === 'Checkouts'
                          ? item.value
                          : `₹${item.value
                              .toLocaleString()}`}
                      </div>
                      <div style={{ fontSize: '11px',
                                    color: '#6c757d',
                                    marginTop: '2px' }}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default AdminDashboard;