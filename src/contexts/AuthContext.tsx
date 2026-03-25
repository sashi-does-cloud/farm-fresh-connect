import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  register: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('farmer_app_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, _password: string, role: UserRole) => {
    const mockUser: User = {
      id: role === 'farmer' ? 'f1' : 'b1',
      name: role === 'farmer' ? 'Ramesh Kumar' : 'Ankit Verma',
      email,
      role,
      location: 'Maharashtra, India',
    };
    setUser(mockUser);
    localStorage.setItem('farmer_app_user', JSON.stringify(mockUser));
  };

  const register = (name: string, email: string, _password: string, role: UserRole) => {
    const mockUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
    };
    setUser(mockUser);
    localStorage.setItem('farmer_app_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('farmer_app_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
