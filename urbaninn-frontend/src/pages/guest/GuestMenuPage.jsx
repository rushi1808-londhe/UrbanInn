import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import GuestLayout from '../../layouts/GuestLayout';
import toast from 'react-hot-toast';
import { ShoppingBag, Plus, Minus,
         UtensilsCrossed } from 'lucide-react';

const GuestMenuPage = () => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [instructions, setInstructions] = useState('');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const res = await axiosInstance.get('/guest/menu');
      setMenu(res.data.data || []);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }));
    toast.success(`${item.name} added!`,
      { duration: 800, icon: '🛒' });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId]?.quantity > 1) {
        updated[itemId] = {
          ...updated[itemId],
          quantity: updated[itemId].quantity - 1
        };
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Add items to cart first');
      return;
    }
    setPlacing(true);
    try {
      await axiosInstance.post('/guest/orders', {
        items: cartItems.map(i => ({
          menuItemId: i.id,
          quantity: i.quantity
        })),
        specialInstructions: instructions
      });
      toast.success('Order placed successfully!');
      setCart({});
      setInstructions('');
      setShowCart(false);
      navigate('/guest/orders');
    } catch (err) {
      toast.error(err.response?.data?.message ||
        'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const categories = ['ALL',
    ...new Set(menu.map(i => i.category))];

  const filtered = categoryFilter === 'ALL'
    ? menu
    : menu.filter(i => i.category === categoryFilter);

  return (
    <GuestLayout title="Menu">

      {/* Category Filter */}
      <div
        className="d-flex gap-2 mb-3 pb-1"
        style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className="btn btn-sm"
            style={{
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              border: categoryFilter === cat
                ? '2px solid #f0a500' : '1px solid #dee2e6',
              background: categoryFilter === cat
                ? '#f0a500' : '#fff',
              color: categoryFilter === cat
                ? '#000' : '#6c757d',
              fontWeight: categoryFilter === cat ? 600 : 400,
              fontSize: '12px', padding: '6px 14px'
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"
            style={{ color: '#f0a500' }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <UtensilsCrossed size={48}
            style={{ opacity: 0.2, display: 'block',
                     margin: '0 auto 12px' }}/>
          <p>No items in this category</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-5"
          style={{ paddingBottom: cartCount > 0
            ? '140px' : '20px' }}>
          {filtered.map(item => (
            <div key={item.id}
              className="card border-0 shadow-sm"
              style={{ borderRadius: '14px',
                       overflow: 'hidden' }}>
              <div className="d-flex">

                {/* Image */}
                {item.imageUrl ? (
                  <img
                    src={`http://localhost:8080${item.imageUrl}`}
                    alt={item.name}
                    style={{ width: '110px',
                             minHeight: '110px',
                             objectFit: 'cover',
                             flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: '110px', minHeight: '110px',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <UtensilsCrossed size={28}
                      style={{ opacity: 0.2 }}/>
                  </div>
                )}

                {/* Content */}
                <div className="p-3 flex-fill d-flex
                  flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center
                      gap-2 mb-1">
                      {item.vegetarian && (
                        <span style={{
                          width: '16px', height: '16px',
                          borderRadius: '3px',
                          border: '2px solid #198754',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          color: '#198754',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>V</span>
                      )}
                      <span className="fw-bold"
                        style={{ fontSize: '15px' }}>
                        {item.name}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-muted mb-2"
                        style={{ fontSize: '12px',
                                 lineHeight: '1.4',
                                 margin: 0 }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="d-flex justify-content-between
                    align-items-center mt-2">
                    <span className="fw-bold"
                      style={{ color: '#f0a500',
                               fontSize: '16px' }}>
                      ₹{item.price}
                    </span>

                    {/* Add/Remove */}
                    {cart[item.id] ? (
                      <div className="d-flex align-items-center
                        gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="btn btn-sm"
                          style={{ width: '32px', height: '32px',
                                   borderRadius: '50%',
                                   background: '#fee2e2',
                                   color: '#dc3545',
                                   border: 'none', padding: 0,
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center' }}>
                          <Minus size={14}/>
                        </button>
                        <span className="fw-bold"
                          style={{ minWidth: '20px',
                                   textAlign: 'center',
                                   fontSize: '16px' }}>
                          {cart[item.id].quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="btn btn-sm"
                          style={{ width: '32px', height: '32px',
                                   borderRadius: '50%',
                                   background: '#f0a500',
                                   color: '#000',
                                   border: 'none', padding: 0,
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center' }}>
                          <Plus size={14}/>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="btn btn-sm fw-semibold"
                        style={{ background: '#f0a500',
                                 color: '#000', border: 'none',
                                 borderRadius: '10px',
                                 padding: '7px 16px',
                                 fontSize: '13px' }}>
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Summary Bottom Sheet */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed', bottom: '70px',
          left: '0', right: '0',
          padding: '12px 16px', zIndex: 500
        }}>
          {/* Cart Details */}
          {showCart && (
            <div className="card border-0 shadow-lg mb-2"
              style={{ borderRadius: '16px',
                       background: '#fff' }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between
                  align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Your Cart</h6>
                  <button
                    onClick={() => setShowCart(false)}
                    className="btn btn-sm"
                    style={{ background: '#f8f9fa',
                             border: 'none',
                             borderRadius: '8px' }}>
                    ✕
                  </button>
                </div>

                {/* Cart Items */}
                {cartItems.map(item => (
                  <div key={item.id}
                    className="d-flex justify-content-between
                      align-items-center mb-2">
                    <span style={{ fontSize: '13px' }}>
                      {item.name}
                    </span>
                    <div className="d-flex align-items-center
                      gap-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-sm"
                        style={{ width: '24px', height: '24px',
                                 borderRadius: '50%',
                                 background: '#fee2e2',
                                 color: '#dc3545',
                                 border: 'none', padding: 0,
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center' }}>
                        <Minus size={10}/>
                      </button>
                      <span className="fw-bold"
                        style={{ fontSize: '13px',
                                 minWidth: '16px',
                                 textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="btn btn-sm"
                        style={{ width: '24px', height: '24px',
                                 borderRadius: '50%',
                                 background: '#f0a500',
                                 color: '#000',
                                 border: 'none', padding: 0,
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center' }}>
                        <Plus size={10}/>
                      </button>
                      <span style={{ fontSize: '13px',
                                     fontWeight: 600,
                                     color: '#f0a500',
                                     minWidth: '50px',
                                     textAlign: 'right' }}>
                        ₹{(item.price *
                          item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}

                <hr/>
                <div className="d-flex justify-content-between
                  fw-bold mb-3">
                  <span>Total</span>
                  <span style={{ color: '#f0a500' }}>
                    ₹{cartTotal.toFixed(0)}
                  </span>
                </div>

                {/* Special Instructions */}
                <textarea
                  className="form-control mb-3"
                  rows={2}
                  placeholder="Special instructions (optional)"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  style={{ borderRadius: '10px',
                           fontSize: '13px',
                           resize: 'none' }}
                />

                {/* Place Order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="btn w-100 fw-bold"
                  style={{ background: '#f0a500', color: '#000',
                           borderRadius: '12px',
                           padding: '12px', fontSize: '15px',
                           border: 'none' }}>
                  {placing ? (
                    <span className="spinner-border
                      spinner-border-sm me-2"/>
                  ) : (
                    <ShoppingBag size={16} className="me-2"/>
                  )}
                  Place Order • ₹{cartTotal.toFixed(0)}
                </button>
              </div>
            </div>
          )}

          {/* Cart Bar */}
          <button
            onClick={() => setShowCart(!showCart)}
            className="btn w-100 fw-bold"
            style={{ background: '#1a1a2e', color: '#fff',
                     borderRadius: '14px',
                     padding: '14px', fontSize: '15px',
                     border: 'none',
                     boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div className="d-flex justify-content-between
              align-items-center">
              <span style={{ background: '#f0a500',
                             color: '#000',
                             borderRadius: '20px',
                             padding: '2px 10px',
                             fontSize: '13px',
                             fontWeight: 700 }}>
                {cartCount} items
              </span>
              <span>
                <ShoppingBag size={16} className="me-2"/>
                View Cart
              </span>
              <span style={{ color: '#f0a500',
                             fontWeight: 700 }}>
                ₹{cartTotal.toFixed(0)}
              </span>
            </div>
          </button>
        </div>
      )}
    </GuestLayout>
  );
};

export default GuestMenuPage;