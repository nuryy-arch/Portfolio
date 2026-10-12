import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-24 bg-[#F6F2EA] min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-[#ECE2D4] text-[#30251F] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag className="w-9 h-9" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#30251F] mb-3">Ваша корзина пуста</h2>
          <p className="text-sm text-[#7E7066] font-light leading-relaxed mb-8">
            Выберите любимый сорт спешелти кофе или свежий круассан из нашего меню.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#221A15] transition-all shadow-md"
          >
            <span>Перейти в меню</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-[#F6F2EA] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-4 border-b border-[#D8C6AE]/30">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#7E7066] block mb-1">
              Ваш заказ
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#30251F]">Корзина</h1>
          </div>
          <button
            onClick={clearCart}
            className="mt-3 sm:mt-0 text-xs text-[#7E7066] hover:text-rose-700 transition-colors flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить корзину</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8C6AE]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-stone-100 shrink-0"
                  />
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#30251F]">
                      {product.name}
                    </h3>
                    {product.volume && (
                      <span className="text-xs text-[#7E7066] block mt-0.5 font-light">
                        Объём / Вес: {product.volume}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-[#30251F] block mt-1.5">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#D8C6AE]/20">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-[#D8C6AE]/40 rounded-xl bg-[#F6F2EA]/40 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-2 text-[#30251F] hover:bg-[#D8C6AE]/30 transition-colors"
                      aria-label="Уменьшить"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-semibold text-[#30251F]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-2 text-[#30251F] hover:bg-[#D8C6AE]/30 transition-colors"
                      aria-label="Увеличить"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-base font-bold text-[#30251F] min-w-[5rem] text-right">
                    {formatPrice(product.price * quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-[#7E7066] hover:text-rose-600 transition-colors"
                    title="Удалить позицию"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-[#D8C6AE]/30 shadow-sm sticky top-28 space-y-6">
              <h3 className="font-serif text-xl font-semibold text-[#30251F]">Итог заказа</h3>

              <div className="space-y-3 text-sm text-[#7E7066] font-light">
                <div className="flex justify-between">
                  <span>Позиций в чеке:</span>
                  <span className="font-medium text-[#30251F]">{items.length} шт.</span>
                </div>
                <div className="flex justify-between">
                  <span>Доставка:</span>
                  <span className="font-medium text-[#30251F]">Рассчитывается далее</span>
                </div>
                <div className="pt-3 border-t border-[#D8C6AE]/30 flex justify-between items-baseline">
                  <span className="text-base font-medium text-[#30251F]">Итого к оплате:</span>
                  <span className="text-2xl font-bold font-serif text-[#30251F]">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full py-4 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#221A15] transition-all flex items-center justify-center space-x-2 shadow-md"
              >
                <span>Оформить заказ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-[11px] text-center text-[#7E7066] font-light leading-relaxed">
                Вы сможете выбрать самовывоз из кофейни или доставку курьером на следующем шаге.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
