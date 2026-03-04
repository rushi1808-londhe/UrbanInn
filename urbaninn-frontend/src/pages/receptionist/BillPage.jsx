import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import StaffLayout from '../../layouts/StaffLayout';
import toast from 'react-hot-toast';
import { formatDateTime, formatDate } from '../../utils/helpers';
import { Receipt, X } from 'lucide-react';

const BillPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    try {
      const res = await axiosInstance.get(
        '/receptionist/bills');
      setBills(res.data.data || []);
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const filtered = bills.filter(b =>
    b.guestName?.toLowerCase()
      .includes(search.toLowerCase()) ||
    b.roomNumber?.includes(search) ||
    b.phoneNumber?.includes(search)
  );

  return (
    <StaffLayout>
      <div className="d-flex justify-content-between
        align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Guest Bills</h4>
          <p className="text-muted mb-0"
            style={{ fontSize: '14px' }}>
            {bills.length} bills generated
          </p>
        </div>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, room, phone..."
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
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Nights</th>
                  <th>Room</th>
                  <th>Food</th>
                  <th>Total</th>
                  <th>Bill</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9}
                      className="text-center text-muted py-5">
                      <Receipt size={40}
                        style={{ opacity: 0.3,
                                 display: 'block',
                                 margin: '0 auto 8px' }}/>
                      No bills yet
                    </td>
                  </tr>
                ) : filtered.map(bill => (
                  <tr key={bill.id}>
                    <td>
                      <div className="fw-semibold">
                        {bill.guestName}
                      </div>
                      <div className="text-muted"
                        style={{ fontSize: '12px' }}>
                        {bill.phoneNumber}
                      </div>
                    </td>
                    <td className="fw-semibold">
                      {bill.roomNumber}
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {formatDate(bill.checkInDate)}
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {formatDate(bill.checkOutDate)}
                    </td>
                    <td className="text-center">
                      {bill.numberOfNights}
                    </td>
                    <td style={{ color: '#0d6efd',
                                 fontWeight: 600 }}>
                      ₹{bill.roomCharges}
                    </td>
                    <td style={{ color: '#198754',
                                 fontWeight: 600 }}>
                      ₹{bill.foodCharges}
                    </td>
                    <td style={{ color: '#f0a500',
                                 fontWeight: 700,
                                 fontSize: '15px' }}>
                      ₹{bill.totalAmount}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="btn btn-sm"
                        style={{ background: '#fff8e7',
                                 color: '#f0a500',
                                 border: 'none',
                                 borderRadius: '8px' }}>
                        <Receipt size={14} className="me-1"/>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {selectedBill && (
        <BillModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </StaffLayout>
  );
};

const BillModal = ({ bill, onClose }) => {
  return (
    <div className="modal show d-block"
      style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered
        modal-dialog-scrollable modal-lg">
        <div className="modal-content"
          style={{ borderRadius: '16px', border: 'none' }}>
          <div className="modal-body p-0">

            {/* Bill Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              borderRadius: '16px 16px 0 0',
              padding: '24px'
            }}>
              <div className="d-flex justify-content-between
                align-items-start">
                <div>
                  <div style={{ color: '#f0a500',
                                fontSize: '24px',
                                fontWeight: 800 }}>
                    UrbanInn
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)',
                                fontSize: '13px' }}>
                    {bill.hotelName}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)',
                                fontSize: '12px',
                                marginTop: '4px' }}>
                    Bill #{bill.id} •{' '}
                    Generated {formatDateTime(bill.generatedAt)}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="btn btn-sm"
                  style={{ background: 'rgba(255,255,255,0.1)',
                           border: 'none', color: '#fff',
                           borderRadius: '8px' }}>
                  <X size={16}/>
                </button>
              </div>

              {/* Guest Info */}
              <div className="row mt-4 g-3">
                {[
                  { label: 'Guest', value: bill.guestName },
                  { label: 'Phone', value: bill.phoneNumber },
                  { label: 'Room',
                    value: `${bill.roomNumber} (${bill.roomType})` },
                  { label: 'ID',
                    value: `${bill.idType}: ${bill.idProof}` },
                  { label: 'Check-In',
                    value: formatDateTime(bill.checkInDate) },
                  { label: 'Check-Out',
                    value: formatDateTime(bill.checkOutDate) },
                ].map((item, i) => (
                  <div key={i} className="col-6 col-md-4">
                    <div style={{ color: 'rgba(255,255,255,0.5)',
                                  fontSize: '11px' }}>
                      {item.label}
                    </div>
                    <div style={{ color: '#fff',
                                  fontSize: '13px',
                                  fontWeight: 600 }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4">

              {/* Room Charges */}
              <h6 className="fw-bold mb-3"
                style={{ color: '#1a1a2e' }}>
                🛏️ Room Charges
              </h6>
              <div className="table-responsive mb-4">
                <table className="table table-sm mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th>Room</th>
                      <th>Type</th>
                      <th>Rate/Night</th>
                      <th>Nights</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{bill.roomNumber}</td>
                      <td>{bill.roomType}</td>
                      <td>₹{bill.pricePerNight}</td>
                      <td>{bill.numberOfNights}</td>
                      <td className="text-end fw-bold"
                        style={{ color: '#0d6efd' }}>
                        ₹{bill.roomCharges}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Food Orders */}
              {bill.foodOrders?.length > 0 && (
                <>
                  <h6 className="fw-bold mb-3"
                    style={{ color: '#1a1a2e' }}>
                    🍽️ Food Orders
                  </h6>
                  <div className="table-responsive mb-4">
                    <table className="table table-sm mb-0">
                      <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                          <th>Order #</th>
                          <th>Items</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.foodOrders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td style={{ fontSize: '12px' }}>
                              {order.items?.map(i =>
                                `${i.menuItemName} ×${i.quantity}`
                              ).join(', ')}
                            </td>
                            <td style={{ fontSize: '12px' }}>
                              {formatDateTime(order.placedAt)}
                            </td>
                            <td>
                              <span className="badge"
                                style={{
                                  fontSize: '10px',
                                  background: order.status ===
                                    'DELIVERED'
                                    ? '#e8f5ee' : '#fee2e2',
                                  color: order.status ===
                                    'DELIVERED'
                                    ? '#198754' : '#dc3545',
                                  borderRadius: '20px',
                                  padding: '3px 8px'
                                }}>
                                {order.status}
                              </span>
                            </td>
                            <td className="text-end fw-bold"
                              style={{ color: '#198754' }}>
                              ₹{order.totalAmount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Services */}
              {bill.services?.length > 0 && (
                <>
                  <h6 className="fw-bold mb-3"
                    style={{ color: '#1a1a2e' }}>
                    🔔 Services Used
                  </h6>
                  <div className="table-responsive mb-4">
                    <table className="table table-sm mb-0">
                      <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                          <th>Service</th>
                          <th>Requested</th>
                          <th>Completed</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.services.map(s => (
                          <tr key={s.id}>
                            <td style={{ fontSize: '13px' }}>
                              {s.serviceType?.replace(/_/g, ' ')}
                            </td>
                            <td style={{ fontSize: '12px' }}>
                              {formatDateTime(s.requestedAt)}
                            </td>
                            <td style={{ fontSize: '12px' }}>
                              {s.completedAt
                                ? formatDateTime(s.completedAt)
                                : '—'}
                            </td>
                            <td>
                              <span className="badge"
                                style={{
                                  fontSize: '10px',
                                  background: s.status ===
                                    'COMPLETED'
                                    ? '#e8f5ee' : '#fff8e7',
                                  color: s.status ===
                                    'COMPLETED'
                                    ? '#198754' : '#f0a500',
                                  borderRadius: '20px',
                                  padding: '3px 8px'
                                }}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Total Summary */}
              <div className="p-3 rounded"
                style={{ background: '#f8f9fa',
                         borderRadius: '12px' }}>
                <div className="d-flex justify-content-between
                  mb-2">
                  <span className="text-muted">Room Charges</span>
                  <span className="fw-semibold">
                    ₹{bill.roomCharges}
                  </span>
                </div>
                <div className="d-flex justify-content-between
                  mb-2">
                  <span className="text-muted">Food Charges</span>
                  <span className="fw-semibold">
                    ₹{bill.foodCharges}
                  </span>
                </div>
                <hr/>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold"
                    style={{ fontSize: '18px' }}>
                    Total Amount
                  </span>
                  <span className="fw-bold"
                    style={{ fontSize: '22px',
                             color: '#f0a500' }}>
                    ₹{bill.totalAmount}
                  </span>
                </div>
              </div>

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="btn w-100 fw-semibold mt-3"
                style={{ background: '#1a1a2e', color: '#fff',
                         border: 'none', borderRadius: '12px',
                         padding: '12px' }}>
                🖨️ Print Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPage;