import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { generateOrderNumber } from '../lib/utils';

const LOCAL_PRODUCTS_KEY = 'atelier_coffee_products_v2';
const LOCAL_ORDERS_KEY = 'atelier_coffee_orders_v1';

// Initial seed helper for local demo
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imageUrl: item.image_url,
            isAvailable: item.is_available,
            volume: item.volume,
            featured: item.featured,
            sortOrder: item.sort_order,
            createdAt: item.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch products error, fallback to local', e);
      }
    }
    return getLocalProducts();
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          image_url: product.imageUrl,
          is_available: product.isAvailable,
          volume: product.volume,
          featured: product.featured,
          sort_order: product.sortOrder || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.image_url,
        isAvailable: data.is_available,
        volume: data.volume,
        featured: data.featured,
        sortOrder: data.sort_order,
      };
    }

    const current = getLocalProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    saveLocalProducts([newProduct, ...current]);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
      if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
      if (updates.volume !== undefined) payload.volume = updates.volume;
      if (updates.featured !== undefined) payload.featured = updates.featured;

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.image_url,
        isAvailable: data.is_available,
        volume: data.volume,
        featured: data.featured,
      };
    }

    const current = getLocalProducts();
    const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveLocalProducts(updated);
    const found = updated.find((p) => p.id === id);
    if (!found) throw new Error('Товар не найден');
    return found;
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const current = getLocalProducts();
    saveLocalProducts(current.filter((p) => p.id !== id));
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

    if (isSupabaseConfigured && supabase) {
      // 1. Insert order
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: params.customerName,
          customer_phone: params.customerPhone,
          delivery_type: params.deliveryType,
          delivery_address: params.deliveryAddress || null,
          comment: params.comment || null,
          status: 'new',
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Insert order items
      const itemsPayload = params.items.map((i) => ({
        order_id: orderData.id,
        product_id: i.product.id.startsWith('prod-') ? null : i.product.id,
        product_name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsErr) {
        console.error('Error inserting order items:', itemsErr);
      }

      return {
        id: orderData.id,
        orderNumber: orderData.order_number,
        customerName: orderData.customer_name,
        customerPhone: orderData.customer_phone,
        deliveryType: orderData.delivery_type,
        deliveryAddress: orderData.delivery_address,
        comment: orderData.comment,
        status: orderData.status,
        totalAmount: orderData.total_amount,
        createdAt: orderData.created_at,
        items: params.items.map((i) => ({
          id: `item-${Math.random()}`,
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          imageUrl: i.product.imageUrl,
        })),
      };
    }

    // Local fallback
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((o) => ({
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            deliveryType: o.delivery_type,
            deliveryAddress: o.delivery_address,
            comment: o.comment,
            status: o.status,
            totalAmount: o.total_amount,
            createdAt: o.created_at,
            items: (o.order_items || []).map((it: { id: string; product_id: string; product_name: string; price: number; quantity: number }) => ({
              id: it.id,
              productId: it.product_id,
              productName: it.product_name,
              price: it.price,
              quantity: it.quantity,
            })),
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch orders error, fallback to local', e);
      }
    }

    return getLocalOrders();
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) throw error;
      return;
    }

    const orders = getLocalOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    saveLocalOrders(updated);
  },
};
