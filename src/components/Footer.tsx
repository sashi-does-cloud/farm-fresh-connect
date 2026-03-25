import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-bold">FarmFresh</span>
            </div>
            <p className="text-sm text-muted-foreground">Connecting farmers directly with consumers for fresh, affordable produce.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">Browse Products</Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground">Become a Seller</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Categories</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>Fruits</span><span>Vegetables</span><span>Grains & Cereals</span><span>Dairy Products</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 FarmFresh. Empowering farmers, nourishing communities.
        </div>
      </div>
    </footer>
  );
}
