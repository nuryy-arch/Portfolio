import type { Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { generateOrderNumber } from '../lib/utils';

const LOCAL_PRODUCTS_KEY = 'atelier_coffee_products_demo_v1';
const LOCAL_ORDERS_KEY = 'atelier_coffee_orders_demo_v1';

// Initial seed helper for local browser demo
const getLocalProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Error reading local products', err);
  }
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

const saveLocalProducts = (products: Product[]) => {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
};

const getLocalOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Error reading local orders', err);
  }
  return [];
};

const saveLocalOrders = (orders: Order[]) => {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
};

export const apiService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    return getLocalProducts();
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const current = getLocalProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    saveLocalProducts([newProduct, ...current]);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const current = getLocalProducts();
    const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveLocalProducts(updated);
    const found = updated.find((p) => p.id === id);
    if (!found) throw new Error('Товар не найден');
    return found;
  },

  async deleteProduct(id: string): Promise<void> {
    const current = getLocalProducts();
    saveLocalProducts(current.filter((p) => p.id !== id));
  },

  async resetProducts(): Promise<Product[]> {
    saveLocalProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  // ORDERS
  async createOrder(params: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'pickup' | 'delivery';
    deliveryAddress?: string;
    comment?: string;
    items: { product: Product; quantity: number }[];
  }): Promise<Order> {
    if (params.items.length === 0) {
      throw new Error('Корзина пуста');
    }

    const orderNumber = generateOrderNumber();
    const totalAmount = params.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      deliveryType: params.deliveryType,
      deliveryAddress: params.deliveryAddress,
      comment: params.comment,
      status: 'new',
      totalAmount,
      createdAt: new Date().toISOString(),
      items: params.items.map((i) => ({
        id: `item-${Math.random()}`,
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        imageUrl: i.product.imageUrl,
      })),
    };

    const currentOrders = getLocalOrders();
    saveLocalOrders([newOrder, ...currentOrders]);
    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    return getLocalOrders();
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orders = getLocalOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    saveLocalOrders(updated);
  },

  async clearOrders(): Promise<void> {
    saveLocalOrders([]);
  },
};
