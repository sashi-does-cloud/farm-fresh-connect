import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, ShoppingCart, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/data/mockData';

const CATEGORIES = [
  { name: 'Fruits', emoji: '🍎', count: 45 },
  { name: 'Vegetables', emoji: '🥬', count: 78 },
  { name: 'Grains', emoji: '🌾', count: 32 },
  { name: 'Dairy', emoji: '🥛', count: 21 },
  { name: 'Herbs', emoji: '🌿', count: 18 },
  { name: 'Organic', emoji: '🌱', count: 56 },
];

const STATS = [
  { icon: Users, label: 'Active Farmers', value: '2,500+' },
  { icon: ShoppingCart, label: 'Products Listed', value: '12,000+' },
  { icon: TrendingUp, label: 'Orders Delivered', value: '50,000+' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Leaf className="h-4 w-4" />
              Farm to Table, No Middlemen
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
              Fresh From The Farm,{' '}
              <span className="text-primary">Straight To You</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Connect directly with local farmers. Get fresh, affordable produce while supporting the people who grow your food.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2 px-8" onClick={() => navigate('/products')}>
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 px-8" onClick={() => navigate('/register')}>
                Start Selling
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-display text-3xl font-bold text-foreground">Shop by Category</h2>
          <p className="text-muted-foreground">Browse from a wide range of fresh agricultural products</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/products?category=${cat.name.toLowerCase()}`)}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <span className="text-4xl transition-transform group-hover:scale-110">{cat.emoji}</span>
              <span className="text-sm font-medium text-foreground">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat.count} items</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/20 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-2 font-display text-3xl font-bold text-foreground">Fresh Picks</h2>
              <p className="text-muted-foreground">Today's best from local farms</p>
            </div>
            <Button variant="ghost" className="hidden gap-2 sm:flex" onClick={() => navigate('/products')}>
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_PRODUCTS.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-primary p-10 text-center md:p-16">
          <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground">Are You a Farmer?</h2>
          <p className="mb-6 text-primary-foreground/80">
            Join thousands of farmers selling directly to consumers. Better prices, zero middlemen.
          </p>
          <Button size="lg" variant="secondary" className="px-8" onClick={() => navigate('/register')}>
            Register as a Farmer
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
