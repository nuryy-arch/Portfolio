export type ProductCategory = 'coffee' | 'tea' | 'cold' | 'desserts';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in KZT (₸)
  category: ProductCategory;
  imageUrl: string;
  isAvailable: boolean;
  volume?: string;
  featured?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type DeliveryType = 'pickup' | 'delivery';

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  comment?: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
