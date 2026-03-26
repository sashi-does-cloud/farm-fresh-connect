import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CATEGORY_EMOJI: Record<string, string> = {
  fruits: '🍎', vegetables: '🥬', grains: '🌾', dairy: '🥛', herbs: '🌿', organic: '🌱',
};

const CATEGORY_COLORS: Record<string, string> = {
  fruits: 'bg-destructive/10 text-destructive',
  vegetables: 'bg-primary/10 text-primary',
  grains: 'bg-accent/20 text-accent-foreground',
  dairy: 'bg-secondary text-secondary-foreground',
  herbs: 'bg-primary/10 text-primary',
  organic: 'bg-success/10 text-foreground',
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative bg-secondary/50 flex items-center justify-center overflow-hidden h-48 w-full object-cover">
        {/* <span className="text-6xl">{CATEGORY_EMOJI[product.category] || '🌿'}</span> */}
        <img
    src={product.image || 'https://via.placeholder.com/400'}
    alt={product.name}
    className="h-48 w-full object-cover rounded-t-xl"
  />
        <Badge className={`absolute top-3 left-3 ${CATEGORY_COLORS[product.category] || ''} border-0 text-xs font-medium`}>
          {product.category}
        </Badge>
        {!product.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-sm font-semibold text-muted-foreground">Out of Stock</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {product.farmerName}
        </div>
        <h3 className="mb-2 font-semibold text-foreground line-clamp-1">{product.name}</h3>
        <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">₹{product.price}</span>
            <span className="text-xs text-muted-foreground">/{product.unit}</span>
          </div>
          {user?.role !== 'farmer' && product.available && (
            <Button
              size="sm"
              onClick={() => {
                if (!user) return navigate('/login');
                addToCart(product);
              }}
              className="gap-1.5"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
