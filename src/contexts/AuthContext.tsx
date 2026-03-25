import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

// Set to true to use local mock data instead of the Python backend
const USE_MOCK = true;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('farmer_app_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // On mount, try to restore session from token
  useEffect(() => {
    if (!USE_MOCK && localStorage.getItem('farmer_app_token') && !user) {
      authApi.getProfile()
        .then((u) => {
          setUser(u);
          localStorage.setItem('farmer_app_user', JSON.stringify(u));
        })
        .catch(() => {
          localStorage.removeItem('farmer_app_token');
          localStorage.removeItem('farmer_app_user');
        });
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    if (USE_MOCK) {
      const mockUser: User = {
        id: role === 'farmer' ? 'f1' : 'b1',
        name: role === 'farmer' ? 'Ramesh Kumar' : 'Ankit Verma',
        email,
        role,
        location: 'Maharashtra, India',
      };
      setUser(mockUser);
      localStorage.setItem('farmer_app_user', JSON.stringify(mockUser));
      return;
    }

    setLoading(true);
    try {
      const { user: u, token } = await authApi.login(email, password, role);
      localStorage.setItem('farmer_app_token', token);
      localStorage.setItem('farmer_app_user', JSON.stringify(u));
      setUser(u);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    if (USE_MOCK) {
      const mockUser: User = { id: crypto.randomUUID(), name, email, role };
      setUser(mockUser);
      localStorage.setItem('farmer_app_user', JSON.stringify(mockUser));
      return;
    }

    setLoading(true);
    try {
      const { user: u, token } = await authApi.register(name, email, password, role);
      localStorage.setItem('farmer_app_token', token);
      localStorage.setItem('farmer_app_user', JSON.stringify(u));
      setUser(u);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('farmer_app_user');
    localStorage.removeItem('farmer_app_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
