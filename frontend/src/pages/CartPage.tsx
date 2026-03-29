import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, Loader2, MapPin, X, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─── Paytm Demo Modal ─────────────────────────────────────────── */
function PaytmModal({ total, onSuccess, onClose }) {
  const [step, setStep] = useState('options'); // 'options' | 'upi' | 'card' | 'processing' | 'done'
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiError, setUpiError] = useState('');

  const simulatePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => onSuccess(), 1800);
    }, 2800);
  };

  const handleUpiPay = () => {
    if (!upiId.match(/^[\w.\-+]+@[\w]+$/)) {
      setUpiError('Enter a valid UPI ID (e.g. name@paytm)');
      return;
    }
    setUpiError('');
    simulatePay();
  };

  const handleCardPay = () => {
    if (!cardNum || !cardExp || !cardCvv || !cardName) {
      toast.error('Please fill all card details');
      return;
    }
    simulatePay();
  };

  const fmtCard = (v) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          margin: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
          overflow: 'hidden',
          fontFamily: "'Segoe UI', sans-serif",
          animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes spin360 {
            to { transform: rotate(360deg); }
          }
          @keyframes checkPop {
            0%   { transform: scale(0); opacity: 0; }
            70%  { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          .paytm-option {
            display: flex; align-items: center; gap: 12px;
            padding: 14px 16px; border: 1.5px solid #e5e7eb;
            border-radius: 10px; cursor: pointer;
            transition: border-color 0.15s, background 0.15s;
            margin-bottom: 10px;
          }
          .paytm-option:hover { border-color: #00BAF2; background: #f0fbff; }
          .paytm-input {
            width: 100%; border: 1.5px solid #d1d5db; border-radius: 8px;
            padding: 10px 12px; font-size: 14px; outline: none;
            transition: border-color 0.15s;
            box-sizing: border-box;
          }
          .paytm-input:focus { border-color: #00BAF2; }
          .paytm-input.error { border-color: #ef4444; }
          .paytm-btn {
            width: 100%; padding: 13px; background: #00BAF2;
            color: #fff; border: none; border-radius: 10px;
            font-size: 15px; font-weight: 600; cursor: pointer;
            transition: background 0.15s, transform 0.1s;
          }
          .paytm-btn:hover { background: #00a8db; }
          .paytm-btn:active { transform: scale(0.98); }
        `}</style>

        {/* Header */}
        <div style={{ background: '#00BAF2', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="28" viewBox="0 0 200 200" fill="none">
              <rect width="200" height="200" rx="40" fill="#fff"/>
              <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontSize="110" fontWeight="900" fill="#00BAF2">P</text>
            </svg>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Paytm</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Secure Checkout</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>₹{total}</div>
            {step !== 'processing' && step !== 'done' && (
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '20px' }}>

          {/* ── Options ── */}
          {step === 'options' && (
            <>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>Choose a payment method</p>
              <div className="paytm-option" onClick={() => setStep('upi')}>
                <div style={{ width: 36, height: 36, background: '#f0fbff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>UPI</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Pay via UPI ID or QR code</div>
                </div>
                <div style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '18px' }}>›</div>
              </div>
              <div className="paytm-option" onClick={() => setStep('card')}>
                <div style={{ width: 36, height: 36, background: '#fff7ed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💳</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Credit / Debit Card</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Visa, Mastercard, RuPay</div>
                </div>
                <div style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '18px' }}>›</div>
              </div>
              <div className="paytm-option" onClick={simulatePay}>
                <div style={{ width: 36, height: 36, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👛</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Paytm Wallet</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Balance: ₹2,400.00</div>
                </div>
                <div style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '18px' }}>›</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'center', color: '#9ca3af', fontSize: '12px' }}>
                <Lock size={11} /> 256-bit SSL Encrypted &nbsp;·&nbsp; <ShieldCheck size={11} /> RBI Compliant
              </div>
            </>
          )}

          {/* ── UPI ── */}
          {step === 'upi' && (
            <>
              <button onClick={() => setStep('options')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00BAF2', fontSize: '13px', marginBottom: '14px', padding: 0 }}>← Back</button>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>Enter UPI ID</p>
              <input
                className={`paytm-input${upiError ? ' error' : ''}`}
                placeholder="yourname@paytm / @upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              {upiError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: 4 }}>{upiError}</p>}
              <button className="paytm-btn" style={{ marginTop: 16 }} onClick={handleUpiPay}>
                Pay ₹{total}
              </button>
              <div style={{ textAlign: 'center', margin: '14px 0', color: '#9ca3af', fontSize: '12px' }}>— or scan QR —</div>
              {/* Fake QR */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ border: '2px solid #e5e7eb', borderRadius: 8, padding: 4 }}>
                  {[...Array(8)].map((_, r) =>
                    [...Array(8)].map((_, c) => {
                      const on = (r + c * 3 + r * c) % 3 !== 0;
                      return on ? <rect key={`${r}${c}`} x={c * 11 + 4} y={r * 11 + 4} width={9} height={9} fill="#1f2937" rx={1} /> : null;
                    })
                  )}
                  <rect x="28" y="28" width="44" height="44" fill="#fff" />
                  <text x="50" y="56" textAnchor="middle" fontSize="20">P</text>
                </svg>
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: 8 }}>Scan with any UPI app</p>
            </>
          )}

          {/* ── Card ── */}
          {step === 'card' && (
            <>
              <button onClick={() => setStep('options')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00BAF2', fontSize: '13px', marginBottom: '14px', padding: 0 }}>← Back</button>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>Card Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input className="paytm-input" placeholder="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                <input className="paytm-input" placeholder="Card Number" value={cardNum} onChange={(e) => setCardNum(fmtCard(e.target.value))} maxLength={19} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input className="paytm-input" placeholder="MM/YY" value={cardExp} onChange={(e) => setCardExp(fmtExp(e.target.value))} maxLength={5} />
                  <input className="paytm-input" placeholder="CVV" type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/,'').slice(0,3))} maxLength={3} />
                </div>
              </div>
              <button className="paytm-btn" style={{ marginTop: 16 }} onClick={handleCardPay}>
                Pay ₹{total}
              </button>
            </>
          )}

          {/* ── Processing ── */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ width: 56, height: 56, border: '4px solid #e5e7eb', borderTopColor: '#00BAF2', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin360 0.8s linear infinite' }} />
              <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: 4 }}>Processing Payment</p>
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>Please do not close this window…</p>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: 20 }}>Contacting your bank securely</p>
            </div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ width: 60, height: 60, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', animation: 'checkPop 0.4s ease' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontWeight: 700, fontSize: '18px', color: '#15803d', marginBottom: 4 }}>Payment Successful!</p>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>₹{total} paid via Paytm</p>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: 6 }}>Redirecting to your orders…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Page ─────────────────────────────────────────────────── */
export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showPaytm, setShowPaytm] = useState(false);

  const handleCheckout = () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to place an order');
      navigate('/login');
      return;
    }
    setShowPaytm(true);
  };

  const handlePaytmSuccess = async () => {
    setShowPaytm(false);
    const token = localStorage.getItem('token');
    const orderPayload = {
      address: address.trim(),
      items: items.map(({ product, quantity }) => ({
        product_id: product.id,
        quantity,
      })),
    };
    setIsPlacingOrder(true);
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to place order');
      toast.success(`Order placed! ID: ${data.id}`);
      clearCart();
      navigate('/orders');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">Start adding fresh products from our farmers</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {showPaytm && (
        <PaytmModal
          total={total}
          onSuccess={handlePaytmSuccess}
          onClose={() => setShowPaytm(false)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Shopping Cart</h1>
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map(({ product, quantity }) => (
              <Card key={product.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML =
                            product.category === 'fruits' ? '🍎'
                            : product.category === 'vegetables' ? '🥬'
                            : product.category === 'grains' ? '🌾'
                            : product.category === 'dairy' ? '🥛'
                            : '🌿';
                          e.currentTarget.parentElement.style.display = 'flex';
                          e.currentTarget.parentElement.style.alignItems = 'center';
                          e.currentTarget.parentElement.style.justifyContent = 'center';
                          e.currentTarget.parentElement.style.fontSize = '2rem';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        {product.category === 'fruits' ? '🍎'
                          : product.category === 'vegetables' ? '🥬'
                          : product.category === 'grains' ? '🌾'
                          : product.category === 'dairy' ? '🥛'
                          : '🌿'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">by {product.farmerName}</p>
                    <p className="text-sm font-medium text-primary">
                      ₹{product.price}/{product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="w-20 text-right font-semibold">₹{product.price * quantity}</p>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromCart(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">

            {/* Delivery Address */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  Delivery Address
                </h3>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  rows={3}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                />
              </CardContent>
            </Card>

            {/* Summary + Place Order */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
                <div className="space-y-2 border-b border-border pb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({items.length} item{items.length > 1 ? 's' : ''})
                    </span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-primary">Free</span>
                  </div>
                </div>
                <div className="flex justify-between pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                {/* Paytm pay button */}
                <button
                  onClick={handleCheckout}
                  disabled={isPlacingOrder}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '13px',
                    background: isPlacingOrder ? '#9ca3af' : '#00BAF2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.15s',
                    fontFamily: "'Segoe UI', sans-serif",
                  }}
                >
                  {isPlacingOrder ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Confirming Order…</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 200 200" fill="none" style={{flexShrink:0}}>
                        <rect width="200" height="200" rx="40" fill="#fff"/>
                        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontSize="120" fontWeight="900" fill="#00BAF2">P</text>
                      </svg>
                      Pay with Paytm · ₹{total}
                    </>
                  )}
                </button>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '8px', fontFamily: "'Segoe UI', sans-serif" }}>
                  🔒 Secured by Paytm Payment Gateway
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}