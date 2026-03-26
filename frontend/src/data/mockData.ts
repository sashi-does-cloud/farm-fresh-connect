import { Product, Order } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1', farmerId: 'f1', farmerName: 'Ramesh Kumar',
    name: 'Fresh Organic Tomatoes', description: 'Hand-picked organic tomatoes from our family farm. Rich in flavor and nutrients.',
    category: 'vegetables', price: 45, unit: 'kg', quantity: 200,
    image: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&auto=format&fit=crop',
    available: true, rating: 4.5, reviews: 28, createdAt: '2026-03-20'
  },
  {
    id: '2', farmerId: 'f1', farmerName: 'Ramesh Kumar',
    name: 'Basmati Rice', description: 'Premium long-grain basmati rice, aged for 12 months for the perfect aroma.',
    category: 'grains', price: 120, unit: 'kg', quantity: 500,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop',
    available: true, rating: 4.8, reviews: 65, createdAt: '2026-03-18'
  },
  {
    id: '3', farmerId: 'f2', farmerName: 'Priya Sharma',
    name: 'Alphonso Mangoes', description: 'Premium Alphonso mangoes from Ratnagiri. Sweet, juicy, and naturally ripened.',
    category: 'fruits', price: 350, unit: 'dozen', quantity: 50,
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&auto=format&fit=crop',
    available: true, rating: 4.9, reviews: 120, createdAt: '2026-03-22'
  },
  {
    id: '4', farmerId: 'f2', farmerName: 'Priya Sharma',
    name: 'Fresh Spinach', description: 'Nutrient-rich organic spinach leaves, freshly harvested every morning.',
    category: 'vegetables', price: 30, unit: 'bunch', quantity: 150,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop',
    available: true, rating: 4.3, reviews: 15, createdAt: '2026-03-21'
  },
  {
    id: '5', farmerId: 'f3', farmerName: 'Suresh Patel',
    name: 'Farm Fresh Milk', description: 'Pure A2 cow milk delivered fresh from our dairy farm every day.',
    category: 'dairy', price: 65, unit: 'liter', quantity: 100,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop',
    available: true, rating: 4.7, reviews: 89, createdAt: '2026-03-23'
  },
  {
    id: '6', farmerId: 'f3', farmerName: 'Suresh Patel',
    name: 'Fresh Coriander', description: 'Aromatic and fresh coriander leaves for your everyday cooking.',
    category: 'herbs', price: 15, unit: 'bunch', quantity: 300,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    available: true, rating: 4.2, reviews: 10, createdAt: '2026-03-24'
  },
  {
    id: '7', farmerId: 'f1', farmerName: 'Ramesh Kumar',
    name: 'Organic Potatoes', description: 'Chemical-free organic potatoes grown using traditional farming methods.',
    category: 'organic', price: 40, unit: 'kg', quantity: 400,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop',
    available: true, rating: 4.4, reviews: 32, createdAt: '2026-03-19'
  },
  {
    id: '8', farmerId: 'f2', farmerName: 'Priya Sharma',
    name: 'Red Onions', description: 'Fresh red onions sourced directly from our fields. Long shelf life guaranteed.',
    category: 'vegetables', price: 35, unit: 'kg', quantity: 600,
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&auto=format&fit=crop',
    available: true, rating: 4.1, reviews: 22, createdAt: '2026-03-17'
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1', buyerId: 'b1', buyerName: 'Ankit Verma',
    items: [{ product: MOCK_PRODUCTS[0], quantity: 5 }, { product: MOCK_PRODUCTS[3], quantity: 3 }],
    total: 315, status: 'confirmed', createdAt: '2026-03-24', address: '123 MG Road, Mumbai'
  },
  {
    id: 'ord-2', buyerId: 'b2', buyerName: 'Meera Joshi',
    items: [{ product: MOCK_PRODUCTS[2], quantity: 2 }],
    total: 700, status: 'pending', createdAt: '2026-03-25', address: '456 Park Street, Pune'
  },
];
