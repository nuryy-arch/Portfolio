import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowLeft, Loader2, MapPin, Store, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';
import { formatPrice } from '../lib/utils';
import type { DeliveryType, Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="py-24 bg-[#F6F2EA] min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 text-[#D8C6AE] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-[#30251F] mb-3">Ваша корзина пуста</h2>
          <p className="text-sm text-[#7E7066] font-light mb-8">
            Для оформления заказа добавьте хотя бы один товар из меню.
          </p>
          <Link
            to="/menu"
            className="px-8 py-3 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-widest"
          >
            В меню
          </Link>
        </div>
      </div>
    );
  }

  // Success view
  if (completedOrder) {
    return (
      <div className="py-20 bg-[#F6F2EA] min-h-screen flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 w-full">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#D8C6AE]/30 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#7E7066] block mb-1">
                Заказ успешно принят
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#30251F]">
                Спасибо за заказ!
              </h1>
            </div>

            <div className="bg-[#F6F2EA]/70 p-5 rounded-2xl border border-[#D8C6AE]/40 text-left space-y-2 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-[#D8C6AE]/30">
                <span className="text-[#7E7066]">Номер заказа:</span>
                <span className="font-mono font-bold text-base text-[#30251F]">
                  {completedOrder.orderNumber}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#7E7066]">Получатель:</span>
                <span className="font-medium text-[#30251F]">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E7066]">Телефон:</span>
                <span className="font-medium text-[#30251F]">{completedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E7066]">Способ получения:</span>
                <span className="font-medium text-[#30251F]">
                  {completedOrder.deliveryType === 'pickup'
                    ? 'Самовывоз (пр. Достык, 105)'
                    : `Доставка: ${completedOrder.deliveryAddress}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#D8C6AE]/30 font-semibold">
                <span>Итоговая сумма:</span>
                <span className="text-[#30251F] font-serif text-lg">
                  {formatPrice(completedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#7E7066] font-light leading-relaxed">
              Наш бариста уже начал собирать ваш заказ. Мы свяжемся с вами по указанному телефону при необходимости.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/menu')}
                className="px-8 py-3.5 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-widest hover:bg-[#221A15] transition-all"
              >
                Вернуться в меню
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3.5 bg-stone-100 text-[#30251F] rounded-full text-xs uppercase tracking-widest hover:bg-stone-200 transition-all"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!customerName.trim()) {
      setError('Пожалуйста, укажите ваше имя');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setError('Пожалуйста, укажите корректный номер телефона');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setError('Пожалуйста, укажите точный адрес доставки');
      return;
    }

    try {
      setLoading(true);
      const newOrder = await apiService.createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
        comment: comment.trim() || undefined,
        items,
      });

      // Clear cart only after verified order save
      clearCart();
      setCompletedOrder(newOrder);
    } catch (err: unknown) {
      console.error('Order creation failed:', err);
      const message = err instanceof Error ? err.message : 'Не удалось сохранить заказ. Попробуйте снова.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-[#F6F2EA] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#7E7066] hover:text-[#30251F] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться в корзину</span>
        </Link>

        <div className="border-b border-[#D8C6AE]/30 pb-4 mb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7E7066] block mb-1">
            Завершение покупки
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#30251F]">Оформление заказа</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main fields */}
          <div className="md:col-span-2 space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#D8C6AE]/30 shadow-sm">
            {/* Delivery type toggle */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#30251F] mb-3">
                Способ получения
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                    deliveryType === 'pickup'
                      ? 'border-[#30251F] bg-[#F6F2EA]/40 text-[#30251F] ring-1 ring-[#30251F]'
                      : 'border-stone-200 text-[#7E7066] hover:border-[#D8C6AE]'
                  }`}
                >
                  <Store className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-[#30251F]">Самовывоз</div>
                    <div className="text-xs text-[#7E7066] mt-0.5 font-light">
                      Бесплатно из кофейни на Достык, 105
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                    deliveryType === 'delivery'
                      ? 'border-[#30251F] bg-[#F6F2EA]/40 text-[#30251F] ring-1 ring-[#30251F]'
                      : 'border-stone-200 text-[#7E7066] hover:border-[#D8C6AE]'
                  }`}
                >
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-[#30251F]">Доставка</div>
                    <div className="text-xs text-[#7E7066] mt-0.5 font-light">
                      Курьером по городу (до 45 мин)
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Contacts */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#30251F] border-b border-[#D8C6AE]/20 pb-2">
                Контактные данные
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#7E7066] mb-1 font-medium">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Алихан"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F6F2EA]/40 border border-[#D8C6AE]/50 rounded-xl focus:outline-none focus:border-[#30251F] text-sm text-[#30251F]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#7E7066] mb-1 font-medium">
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (700) 000-00-00"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F6F2EA]/40 border border-[#D8C6AE]/50 rounded-xl focus:outline-none focus:border-[#30251F] text-sm text-[#30251F]"
                  />
                </div>
              </div>

              {/* Delivery address if selected */}
              {deliveryType === 'delivery' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#7E7066] mb-1 font-medium">
                    Адрес доставки (улица, дом, подъезд, этаж) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="пр. Абая 44, кв. 12, подъезд 2"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F6F2EA]/40 border border-[#D8C6AE]/50 rounded-xl focus:outline-none focus:border-[#30251F] text-sm text-[#30251F]"
                  />
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#7E7066] mb-1 font-medium">
                  Комментарий к заказу (пожелания, время, аллергии)
                </label>
                <textarea
                  rows={3}
                  placeholder="Например: овсяное молоко, домофон не работает"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F6F2EA]/40 border border-[#D8C6AE]/50 rounded-xl focus:outline-none focus:border-[#30251F] text-sm text-[#30251F]"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Sidebar breakdown */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-[#D8C6AE]/30 shadow-sm space-y-6 sticky top-28">
              <h3 className="font-serif text-xl font-semibold text-[#30251F]">Состав заказа</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.product.id} className="flex justify-between text-xs text-[#7E7066]">
                    <span className="line-clamp-1 pr-2">
                      {it.product.name} × {it.quantity}
                    </span>
                    <span className="font-medium text-[#30251F] shrink-0">
                      {formatPrice(it.product.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#D8C6AE]/30 pt-4 space-y-2 text-sm text-[#7E7066]">
                <div className="flex justify-between">
                  <span>Товары:</span>
                  <span className="font-medium text-[#30251F]">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Доставка:</span>
                  <span className="font-medium text-emerald-700">Бесплатно</span>
                </div>
                <div className="pt-2 border-t border-[#D8C6AE]/20 flex justify-between items-baseline">
                  <span className="text-base font-medium text-[#30251F]">К оплате:</span>
                  <span className="text-xl font-bold font-serif text-[#30251F]">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#221A15] transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <span>Подтвердить заказ</span>
                )}
              </button>

              <p className="text-[10px] text-center text-[#7E7066] leading-relaxed">
                Нажимая кнопку, вы подтверждаете согласие на обработку заказа. Оплата производится при получении картой или наличными.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
