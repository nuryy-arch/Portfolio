import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  ShoppingBag, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  LogOut, 
  Clock, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { Product, Order, OrderStatus, ProductCategory } from '../types';
import { formatPrice, getStatusLabel, getCategoryLabel } from '../lib/utils';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, login, logout, isDemoMode } = useAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Orders and products data
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Product modal (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(2000);
  const [prodCategory, setProdCategory] = useState<ProductCategory>('coffee');
  const [prodImage, setProdImage] = useState('');
  const [prodVolume, setProdVolume] = useState('');
  const [prodAvailable, setProdAvailable] = useState(true);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodSaving, setProdSaving] = useState(false);

  const loadAdminData = async () => {
    setDataLoading(true);
    try {
      const [oList, pList] = await Promise.all([
        apiService.getOrders(),
        apiService.getProducts(),
      ]);
      setOrders(oList);
      setProducts(pList);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSubmittingLogin(true);

    const res = await login(email, password);
    if (!res.success) {
      setLoginError(res.error || 'Ошибка входа');
    }
    setSubmittingLogin(false);
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleToggleProductAvailability = async (product: Product) => {
    try {
      const updated = await apiService.updateProduct(product.id, {
        isAvailable: !product.isAvailable,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isAvailable: updated.isAvailable } : p))
      );
    } catch (err) {
      console.error('Failed to toggle availability', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар из каталога?')) return;
    try {
      await apiService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(2200);
    setProdCategory('coffee');
    setProdImage('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80');
    setProdVolume('250 мл');
    setProdAvailable(true);
    setProdFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdPrice(p.price);
    setProdCategory(p.category);
    setProdImage(p.imageUrl);
    setProdVolume(p.volume || '');
    setProdAvailable(p.isAvailable);
    setProdFeatured(Boolean(p.featured));
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    setProdSaving(true);
    try {
      if (editingProduct) {
        const updated = await apiService.updateProduct(editingProduct.id, {
          name: prodName,
          description: prodDesc,
          price: prodPrice,
          category: prodCategory,
          imageUrl: prodImage,
          volume: prodVolume || undefined,
          isAvailable: prodAvailable,
          featured: prodFeatured,
        });
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await apiService.createProduct({
          name: prodName,
          description: prodDesc,
          price: prodPrice,
          category: prodCategory,
          imageUrl: prodImage,
          volume: prodVolume || undefined,
          isAvailable: prodAvailable,
          featured: prodFeatured,
        });
        setProducts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setProdSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6F2EA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#30251F]" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAdmin) {
    return (
      <div className="py-20 bg-[#F6F2EA] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#D8C6AE]/30 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#30251F] text-[#F6F2EA] flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-3xl text-[#30251F]">Вход в систему</h1>
            <p className="text-xs text-[#7E7066] mt-1 font-light uppercase tracking-wider">
              Панель администратора ATELIER COFFEE
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7E7066] font-medium mb-1">
                Email администратора
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@atelier.coffee"
                className="w-full px-4 py-2.5 bg-[#F6F2EA]/40 border border-[#D8C6AE]/50 rounded-xl text-sm text-[#30251F] focus:outline-none focus:border-[#30251F]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7E7066] font-medium mb-1">
                Пароль
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#F6F2EA]/40 border border-[#D8C6AE]/50 rounded-xl text-sm text-[#30251F] focus:outline-none focus:border-[#30251F]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              className="w-full py-3.5 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#221A15] transition-all flex items-center justify-center space-x-2"
            >
              {submittingLogin ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Войти в консоль</span>
              )}
            </button>
          </form>

          {/* Portfolio quick demo helper */}
          <div className="pt-4 border-t border-[#D8C6AE]/20 bg-[#F6F2EA]/40 p-3.5 rounded-xl text-[11px] text-[#7E7066] space-y-1">
            <div className="font-semibold text-[#30251F] flex items-center space-x-1">
              <span>Для демонстрации портфолио:</span>
            </div>
            <div>Email: <code className="text-[#30251F] font-mono">admin@atelier.coffee</code></div>
            <div>Пароль: <code className="text-[#30251F] font-mono">atelier2026</code></div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@atelier.coffee');
                setPassword('atelier2026');
              }}
              className="text-xs text-amber-900 underline font-medium pt-1 hover:text-black cursor-pointer"
            >
              Подставить данные в 1 клик
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED-IN ADMIN DASHBOARD
  return (
    <div className="py-10 bg-[#F6F2EA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top bar */}
        <div className="bg-white p-6 rounded-3xl border border-[#D8C6AE]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-[#7E7066] font-semibold">
                {isDemoMode ? 'Локальный демонстрационный режим' : 'Подключено к Supabase'}
              </span>
            </div>
            <h1 className="font-serif text-3xl text-[#30251F] mt-1">Управление кофейней</h1>
            <p className="text-xs text-[#7E7066] font-light">Вход выполнен как: {user?.email}</p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={loadAdminData}
              className="p-2.5 rounded-xl border border-[#D8C6AE]/40 hover:bg-[#F6F2EA] text-[#30251F] transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl border border-[#D8C6AE]/40 hover:bg-rose-50 hover:text-rose-700 text-[#7E7066] text-xs uppercase tracking-wider font-medium flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-3 border-b border-[#D8C6AE]/30 pb-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#30251F] text-[#F6F2EA] shadow-md'
                : 'bg-white text-[#7E7066] hover:bg-[#F6F2EA] border border-[#D8C6AE]/30'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Заказы ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-2xl text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#30251F] text-[#F6F2EA] shadow-md'
                : 'bg-white text-[#7E7066] hover:bg-[#F6F2EA] border border-[#D8C6AE]/30'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Каталог товаров ({products.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#D8C6AE]/30">
                <ShoppingBag className="w-12 h-12 text-[#D8C6AE] mx-auto mb-3" />
                <h3 className="font-serif text-2xl text-[#30251F]">Заказов пока нет</h3>
                <p className="text-xs text-[#7E7066] font-light mt-1">
                  Оформите тестовый заказ на сайте, чтобы увидеть его здесь в реальном времени.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((ord) => {
                  const statusInfo = getStatusLabel(ord.status);
                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl p-6 border border-[#D8C6AE]/30 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#30251F] bg-[#F6F2EA] px-2.5 py-1 rounded">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-[#7E7066] flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {new Date(ord.createdAt).toLocaleString('ru-RU')}
                          </span>
                        </div>

                        <div className="text-sm text-[#30251F]">
                          <span className="font-semibold">{ord.customerName}</span> •{' '}
                          <span className="text-[#7E7066]">{ord.customerPhone}</span>
                        </div>

                        <div className="text-xs text-[#7E7066]">
                          {ord.deliveryType === 'pickup' ? (
                            <span className="inline-block px-2 py-0.5 bg-stone-100 rounded text-stone-700">
                              Самовывоз (Достык, 105)
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-amber-50 rounded text-amber-900">
                              Доставка: {ord.deliveryAddress}
                            </span>
                          )}
                          {ord.comment && (
                            <div className="mt-1 italic text-stone-500">
                              Комментарий: «{ord.comment}»
                            </div>
                          )}
                        </div>

                        {/* Order items inline */}
                        {ord.items && ord.items.length > 0 && (
                          <div className="text-xs text-stone-600 bg-[#F6F2EA]/40 p-2.5 rounded-xl border border-[#D8C6AE]/30">
                            {ord.items.map((it) => (
                              <div key={it.id || it.productName} className="flex justify-between">
                                <span>{it.productName} × {it.quantity}</span>
                                <span className="font-medium">{formatPrice(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right controls: Price & Status selector */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-[#D8C6AE]/20">
                        <div className="text-left lg:text-right">
                          <span className="text-xs text-[#7E7066] block">Итого</span>
                          <span className="font-serif text-2xl font-bold text-[#30251F]">
                            {formatPrice(ord.totalAmount)}
                          </span>
                        </div>

                        {/* Status selector */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#7E7066]">Статус:</span>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleStatusChange(ord.id, e.target.value as OrderStatus)
                            }
                            className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#F6F2EA] border border-[#D8C6AE]/50 text-[#30251F] focus:outline-none"
                          >
                            <option value="new">Новый</option>
                            <option value="confirmed">Подтверждён</option>
                            <option value="preparing">Готовится</option>
                            <option value="ready">Готов к выдаче</option>
                            <option value="completed">Завершён</option>
                            <option value="cancelled">Отменён</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl text-[#30251F]">Управление каталогом</h2>
                <p className="text-xs text-[#7E7066] font-light">
                  Добавление, изменение цен, доступности и описаний товаров.
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="px-5 py-3 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 hover:bg-[#221A15] shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить товар</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-[#D8C6AE]/30 overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="relative h-44 bg-stone-100">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-black/60 text-white rounded">
                        {getCategoryLabel(p.category)}
                      </span>
                      {p.volume && (
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] bg-black/50 text-white rounded">
                          {p.volume}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-lg font-semibold text-[#30251F] line-clamp-1">
                          {p.name}
                        </h3>
                        <span className="font-bold text-sm text-[#30251F] shrink-0 ml-2">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                      <p className="text-xs text-[#7E7066] line-clamp-2 font-light">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-4 bg-[#F6F2EA]/40 border-t border-[#D8C6AE]/20 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleProductAvailability(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        p.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.isAvailable ? 'В наличии' : 'Нет в наличии'}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 text-[#7E7066] hover:text-[#30251F] rounded-lg hover:bg-stone-200 transition-colors"
                        title="Редактировать"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 text-[#7E7066] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D8C6AE]/40 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#D8C6AE]/20 pb-3">
                <h3 className="font-serif text-2xl text-[#30251F]">
                  {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <span className="text-xl font-bold leading-none">&times;</span>
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#7E7066] font-medium mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F2EA]/40 border border-[#D8C6AE]/40 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7E7066] font-medium mb-1">
                      Категория *
                    </label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                      className="w-full px-3.5 py-2.5 bg-[#F6F2EA]/40 border border-[#D8C6AE]/40 rounded-xl text-sm"
                    >
                      <option value="coffee">Кофе</option>
                      <option value="tea">Чай</option>
                      <option value="cold">Холодные напитки</option>
                      <option value="desserts">Десерты</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7E7066] font-medium mb-1">
                      Цена в тенге (₸) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#F6F2EA]/40 border border-[#D8C6AE]/40 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7E7066] font-medium mb-1">
                      Объём / Вес (напр. 250 мл)
                    </label>
                    <input
                      type="text"
                      value={prodVolume}
                      onChange={(e) => setProdVolume(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F6F2EA]/40 border border-[#D8C6AE]/40 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="availCheck"
                      checked={prodAvailable}
                      onChange={(e) => setProdAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-[#30251F]"
                    />
                    <label htmlFor="availCheck" className="text-xs font-medium text-[#30251F]">
                      В наличии
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#7E7066] font-medium mb-1">
                    URL фотографии (Unsplash или прямой линк)
                  </label>
                  <input
                    type="url"
                    required
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F2EA]/40 border border-[#D8C6AE]/40 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#7E7066] font-medium mb-1">
                    Описание
                  </label>
                  <textarea
                    rows={3}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F2EA]/40 border border-[#D8C6AE]/40 rounded-xl text-sm"
                  ></textarea>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featCheck"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#30251F]"
                  />
                  <label htmlFor="featCheck" className="text-xs font-medium text-[#30251F]">
                    Отображать в блоке популярных («Выбор шефа»)
                  </label>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider text-[#7E7066] hover:bg-stone-100"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={prodSaving}
                    className="px-6 py-2.5 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-[#221A15] flex items-center space-x-2"
                  >
                    {prodSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Сохранить</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
