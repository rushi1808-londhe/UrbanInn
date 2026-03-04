import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, BedDouble, UserCheck } from 'lucide-react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hotelsRes, staffRes] = await Promise.all([
        axiosInstance.get('/superadmin/hotels'),
        axiosInstance.get('/superadmin/staff'),
      ]);
      setHotels(hotelsRes.data.data || []);
      setStaff(staffRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activeHotels = hotels.filter(h => h.active).length;
  const totalRooms = hotels.reduce((sum, h) => sum + h.totalRooms, 0);
  const activeGuests = hotels.reduce((sum, h) => sum + h.activeGuests, 0);

  const stats = [
    {
      label: 'Total Hotels',
      value: hotels.length,
      sub: `${activeHotels} active`,
      icon: <Building2 size={22} color="#f0a500"/>,
      bg: '#fff8e7',
      link: '/superadmin/hotels'
    },
    {
      label: 'Total Staff',
      value: staff.length,
      sub: `${staff.filter(s => s.active).length} active`,
      icon: <Users size={22} color="#0d6efd"/>,
      bg: '#e8f0ff',
      link: '/superadmin/staff'
    },
    {
      label: 'Total Rooms',
      value: totalRooms,
      sub: 'across all hotels',
      icon: <BedDouble size={22} color="#198754"/>,
      bg: '#e8f5ee',
      link: '/superadmin/hotels'
    },
    {
      label: 'Active Guests',
      value: activeGuests,
      sub: 'checked in now',
      icon: <UserCheck size={22} color="#6f42c1"/>,
      bg: '#f0ebff',
      link: '/superadmin/hotels'
    },
  ];

  if (loading) {
    return (
      <StaffLayout>
        <div className="d-flex justify-content-center
          align-items-center" style={{ height: '60vh' }}>
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      {/* Header */}
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Super Admin Dashboard</h4>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            Overview of all hotels and operations
          </p>
        </div>
        <Link to="/superadmin/hotels"
          className="btn fw-semibold"
          style={{ background: '#f0a500', color: '#000',
                   border: 'none', borderRadius: '10px',
                   padding: '10px 20px' }}>
          + Add Hotel
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {stats.map((stat, i) => (
          <div key={i} className="col-6 col-lg-3">
            <Link to={stat.link}
              style={{ textDecoration: 'none' }}>
              <div className="stat-card h-100"
                style={{ background: '#fff' }}>
                <div className="d-flex justify-content-between
                  align-items-start">
                  <div>
                    <div className="stat-value"
                      style={{ fontSize: '28px',
                               fontWeight: 700,
                               color: '#1a1a2e' }}>
                      {stat.value}
                    </div>
                    <div className="fw-semibold mt-1"
                      style={{ fontSize: '14px' }}>
                      {stat.label}
                    </div>
                    <div className="text-muted"
                      style={{ fontSize: '12px' }}>
                      {stat.sub}
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

      {/* Hotels Table */}
      <div className="table-card mb-4">
        <div className="d-flex justify-content-between
          align-items-center p-3 border-bottom">
          <h6 className="fw-bold mb-0">All Hotels</h6>
          <Link to="/superadmin/hotels"
            style={{ fontSize: '13px', color: '#f0a500',
                     textDecoration: 'none' }}>
            Manage Hotels →
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>City</th>
                <th>Rooms</th>
                <th>Guests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {hotels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center
                    text-muted py-4">
                    No hotels added yet
                  </td>
                </tr>
              ) : (
                hotels.map(hotel => (
                  <tr key={hotel.id}>
                    <td>
                      <div className="fw-semibold">
                        {hotel.name}
                      </div>
                      <div className="text-muted"
                        style={{ fontSize: '12px' }}>
                        {hotel.email}
                      </div>
                    </td>
                    <td>{hotel.city}, {hotel.country}</td>
                    <td>{hotel.totalRooms}</td>
                    <td>{hotel.activeGuests}</td>
                    <td>
                      <span className={`badge rounded-pill
                        ${hotel.active
                          ? 'badge-available'
                          : 'badge-cancelled'}`}
                        style={{ padding: '5px 10px' }}>
                        {hotel.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Staff */}
      <div className="table-card">
        <div className="d-flex justify-content-between
          align-items-center p-3 border-bottom">
          <h6 className="fw-bold mb-0">Recent Staff</h6>
          <Link to="/superadmin/staff"
            style={{ fontSize: '13px', color: '#f0a500',
                     textDecoration: 'none' }}>
            Manage Staff →
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Hotel</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center
                    text-muted py-4">
                    No staff added yet
                  </td>
                </tr>
              ) : (
                staff.slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: '32px', height: '32px',
                          borderRadius: '50%',
                          background: '#1a1a2e',
                          color: '#f0a500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold"
                            style={{ fontSize: '14px' }}>
                            {s.name}
                          </div>
                          <div className="text-muted"
                            style={{ fontSize: '12px' }}>
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue"
                        style={{
                          background: '#e8f0ff',
                          color: '#0d6efd',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px'
                        }}>
                        {s.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {s.hotelName || '—'}
                    </td>
                    <td>
                      <span className={`badge rounded-pill
                        ${s.active
                          ? 'badge-available'
                          : 'badge-cancelled'}`}
                        style={{ padding: '5px 10px' }}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </StaffLayout>
  );
};

export default SuperAdminDashboard;