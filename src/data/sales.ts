import { Sale } from '../types';

export const SALES: Sale[] = [
  { id: "ORD-9283", date: "2024-03-20 14:30", customer: "Izzatillo Sadirov", items: 3, total: 642.98, method: "Card", status: "Paid" },
  { id: "ORD-9284", date: "2024-03-20 15:15", customer: "John Doe", items: 1, total: 45.00, method: "Cash", status: "Paid" },
  { id: "ORD-9285", date: "2024-03-20 16:45", customer: "Jane Smith", items: 2, total: 299.99, method: "Card", status: "Paid" },
  { id: "ORD-9286", date: "2024-03-21 09:20", customer: "Alex Johnson", items: 5, total: 1240.50, method: "Split", status: "Paid" },
];
