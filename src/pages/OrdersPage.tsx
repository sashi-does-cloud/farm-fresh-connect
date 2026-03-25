import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_ORDERS } from '@/data/mockData';
import { Package } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-accent/20 text-accent-foreground',
  confirmed: 'bg-primary/10 text-primary',
  shipped: 'bg-secondary text-secondary-foreground',
  delivered: 'bg-success/10 text-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">My Orders</h1>
        {MOCK_ORDERS.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_ORDERS.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                    </div>
                    <Badge className={`border-0 ${STATUS_STYLES[order.status]}`}>{order.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span>{item.product.name} × {item.quantity}</span>
                        <span className="font-medium">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </div>
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
