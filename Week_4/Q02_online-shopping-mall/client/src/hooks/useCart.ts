import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface RawCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_options: Record<string, string> | null;
  products: {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    image_url: string;
    stock: number;
    is_rocket_delivery: boolean;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedOptions: Record<string, string> | null;
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice: number | null;
    imageUrl: string;
    stock: number;
    isRocketDelivery: boolean;
  };
}

function mapCartItem(raw: RawCartItem): CartItem {
  return {
    id: raw.id,
    productId: raw.product_id,
    quantity: raw.quantity,
    selectedOptions: raw.selected_options,
    product: {
      id: raw.products.id,
      name: raw.products.name,
      price: raw.products.price,
      discountPrice: raw.products.discount_price,
      imageUrl: raw.products.image_url,
      stock: raw.products.stock,
      isRocketDelivery: raw.products.is_rocket_delivery,
    },
  };
}

export function useCart() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get<{ items: RawCartItem[] }>('/cart');
      return res.data.items.map(mapCartItem);
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      selectedOptions,
    }: {
      productId: string;
      quantity: number;
      selectedOptions?: Record<string, string>;
    }) => {
      return api.post('/cart', { productId, quantity, selectedOptions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return api.patch(`/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const cartItems = cartQuery.data || [];
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: cartItems,
    isLoading: cartQuery.isLoading,
    totalPrice,
    totalItems,
    addToCart,
    updateQuantity,
    removeFromCart,
  };
}
