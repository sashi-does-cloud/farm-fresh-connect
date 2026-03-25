import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  // You can extend this if you fetch product details later
}

interface Order {
  id: string;
  total: number;
  status: string;
  address: string;
  createdAt: string;
  items: OrderItem[];        // Currently empty from backend, we'll improve later
  buyerName?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/orders/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,   // Keep "Bearer " with space
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      // Backend currently returns items as empty array
      // We'll keep it simple for now
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Please login to view your orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Orders</h1>
          <button
            onClick={fetchOrders}
            className="text-sm text-primary hover:underline flex items-center gap-1"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchOrders}
              className="mt-4 text-primary hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              When you place an order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge 
                      className={`border-0 capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                          <span>Product × {item.quantity}</span>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Order items will appear here soon
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between border-t border-border pt-4 font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>

                  {order.address && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      <strong>Delivery Address:</strong> {order.address}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}