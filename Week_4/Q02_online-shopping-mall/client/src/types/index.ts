// Product
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  images: string[];
  categoryId: string;
  rating: number;
  reviewCount: number;
  isRocketDelivery: boolean;
  stock: number;
  options?: ProductOption[];
  createdAt: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

// Category
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  imageUrl?: string;
}

// Cart
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

// Order
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled';

// Address
export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
}
