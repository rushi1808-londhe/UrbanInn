import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';

// ── Auth Pages ──
import StaffLoginPage from './pages/auth/StaffLoginPage';
import GuestOtpPage from './pages/auth/GuestOtpPage';

// ── SuperAdmin Pages ──
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import HotelsPage from './pages/superadmin/HotelsPage';
import StaffPage from './pages/superadmin/StaffPage';

// ── Hotel Admin Pages ──
import AdminDashboard from './pages/admin/AdminDashboard';
import RoomsPage from './pages/admin/RoomsPage';
import MenuPage from './pages/admin/MenuPage';

// ── Receptionist Pages ──
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import CheckInPage from './pages/receptionist/CheckInPage';
import GuestsPage from './pages/receptionist/GuestsPage';
import ReceptionistRoomsPage from './pages/receptionist/ReceptionistRoomsPage';
import ServicesPage from './pages/receptionist/ServicesPage';

// ── Kitchen Pages ──
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import KitchenHistory from './pages/kitchen/KitchenHistory';

// ── Guest Pages ──
import GuestHome from './pages/guest/GuestHome';
import GuestMenuPage from './pages/guest/GuestMenuPage';
import GuestOrdersPage from './pages/guest/GuestOrdersPage';
import GuestServicesPage from './pages/guest/GuestServicesPage';
import GuestProfilePage from './pages/guest/GuestProfilePage';
import BillPage from './pages/receptionist/BillPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px' }
        }}
      />
      <Routes>

        {/* ── Default redirect ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Auth Routes ── */}
        <Route path="/login" element={<StaffLoginPage />} />
        <Route path="/guest/login" element={<GuestOtpPage />} />

        {/* ── Super Admin Routes ── */}
        <Route path="/superadmin/dashboard" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/hotels" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <HotelsPage />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/staff" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <StaffPage />
          </ProtectedRoute>
        } />

        {/* ── Hotel Admin Routes ── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['HOTEL_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/rooms" element={
          <ProtectedRoute allowedRoles={['HOTEL_ADMIN']}>
            <RoomsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute allowedRoles={['HOTEL_ADMIN']}>
            <MenuPage />
          </ProtectedRoute>
        } />

        {/* ── Receptionist Routes ── */}
        <Route path="/receptionist/dashboard" element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/checkin" element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <CheckInPage />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/guests" element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <GuestsPage />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/rooms" element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistRoomsPage />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/services" element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ServicesPage />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/bills" element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <BillPage />
          </ProtectedRoute>
        } />

        {/* ── Kitchen Routes ── */}
        <Route path="/kitchen/dashboard" element={
          <ProtectedRoute allowedRoles={['KITCHEN_STAFF']}>
            <KitchenDashboard />
          </ProtectedRoute>
        } />
        <Route path="/kitchen/history" element={
          <ProtectedRoute allowedRoles={['KITCHEN_STAFF']}>
            <KitchenHistory />
          </ProtectedRoute>
        } />

        {/* ── Guest Routes ── */}
        <Route path="/guest/home" element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <GuestHome />
          </ProtectedRoute>
        } />
        <Route path="/guest/menu" element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <GuestMenuPage />
          </ProtectedRoute>
        } />
        <Route path="/guest/orders" element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <GuestOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/guest/services" element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <GuestServicesPage />
          </ProtectedRoute>
        } />
        <Route path="/guest/profile" element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <GuestProfilePage />
          </ProtectedRoute>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
