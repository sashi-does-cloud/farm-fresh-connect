import axios from 'axios';
import { Product, User, UserRole, Order, CartItem, ProductCategory } from '@/types';

// Point this to your Python Flask/FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmer_app_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string, role: UserRole) => {
    const { data } = await api.post<{ user: User; token: string }>('/auth/login', { email, password, role });
    return data;
  },
  register: async (name: string, email: string, password: string, role: UserRole) => {
    const { data } = await api.post<{ user: User; token: string }>('/auth/register', { name, email, password, role });
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get<User>('/auth/profile');
    return data;
  },
};

// ─── Products ────────────────────────────────────────────────
export const productsApi = {
  getAll: async (params?: { search?: string; category?: ProductCategory | 'all'; sort?: string }) => {
    const { data } = await api.get<Product[]>('/products', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },
  create: async (product: Omit<Product, 'id' | 'farmerId' | 'farmerName' | 'rating' | 'reviews' | 'createdAt'>) => {
    const { data } = await api.post<Product>('/products', product);
    return data;
  },
  update: async (id: string, product: Partial<Product>) => {
    const { data } = await api.put<Product>(`/products/${id}`, product);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
  getByFarmer: async () => {
    const { data } = await api.get<Product[]>('/products/my');
    return data;
  },
};

// ─── Orders ──────────────────────────────────────────────────
export const ordersApi = {
  create: async (items: CartItem[], address: string) => {
    const payload = items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }));
    const { data } = await api.post<Order>('/orders', { items: payload, address });
    return data;
  },
  getMyOrders: async () => {
    const { data } = await api.get<Order[]>('/orders/my');
    return data;
  },
  getFarmerOrders: async () => {
    const { data } = await api.get<Order[]>('/orders/farmer');
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
};

export default api;
