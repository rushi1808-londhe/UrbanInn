import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import GuestLayout from '../../layouts/GuestLayout';
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const statusColor = {
  PLACED:    { bg: '#dbeafe', color: '#1e40af' },
  CONFIRMED: { bg: '#e0e7ff', color: '#3730a3' },
  PREPARING: { bg: '#fef3c7', color: '#92400e' },
  READY:     { bg: '#d1fae5', color: '#065f46',
               pulse: true },
  DELIVERED: { bg: '#d1d5db', color: '#374151' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
};

const statusSteps = ['PLACED', 'CONFIRMED',
                     'PREPARING', 'READY', 'DELIVERED'];

const GuestOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/guest/orders');
      setOrders(res.data.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await axiosInstance.patch(
        `/guest/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message ||
        'Cannot cancel order');
    }
  };

  if (loading) return (
    <GuestLayout title="My Orders">
      <div className="text-center py-5">
        <div className="spinner-border"
          style={{ color: '#f0a500' }}/>
      </div>
    </GuestLayout>
  );

  return (
    <GuestLayout title="My Orders">
      {orders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <ShoppingBag size={56}
            style={{ opacity: 0.2, display: 'block',
                     margin: '0 auto 12px' }}/>
          <h6>No orders yet</h6>
          <p style={{ fontSize: '13px' }}>
            Browse our menu and place your first order!
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map(order => {
            const sc = statusColor[order.status];
            const stepIndex = statusSteps.indexOf(order.status);

            return (
              <div key={order.id}
                className="card border-0 shadow-sm"
                style={{ borderRadius: '16px' }}>
                <div className="card-body p-3">
                  {/* Order Header */}
                  <div className="d-flex justify-content-between
                    align-items-center mb-3">
                    <div>
                      <span className="fw-bold"
                        style={{ fontSize: '15px' }}>
                        Order #{order.id}
                      </span>
                      <div className="text-muted"
                        style={{ fontSize: '12px' }}>
                        {formatDateTime(order.placedAt)}
                      </div>
                    </div>
                    <span className="badge fw-bold"
                      style={{
                        background: sc?.bg,
                        color: sc?.color,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                      }}>
                      {order.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {order.status !== 'CANCELLED' && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between
                        mb-1">
                        {statusSteps.map((step, i) => (
                          <div key={step}
                            className="text-center"
                            style={{ flex: 1 }}>
                            <div style={{
                              width: '24px', height: '24px',
                              borderRadius: '50%',
                              margin: '0 auto 2px',
                              background: i <= stepIndex
                                ? '#f0a500' : '#dee2e6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: i <= stepIndex
                                ? '#000' : '#aaa',
                              fontWeight: 700,
                              transition: 'all 0.3s'
                            }}>
                              {i < stepIndex ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: '9px',
                                          color: i <= stepIndex
                                            ? '#f0a500' : '#aaa' }}>
                              {step}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="progress"
                        style={{ height: '4px',
                                 borderRadius: '10px' }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${(stepIndex /
                              (statusSteps.length - 1)) * 100}%`,
                            background: '#f0a500',
                            borderRadius: '10px',
                            transition: 'width 0.5s'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ borderTop: '1px solid #f0f0f0',
                                paddingTop: '10px' }}>
                    {order.items?.map((item, i) => (
                      <div key={i}
                        className="d-flex justify-content-between
                          mb-1">
                        <span style={{ fontSize: '13px' }}>
                          {item.menuItemName}
                          <span className="text-muted ms-1">
                            ×{item.quantity}
                          </span>
                        </span>
                        <span style={{ fontSize: '13px',
                                       fontWeight: 600,
                                       color: '#f0a500' }}>
                          ₹{item.subtotal}
                        </span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between
                      mt-2 pt-2"
                      style={{ borderTop: '1px dashed #dee2e6' }}>
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold"
                        style={{ color: '#f0a500' }}>
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Cancel */}
                  {order.status === 'PLACED' && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="btn btn-sm w-100 mt-3"
                      style={{ background: '#fee2e2',
                               color: '#dc3545',
                               border: 'none',
                               borderRadius: '10px',
                               fontSize: '13px' }}>
                      Cancel Order
                    </button>
                  )}

                  {/* Ready notification */}
                  {order.status === 'READY' && (
                    <div className="mt-3 p-2 rounded text-center
                      fw-bold"
                      style={{ background: '#d1fae5',
                               color: '#065f46',
                               fontSize: '13px',
                               animation: 'pulse 1s infinite' }}>
                      🎉 Your order is ready for delivery!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GuestLayout>
  );
};

export default GuestOrdersPage;