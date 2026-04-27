export interface ProductStock {
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderPoint: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  color: string;
  barcode?: string;
  stock?: ProductStock;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  method: string;
  status: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  loyaltyPoints: number;
  totalSpent: string;   // "0.00" — string from API
  visitCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

