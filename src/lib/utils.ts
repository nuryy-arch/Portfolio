export const formatPrice = (price: number): string => {
  return `${new Intl.NumberFormat('ru-RU').format(price)} ₸`;
};

export const generateOrderNumber = (): string => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  return `ATL-${dateStr}-${randomStr}`;
};

export const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'coffee':
      return 'Кофе';
    case 'tea':
      return 'Чай';
    case 'cold':
      return 'Холодные напитки';
    case 'desserts':
      return 'Десерты';
    default:
      return category;
  }
};

export const getStatusLabel = (status: string): { label: string; color: string } => {
  switch (status) {
    case 'new':
      return { label: 'Новый', color: 'bg-amber-100 text-amber-900 border-amber-200' };
    case 'confirmed':
      return { label: 'Подтверждён', color: 'bg-blue-100 text-blue-900 border-blue-200' };
    case 'preparing':
      return { label: 'Готовится', color: 'bg-purple-100 text-purple-900 border-purple-200' };
    case 'ready':
      return { label: 'Готов', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
    case 'completed':
      return { label: 'Завершён', color: 'bg-stone-100 text-stone-700 border-stone-200' };
    case 'cancelled':
      return { label: 'Отменён', color: 'bg-rose-100 text-rose-900 border-rose-200' };
    default:
      return { label: status, color: 'bg-stone-100 text-stone-700 border-stone-200' };
  }
};
