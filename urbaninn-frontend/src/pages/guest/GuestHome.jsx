import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Bell, ShoppingBag,
         BedDouble, LogOut } from 'lucide-react';
import axiosInstance from '../../api/axios';
import GuestLayout from '../../layouts/GuestLayout';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const GuestHome = () => {
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sessionRes, ordersRes] = await Promise.all([
        axiosInstance.get('/guest/me'),
        axiosInstance.get('/guest/orders'),
      ]);
      setSession(sessionRes.data.data);
      setOrders(ordersRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    window.location.href = '/guest/login';
  };

  const activeOrder = orders.find(o =>
    !['DELIVERED', 'CANCELLED'].includes(o.status));

  const statusColor = {
    PLACED:    '#1e40af',
    CONFIRMED: '#3730a3',
    PREPARING: '#92400e',
    READY:     '#065f46',
    DELIVERED: '#374151',
    CANCELLED: '#991b1b',
  };

  if (loading) return (
    <GuestLayout title="Home">
      <div className="text-center py-5">
        <div className="spinner-border"
          style={{ color: '#f0a500' }}/>
      </div>
    </GuestLayout>
  );

  return (
    <GuestLayout title="Home">

      {/* Welcome Card */}
      <div className="card border-0 mb-3"
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
          color: '#fff'
        }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between
            align-items-start">
            <div>
              <div style={{ fontSize: '12px',
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: '4px' }}>
                Welcome back
              </div>
              <h5 className="fw-bold mb-1"
                style={{ color: '#f0a500' }}>
                {session?.guestName}
              </h5>
              <div style={{ fontSize: '13px',
                            color: 'rgba(255,255,255,0.7)' }}>
                {session?.hotelName}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.1)',
                       color: '#fff', border: 'none',
                       borderRadius: '10px' }}>
              <LogOut size={14}/>
            </button>
          </div>

          {/* Stay Info */}
          <div className="row mt-3 g-2">
            {[
              { label: 'Room', value: session?.roomNumber },
              { label: 'Type', value: session?.roomType },
              { label: 'Check-out',
                value: formatDate(session?.expectedCheckOutDate) },
            ].map((item, i) => (
              <div key={i} className="col-4">
                <div style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px',
                                fontWeight: 700,
                                color: '#f0a500' }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '10px',
                                color: 'rgba(255,255,255,0.5)',
                                marginTop: '2px' }}>
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Order Tracker */}
      {activeOrder && (
        <div className="card border-0 mb-3"
          style={{ borderRadius: '14px',
                   border: '1px solid #f0a500' }}>
          <div className="card-body p-3">
            <div className="d-flex justify-content-between
              align-items-center mb-2">
              <h6 className="fw-bold mb-0">
                🍽️ Active Order #{activeOrder.id}
              </h6>
              <span className="badge"
                style={{
                  background: '#fff8e7',
                  color: statusColor[activeOrder.status],
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '11px', fontWeight: 700
                }}>
                {activeOrder.status}
              </span>
            </div>
            <div className="text-muted"
              style={{ fontSize: '12px' }}>
              {activeOrder.items?.map(i =>
                `${i.menuItemName} ×${i.quantity}`
              ).join(', ')}
            </div>
            <Link to="/guest/orders"
              className="btn btn-sm w-100 mt-2"
              style={{ background: '#f0a500', color: '#000',
                       border: 'none', borderRadius: '8px',
                       fontSize: '13px' }}>
              Track Order
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <h6 className="fw-bold mb-3">Quick Actions</h6>
      <div className="row g-3 mb-4">
        {[
          { to: '/guest/menu',
            icon: <UtensilsCrossed size={28}
              color="#f0a500"/>,
            label: 'Order Food',
            desc: 'Browse & order from menu',
            bg: '#fff8e7' },
          { to: '/guest/services',
            icon: <Bell size={28} color="#0d6efd"/>,
            label: 'Room Service',
            desc: 'Request housekeeping etc.',
            bg: '#e8f0ff' },
          { to: '/guest/orders',
            icon: <ShoppingBag size={28} color="#198754"/>,
            label: 'My Orders',
            desc: `${orders.length} orders placed`,
            bg: '#e8f5ee' },
          { to: '/guest/profile',
            icon: <BedDouble size={28} color="#6f42c1"/>,
            label: 'My Room',
            desc: `Room ${session?.roomNumber}`,
            bg: '#f0ebff' },
        ].map((action, i) => (
          <div key={i} className="col-6">
            <Link to={action.to}
              style={{ textDecoration: 'none' }}>
              <div className="card border-0 h-100"
                style={{ borderRadius: '14px',
                         background: action.bg }}>
                <div className="card-body p-3 text-center">
                  <div className="mb-2">{action.icon}</div>
                  <div className="fw-bold"
                    style={{ fontSize: '14px',
                             color: '#1a1a2e' }}>
                    {action.label}
                  </div>
                  <div className="text-muted"
                    style={{ fontSize: '11px',
                             marginTop: '2px' }}>
                    {action.desc}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </GuestLayout>
  );
};

export default GuestHome;