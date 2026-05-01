import { useMemo } from 'react';
import { useStore } from '../store';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { Kassa } from '../components/Kassa';
import { Cart } from '../components/Cart';

export const KassaPage = () => {
  const searchQuery    = useStore((state) => state.searchQuery);
  const activeCategory = useStore((state) => state.activeCategory);

  const { data: apiCategories = [], isLoading: categoriesLoading } = useCategories();
  const { data: products = [],     isLoading: productsLoading     } = useProducts();

  // ['All', 'Modern', 'Classic', ...]
  const categories = useMemo(
    () => ['All', ...apiCategories.map((c) => c.name)],
    [apiCategories]
  );

  // Filter locally — fast, no extra API calls
  const filteredProducts = useMemo(() =>
    products.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch   = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }),
    [products, activeCategory, searchQuery]
  );

  return (
    <div className="flex-1 flex flex-row overflow-hidden min-h-0">
      <div className="w-[70%] flex flex-col overflow-hidden min-h-0">
        <Kassa
          filteredProducts={filteredProducts}
          categories={categories}
          isLoading={productsLoading || categoriesLoading}
        />
      </div>
        <p>boom</p>
      <div className="w-[30%] flex flex-col overflow-hidden min-h-0">
        <Cart />
      </div>
    </div>
  );
};
