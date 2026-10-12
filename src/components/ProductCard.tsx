import React from 'react';
import { Plus, Check } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice, getCategoryLabel } from '../lib/utils';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, items } = useCart();
  const inCart = items.find((it) => it.product.id === product.id);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#D8C6AE]/30 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#ECE2D4]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase bg-[#30251F]/80 backdrop-blur-md text-[#F6F2EA] rounded-full">
            {getCategoryLabel(product.category)}
          </span>
          {product.featured && (
            <span className="px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase bg-[#D8C6AE] text-[#30251F] rounded-full">
              Выбор шефа
            </span>
          )}
        </div>

        {/* Volume badge */}
        {product.volume && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-0.5 text-[11px] font-medium tracking-wider bg-black/50 backdrop-blur-md text-white rounded">
              {product.volume}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3.5 py-1.5 text-xs uppercase tracking-widest font-semibold bg-white text-[#30251F] rounded-full shadow-lg">
              Закончился
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#30251F] group-hover:text-amber-950 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#7E7066] leading-relaxed line-clamp-2 font-light">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-5 pt-4 border-t border-[#D8C6AE]/25 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#7E7066] block font-light">Стоимость</span>
            <span className="text-lg font-bold text-[#30251F] tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!product.isAvailable}
            className={`px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-medium flex items-center space-x-1.5 transition-all duration-200 ${
              !product.isAvailable
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : inCart
                ? 'bg-[#D8C6AE] text-[#30251F] hover:bg-[#cfbba0]'
                : 'bg-[#30251F] text-[#F6F2EA] hover:bg-[#221A15] shadow-sm'
            }`}
            aria-label={`Добавить ${product.name} в корзину`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>В корзине ({inCart.quantity})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>В заказ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
