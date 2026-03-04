import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../utils/helpers';
import { ClipboardList } from 'lucide-react';

const statusColor = {
  PLACED:    { bg: '#dbeafe', color: '#1e40af' },
  CONFIRMED: { bg: '#e0e7ff', color: '#3730a3' },
  PREPARING: { bg: '#fef3c7', color: '#92400e' },
  READY:     { bg: '#d1fae5', color: '#065f46' },
  DELIVERED: { bg: '#d1d5db', color: '#374151' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
};

const KitchenHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/kitchen/orders/all');
      setOrders(res.data.data || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o =>
    o.guestName?.toLowerCase().includes(search.toLowerCase()) ||
    o.roomNumber?.includes(search) ||
    String(o.id).includes(search)
  );

  const delivered = orders.filter(
    o => o.status === 'DELIVERED').length;
  const cancelled = orders.filter(
    o => o.status === 'CANCELLED').length;
  const revenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <StaffLayout>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Order History</h4>
        <p className="text-muted mb-0"
          style={{ fontSize: '14px' }}>
          All orders for today
        </p>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Orders', value: orders.length,
            color: '#1a1a2e', bg: '#f8f9fa' },
          { label: 'Delivered', value: delivered,
            color: '#198754', bg: '#e8f5ee' },
          { label: 'Cancelled', value: cancelled,
            color: '#dc3545', bg: '#fee2e2' },
          { label: 'Revenue', value: `₹${revenue}`,
            color: '#f0a500', bg: '#fff8e7' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="stat-card text-center"
              style={{ background: s.bg }}>
              <div style={{ fontSize: '24px',
                            fontWeight: 700,
                            color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: '13px',
                            color: '#6c757d',
                            marginTop: '4px' }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by order ID, guest, room..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px', borderRadius: '10px',
                   padding: '9px 14px' }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guest / Room</th>
                  <th className="hide-mobile">Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="hide-mobile">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}
                      className="text-center text-muted py-5">
                      <ClipboardList size={40}
                        style={{ opacity: 0.3,
                                 display: 'block',
                                 margin: '0 auto 8px' }}/>
                      No orders found
                    </td>
                  </tr>
                ) : filtered.map(order => (
                  <tr key={order.id}>
                    <td className="fw-bold"
                      style={{ color: '#f0a500' }}>
                      #{order.id}
                    </td>
                    <td>
                      <div className="fw-semibold"
                        style={{ fontSize: '14px' }}>
                        {order.guestName}
                      </div>
                      <div className="text-muted"
                        style={{ fontSize: '12px' }}>
                        Room {order.roomNumber}
                      </div>
                    </td>
                    <td className="hide-mobile"
                      style={{ fontSize: '13px' }}>
                      {order.items?.map(i =>
                        `${i.menuItemName} ×${i.quantity}`
                      ).join(', ')}
                    </td>
                    <td className="fw-semibold"
                      style={{ color: '#f0a500' }}>
                      ₹{order.totalAmount}
                    </td>
                    <td>
                      <span className="badge"
                        style={{
                          background: statusColor[
                            order.status]?.bg,
                          color: statusColor[
                            order.status]?.color,
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '11px'
                        }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="hide-mobile text-muted"
                      style={{ fontSize: '12px' }}>
                      {formatDateTime(order.placedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default KitchenHistory;