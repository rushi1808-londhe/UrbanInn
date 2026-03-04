import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { ChefHat } from 'lucide-react';
import { formatDateTime, getOrderStatusBadge } from '../../utils/helpers';

const ORDER_STATUSES = ['PLACED', 'CONFIRMED',
                        'PREPARING', 'READY'];

const statusColor = {
  PLACED:    { bg: '#dbeafe', color: '#1e40af' },
  CONFIRMED: { bg: '#e0e7ff', color: '#3730a3' },
  PREPARING: { bg: '#fef3c7', color: '#92400e' },
  READY:     { bg: '#d1fae5', color: '#065f46' },
  DELIVERED: { bg: '#d1d5db', color: '#374151' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
};

const nextStatus = {
  PLACED:    'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY:     'DELIVERED',
};

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
    // auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/kitchen/orders');
      setOrders(res.data.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await axiosInstance.patch(
        `/kitchen/orders/${orderId}/status?status=${newStatus}`);
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter);

  const counts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <StaffLayout>
      {/* Header */}
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Kitchen Order Queue</h4>
          <p className="text-muted mb-0"
            style={{ fontSize: '14px' }}>
            {orders.length} active orders
            <span className="ms-2 text-muted"
              style={{ fontSize: '12px' }}>
              (auto-refreshes every 30s)
            </span>
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn btn-outline-secondary btn-sm"
          style={{ borderRadius: '10px' }}>
          Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter('ALL')}
          className="btn btn-sm"
          style={{
            borderRadius: '20px',
            border: filter === 'ALL'
              ? '2px solid #f0a500' : '1px solid #dee2e6',
            background: filter === 'ALL' ? '#fff8e7' : '#fff',
            color: filter === 'ALL' ? '#f0a500' : '#6c757d',
            fontWeight: filter === 'ALL' ? 600 : 400,
            fontSize: '13px', padding: '6px 16px'
          }}>
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="btn btn-sm"
            style={{
              borderRadius: '20px',
              border: filter === s
                ? `2px solid ${statusColor[s].color}`
                : '1px solid #dee2e6',
              background: filter === s
                ? statusColor[s].bg : '#fff',
              color: filter === s
                ? statusColor[s].color : '#6c757d',
              fontWeight: filter === s ? 600 : 400,
              fontSize: '13px', padding: '6px 16px'
            }}>
            {s} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <ChefHat size={56}
            style={{ opacity: 0.2, display: 'block',
                     margin: '0 auto 12px' }}/>
          <h6>No orders in queue</h6>
          <p style={{ fontSize: '13px' }}>
            New orders will appear here automatically
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(order => (
            <div key={order.id}
              className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm"
                style={{
                  borderRadius: '14px',
                  borderLeft: `4px solid ${statusColor[order.status]?.color}`,
                  overflow: 'hidden'
                }}>
                <div className="card-body p-3">
                  {/* Order Header */}
                  <div className="d-flex justify-content-between
                    align-items-start mb-3">
                    <div>
                      <div className="fw-bold"
                        style={{ fontSize: '16px' }}>
                        Order #{order.id}
                      </div>
                      <div className="text-muted"
                        style={{ fontSize: '12px' }}>
                        Room {order.roomNumber} •{' '}
                        {order.guestName}
                      </div>
                      <div className="text-muted"
                        style={{ fontSize: '11px' }}>
                        {formatDateTime(order.placedAt)}
                      </div>
                    </div>
                    <span className="badge"
                      style={{
                        background: statusColor[order.status]?.bg,
                        color: statusColor[order.status]?.color,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px', fontWeight: 700
                      }}>
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="mb-3"
                    style={{ borderTop: '1px solid #f0f0f0',
                             paddingTop: '12px' }}>
                    {order.items?.map((item, i) => (
                      <div key={i}
                        className="d-flex justify-content-between
                          align-items-center mb-1">
                        <span style={{ fontSize: '13px' }}>
                          {item.menuItemName}
                        </span>
                        <div className="d-flex align-items-center
                          gap-2">
                          <span className="badge"
                            style={{ background: '#f0f0f0',
                                     color: '#333',
                                     borderRadius: '20px',
                                     fontSize: '12px' }}>
                            ×{item.quantity}
                          </span>
                          <span style={{ fontSize: '12px',
                                         color: '#f0a500',
                                         fontWeight: 600 }}>
                            ₹{item.subtotal}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="mb-3 p-2 rounded"
                      style={{ background: '#fff8e7',
                               fontSize: '12px',
                               color: '#856404' }}>
                      📝 {order.specialInstructions}
                    </div>
                  )}

                  {/* Total */}
                  <div className="d-flex justify-content-between
                    align-items-center mb-3">
                    <span className="fw-semibold"
                      style={{ fontSize: '13px' }}>
                      Total
                    </span>
                    <span className="fw-bold"
                      style={{ color: '#f0a500',
                               fontSize: '16px' }}>
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2">
                    {nextStatus[order.status] && (
                      <button
                        onClick={() => handleStatusUpdate(
                          order.id, nextStatus[order.status])}
                        disabled={updating === order.id}
                        className="btn fw-semibold flex-fill"
                        style={{
                          background: statusColor[
                            nextStatus[order.status]]?.bg,
                          color: statusColor[
                            nextStatus[order.status]]?.color,
                          border: `1px solid ${statusColor[
                            nextStatus[order.status]]?.color}`,
                          borderRadius: '10px',
                          fontSize: '13px'
                        }}>
                        {updating === order.id ? (
                          <span className="spinner-border
                            spinner-border-sm"/>
                        ) : (
                          `Mark ${nextStatus[order.status]}`
                        )}
                      </button>
                    )}
                    {order.status === 'PLACED' && (
                      <button
                        onClick={() => handleStatusUpdate(
                          order.id, 'CANCELLED')}
                        disabled={updating === order.id}
                        className="btn btn-sm"
                        style={{ background: '#fee2e2',
                                 color: '#dc3545',
                                 border: 'none',
                                 borderRadius: '10px' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
};

export default KitchenDashboard;