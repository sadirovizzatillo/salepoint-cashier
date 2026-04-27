import { createFetcher, BASE_URL } from './client';
import { Product, ProductStock } from '../types';

const fetch = createFetcher(BASE_URL);

/* ── API response shape (backend) ── */
interface ApiCategory {
  id: string;
  name: string;
}

interface ApiProduct {
  id: string;
  name: string;
  price: number | string;
  active: boolean;
  barcode?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  category?: ApiCategory | null;
  categoryId?: string | null;
  categoryName?: string | null;
  stock?: ProductStock | null;
}

interface ApiListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

/* ── color palette — cycles by category index ── */
const COLORS = [
  'bg-blue-50 text-blue-600',
  'bg-amber-50 text-amber-600',
  'bg-emerald-50 text-emerald-600',
  'bg-purple-50 text-purple-600',
  'bg-rose-50 text-rose-600',
  'bg-cyan-50 text-cyan-600',
  'bg-orange-50 text-orange-600',
];

const colorCache = new Map<string, string>();
let colorIndex = 0;

function categoryColor(name: string): string {
  if (!colorCache.has(name)) {
    colorCache.set(name, COLORS[colorIndex % COLORS.length]);
    colorIndex++;
  }
  return colorCache.get(name)!;
}

/* ── map API product → local Product ── */
function mapProduct(p: ApiProduct): Product {
  const categoryName =
    p.category?.name ?? p.categoryName ?? 'Boshqa';

  let stock: ProductStock | undefined;
  if (p.stock) {
    stock = {
      ...p.stock,
      // compute available client-side in case backend doesn't send it
      quantityAvailable: p.stock.quantityOnHand - p.stock.quantityReserved,
    };
  }

  return {
    id:       p.id,
    name:     p.name,
    price:    typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    category: categoryName,
    image:    p.image ?? p.imageUrl ?? '',
    color:    categoryColor(categoryName),
    barcode:  p.barcode ?? undefined,
    stock,
  };
}

/* ── API calls ── */
export interface ProductsParams {
  active?: boolean;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export async function getProducts(params: ProductsParams = {}): Promise<Product[]> {
  const q = new URLSearchParams();
  if (params.active    !== undefined) q.set('active',     String(params.active));
  if (params.limit     !== undefined) q.set('limit',      String(params.limit));
  if (params.search)                  q.set('search',     params.search);
  if (params.categoryId)              q.set('categoryId', params.categoryId);

  const qs = q.toString();
  const res = await fetch<ApiProduct[] | ApiListResponse<ApiProduct>>(
    `/products${qs ? `?${qs}` : ''}`
  );

  // handle both array and { data: [...] } response shapes
  const list = Array.isArray(res) ? res : res.data;
  return list.map(mapProduct);
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const res = await fetch<ApiProduct>(`/products/barcode/${encodeURIComponent(barcode)}`);
    return mapProduct(res);
  } catch {
    return null;
  }
}
