import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handleCheckout = async () => {
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

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Shopping Cart</h1>
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map(({ product, quantity }) => (
              <Card key={product.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-3xl">
                    {product.category === 'fruits'
                      ? '🍎'
                      : product.category === 'vegetables'
                      ? '🥬'
                      : product.category === 'grains'
                      ? '🌾'
                      : product.category === 'dairy'
                      ? '🥛'
                      : '🌿'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">by {product.farmerName}</p>
                    <p className="text-sm font-medium text-primary">
                      ₹{product.price}/{product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="w-20 text-right font-semibold">₹{product.price * quantity}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeFromCart(product.id)}
                  >
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
                <Button
                  className="mt-6 w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
