import { Product, Sale, Customer } from './types';

export const CATEGORIES = ["All", "Modern", "Classic", "Minimal", "Industrial"];

export const PRODUCTS: Product[] = [
  { id: "1", name: "Modern Pendant Light", price: 129.99, category: "Modern", image: "https://picsum.photos/seed/light1/400/400", color: "bg-blue-50 text-blue-600" },
  { id: "2", name: "Classic Chandelier", price: 499.99, category: "Classic", image: "https://picsum.photos/seed/light2/400/400", color: "bg-amber-50 text-amber-600" },
  { id: "3", name: "Minimalist Desk Lamp", price: 45.00, category: "Minimal", image: "https://picsum.photos/seed/light3/400/400", color: "bg-emerald-50 text-emerald-600" },
  { id: "4", name: "Industrial Wall Sconce", price: 89.50, category: "Industrial", image: "https://picsum.photos/seed/light4/400/400", color: "bg-purple-50 text-purple-600" },
  { id: "5", name: "Geometric Floor Lamp", price: 210.00, category: "Modern", image: "https://picsum.photos/seed/light5/400/400", color: "bg-blue-50 text-blue-600" },
  { id: "6", name: "Vintage Edison Bulb", price: 12.99, category: "Industrial", image: "https://picsum.photos/seed/light6/400/400", color: "bg-purple-50 text-purple-600" },
  { id: "7", name: "Crystal Table Lamp", price: 155.00, category: "Classic", image: "https://picsum.photos/seed/light7/400/400", color: "bg-amber-50 text-amber-600" },
    { id: "8", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
    { id: "9", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
    { id: "10", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
    { id: "11", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
    { id: "12", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
    { id: "13", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
    { id: "14", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
    { id: "15", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
    { id: "16", name: "Nordic Ceiling Light", price: 175.00, category: "Minimal", image: "https://picsum.photos/seed/light8/400/400", color: "bg-emerald-50 text-emerald-600" },
];

export const SALES_HISTORY: Sale[] = [
  { id: "ORD-9283", date: "2024-03-20 14:30", customer: "Izzatillo Sadirov", items: 3, total: 642.98, method: "Card", status: "Paid" },
  { id: "ORD-9284", date: "2024-03-20 15:15", customer: "John Doe", items: 1, total: 45.00, method: "Cash", status: "Paid" },
  { id: "ORD-9285", date: "2024-03-20 16:45", customer: "Jane Smith", items: 2, total: 299.99, method: "Card", status: "Paid" },
  { id: "ORD-9286", date: "2024-03-21 09:20", customer: "Alex Johnson", items: 5, total: 1240.50, method: "Split", status: "Paid" },
];

export const CUSTOMERS: Customer[] = [
  { id: "CUST-001", name: "Izzatillo Sadirov", phone: "+998 90 123 45 67", lastVisit: "2024-03-20", orders: 12, totalSpent: 4520.50 },
  { id: "CUST-002", name: "John Doe", phone: "+998 91 234 56 78", lastVisit: "2024-03-15", orders: 5, totalSpent: 890.00 },
  { id: "CUST-003", name: "Jane Smith", phone: "+998 93 345 67 89", lastVisit: "2024-03-18", orders: 8, totalSpent: 1250.25 },
];
