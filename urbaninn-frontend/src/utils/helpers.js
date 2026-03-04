// ── Role to dashboard route mapping ──
// utils/helpers.js
export const getRoleDashboard = (role) => {
    switch (role) {
        case 'SUPER_ADMIN':
            return '/superadmin/dashboard';
        case 'HOTEL_ADMIN':
            return '/admin/dashboard';
        case 'RECEPTIONIST':
            return '/receptionist/dashboard';
        case 'KITCHEN_STAFF':
            return '/kitchen/dashboard';
        case 'GUEST':
            return '/guest/home';
        default:
            return '/login';
    }
};

// ── Format date ──
export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

// ── Format date time ──
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit'
    });
};

// ── Format currency ──
export const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
};

// ── Room status badge class ──
export const getRoomStatusBadge = (status) => {
    const map = {
        AVAILABLE: 'badge-available',
        OCCUPIED: 'badge-occupied',
        CLEANING: 'badge-cleaning',
        MAINTENANCE: 'badge-maintenance',
        RESERVED: 'badge-reserved',
    };
    return map[status] || 'badge-secondary';
};

// ── Order status badge class ──
export const getOrderStatusBadge = (status) => {
    const map = {
        PLACED: 'badge-placed',
        CONFIRMED: 'badge-confirmed',
        PREPARING: 'badge-preparing',
        READY: 'badge-ready',
        DELIVERED: 'badge-delivered',
        CANCELLED: 'badge-cancelled',
    };
    return map[status] || 'badge-secondary';
};