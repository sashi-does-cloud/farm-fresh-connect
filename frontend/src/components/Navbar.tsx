import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Leaf, Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]); // This helps when navigating

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">FarmFresh</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link 
            to="/products" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse Products
          </Link>

          {isAuthenticated && user?.role === 'farmer' && (
            <Link 
              to="/farmer/dashboard" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          )}

          {isAuthenticated && user?.role === 'buyer' && (
            <Link 
              to="/orders" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              My Orders
            </Link>
          )}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Cart Icon - Only for Buyers */}
          {isAuthenticated && user?.role === 'buyer' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-medium">
                  {itemCount}
                </span>
              )}
            </Button>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user?.name?.split(' ')[0] || 'User'} {/* Show first name only */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-muted-foreground text-xs cursor-default">
                  {user?.role === 'farmer' ? '👨‍🌾 Farmer Account' : '🛒 Buyer Account'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> 
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link 
              to="/products" 
              className="text-sm font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              Browse Products
            </Link>

            {isAuthenticated && user?.role === 'farmer' && (
              <Link 
                to="/farmer/dashboard" 
                className="text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Farmer Dashboard
              </Link>
            )}

            {isAuthenticated && user?.role === 'buyer' && (
              <>
                <Link 
                  to="/cart" 
                  className="text-sm font-medium py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Cart ({itemCount})
                </Link>
                <Link 
                  to="/orders" 
                  className="text-sm font-medium py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  My Orders
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive" 
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                >
                  Login
                </Button>
                <Button 
                  onClick={() => { navigate('/register'); setMobileOpen(false); }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}