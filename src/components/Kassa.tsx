import { useState } from 'react';
import { useStore } from '../store';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { ProductCounterModal } from './ProductCounterModal';

interface KassaProps {
  filteredProducts: Product[];
  categories: string[];
  isLoading: boolean;
}

export const Kassa = ({ filteredProducts, categories, isLoading }: KassaProps) => {
  const activeCategory = useStore((state) => state.activeCategory);
  const setActiveCategory = useStore((state) => state.setActiveCategory);
  const productView = useStore((state) => state.productView);
  const setProductView = useStore((state) => state.setProductView);

  const [counterProduct, setCounterProduct] = useState<Product | null>(null);

  return (
    <div className="flex-1 flex flex-col p-3 lg:p-4 gap-3 overflow-hidden min-h-0 min-w-0">

      {/* Top bar: categories + view toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1 pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                activeCategory === cat
                  ? "bg-black text-white shadow-sm"
                  : "bg-white text-gray-400 hover:text-black border border-gray-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-gray-100 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setProductView('grid')}
            title="Grid ko'rinish"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-md transition-all",
              productView === 'grid' ? "bg-black text-white shadow-sm" : "text-gray-400 hover:text-gray-700"
            )}
          >
            <Icon icon="solar:widget-5-bold-duotone" className="text-[13px]" />
          </button>
          <button
            onClick={() => setProductView('list')}
            title="Ro'yxat ko'rinish"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-md transition-all",
              productView === 'list' ? "bg-black text-white shadow-sm" : "text-gray-400 hover:text-gray-700"
            )}
          >
            <Icon icon="solar:list-bold-duotone" className="text-[13px]" />
          </button>
        </div>
      </div>

      {/* Product area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          {productView === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 pb-2"
            >
              {filteredProducts.map((product) => {
                const available = product.stock != null ? product.stock.quantityAvailable : 0;
                const outOfStock = available <= 0;
                return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={cn("group", outOfStock ? "cursor-not-allowed opacity-50" : "cursor-pointer")}
                  onClick={() => !outOfStock && setCounterProduct(product)}
                >
                  <div className="aspect-square bg-[#F5F5F5] rounded-lg overflow-hidden relative flex items-center justify-center p-1.5 transition-all duration-300 group-hover:shadow-md group-hover:shadow-black/10">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <Badge
                      className={cn(
                        "absolute top-1.5 left-1.5 border-none text-[8px] px-1.5 py-0 rounded-full font-bold uppercase tracking-wide leading-4",
                        product.color
                      )}
                    >
                      {product.category}
                    </Badge>
                    {outOfStock ? (
                      <div className="absolute bottom-1 right-1">
                        <div className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
                          Tugadi
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="absolute bottom-1 left-1">
                          <div className="bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
                            {available}
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                          <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                            <Icon icon="solar:add-circle-bold" className="text-[10px]" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-1 px-0.5">
                    <p className="text-[10px] font-semibold text-gray-700 truncate leading-tight">{product.name}</p>
                    <p className="text-[11px] font-black text-black mt-0.5">${product.price.toFixed(2)}</p>
                  </div>
                </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-1 pb-2"
            >
              {filteredProducts.map((product) => {
                const available = product.stock != null ? product.stock.quantityAvailable : 0;
                const outOfStock = available <= 0;
                return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg group border border-gray-100 transition-all",
                    outOfStock ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer hover:border-gray-200"
                  )}
                  onClick={() => !outOfStock && setCounterProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-8 h-8 rounded-md object-contain bg-gray-50 mix-blend-multiply shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <Badge
                    className={cn(
                      "border-none text-[9px] px-1.5 py-0 rounded-full font-bold uppercase shrink-0 leading-4",
                      product.color
                    )}
                  >
                    {product.category}
                  </Badge>
                  <p className="flex-1 text-[11px] font-semibold text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs font-black text-black shrink-0">${product.price.toFixed(2)}</p>
                  {outOfStock ? (
                    <span className="text-[9px] font-bold text-red-500 shrink-0">Tugadi</span>
                  ) : (
                    <>
                      <span className="text-[9px] font-bold text-gray-400 shrink-0">{available} ta</span>
                      <div className="w-6 h-6 bg-black text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 active:scale-90">
                        <Icon icon="solar:add-circle-bold" className="text-xs" />
                      </div>
                    </>
                  )}
                </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ProductCounterModal
        open={counterProduct !== null}
        product={counterProduct}
        onClose={() => setCounterProduct(null)}
      />
    </div>
  );
};
