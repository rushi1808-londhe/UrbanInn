import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag,
         Bell, User } from 'lucide-react';
import useAuthStore from '../store/authStore';

const GuestLayout = ({ children, title }) => {
  const { user } = useAuthStore();

  return (
    <div className="guest-wrapper">

      {/* ── Guest Topbar ── */}
      <div className="guest-topbar">
        <div>
          <div className="hotel-name">
            {user?.hotelName || 'UrbanInn'}
          </div>
          <div style={{fontSize:'11px',
                       color:'rgba(255,255,255,0.5)'}}>
            {title || 'Welcome'}
          </div>
        </div>
        <div className="room-badge">
          Room {user?.roomNumber || '—'}
        </div>
      </div>

      {/* ── Page Content ── */}
      <div className="container-fluid py-3 px-3">
        {children}
      </div>

      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav">
        <NavLink
          to="/guest/home"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <Home size={22}/>
          Home
        </NavLink>
        <NavLink
          to="/guest/menu"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <UtensilsCrossed size={22}/>
          Menu
        </NavLink>
        <NavLink
          to="/guest/orders"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <ShoppingBag size={22}/>
          Orders
        </NavLink>
        <NavLink
          to="/guest/services"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <Bell size={22}/>
          Services
        </NavLink>
        <NavLink
          to="/guest/profile"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <User size={22}/>
          Profile
        </NavLink>
      </nav>
    </div>
  );
};

export default GuestLayout;