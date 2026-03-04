import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BedDouble, Bell,
  UserPlus, UtensilsCrossed, ChefHat,
  Receipt, Building2, ClipboardList, LogOut
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const getNavItems = (role) => {
  if (role === 'SUPER_ADMIN') return [
    { path: '/superadmin/dashboard',
      icon: <LayoutDashboard size={18}/>,
      label: 'Dashboard' },
    { path: '/superadmin/hotels',
      icon: <Building2 size={18}/>,
      label: 'Hotels' },
    { path: '/superadmin/staff',
      icon: <Users size={18}/>,
      label: 'Staff' },
  ];

  if (role === 'HOTEL_ADMIN') return [
    { path: '/admin/dashboard',
      icon: <LayoutDashboard size={18}/>,
      label: 'Dashboard' },
    { path: '/admin/rooms',
      icon: <BedDouble size={18}/>,
      label: 'Rooms' },
    { path: '/admin/menu',
      icon: <UtensilsCrossed size={18}/>,
      label: 'Menu' },
  ];

  if (role === 'RECEPTIONIST') return [
    { path: '/receptionist/dashboard',
      icon: <LayoutDashboard size={18}/>,
      label: 'Dashboard' },
    { path: '/receptionist/checkin',
      icon: <UserPlus size={18}/>,
      label: 'Check In' },
    { path: '/receptionist/guests',
      icon: <Users size={18}/>,
      label: 'Guests' },
    { path: '/receptionist/rooms',
      icon: <BedDouble size={18}/>,
      label: 'Rooms' },
    { path: '/receptionist/services',
      icon: <Bell size={18}/>,
      label: 'Services' },
    { path: '/receptionist/bills',
      icon: <Receipt size={18}/>,
      label: 'Bills' },
  ];

  if (role === 'KITCHEN_STAFF') return [
    { path: '/kitchen/dashboard',
      icon: <ChefHat size={18}/>,
      label: 'Order Queue' },
    { path: '/kitchen/history',
      icon: <ClipboardList size={18}/>,
      label: 'History' },
  ];

  return [];
};

const StaffLayout = ({ children }) => {
  const { logout } = useAuthStore();

  const user = JSON.parse(
    localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    window.location.href = '/login';
  };

  const navItems = getNavItems(user?.role);

  return (
    <div style={{ display: 'flex',
                  minHeight: '100vh',
                  background: '#f8f9fa' }}>

      {/* Sidebar */}
      <div style={{
        width: '220px',
        flexShrink: 0,
        background: '#1a1a2e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>

        {/* Logo */}
        <div style={{
          padding: '24px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '22px',
                        fontWeight: 800,
                        color: '#f0a500' }}>
            Urban
          </div>
          <div style={{ fontSize: '12px',
                        fontWeight: 800,
                        color: '#f0a500',
                        letterSpacing: '4px' }}>
            INN
          </div>
          <div style={{
            fontSize: '11px',
            marginTop: '4px',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {user?.role?.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1,
                      padding: '12px 0',
                      overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 20px',
                color: isActive
                  ? '#f0a500'
                  : 'rgba(255,255,255,0.6)',
                background: isActive
                  ? 'rgba(240,165,0,0.1)'
                  : 'transparent',
                borderLeft: isActive
                  ? '3px solid #f0a500'
                  : '3px solid transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
                cursor: 'pointer'
              })}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 600,
            marginBottom: '2px'
          }}>
            {user?.name}
          </div>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '12px'
          }}>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '13px',
              padding: 0
            }}>
            <LogOut size={15}/>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflowX: 'hidden'
      }}>

        {/* Topbar */}
        <div style={{
          background: '#fff',
          padding: '12px 20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <span style={{ fontWeight: 700,
                         fontSize: '16px',
                         color: '#1a1a2e' }}>
            UrbanInn
          </span>
          <div style={{ display: 'flex',
                        alignItems: 'center',
                        gap: '8px' }}>
            <span style={{
              background: '#fff8e7',
              color: '#f0a500',
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              {user?.role?.replace(/_/g, ' ')}
            </span>
            {user?.hotelId && (
              <span style={{
                background: '#f8f9fa',
                color: '#6c757d',
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 500
              }}>
                Hotel #{user?.hotelId}
              </span>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div style={{
          padding: '24px 20px',
          flex: 1
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;