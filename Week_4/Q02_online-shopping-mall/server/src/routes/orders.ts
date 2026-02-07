import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateBody, createOrderSchema } from '../middleware/validate';
import { supabase } from '../config/supabase';
import { getSupabaseUserId } from '../services/userService';

export const orderRoutes = Router();

orderRoutes.use(authMiddleware);

// Create order from cart
orderRoutes.post('/', validateBody(createOrderSchema), async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { shippingAddressId } = req.body;

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (cartError) throw cartError;
    if (!cartItems?.length) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Calculate total
    const totalPrice = cartItems.reduce((sum, item) => {
      const price = item.products.discount_price || item.products.price;
      return sum + price * item.quantity;
    }, 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_price: totalPrice,
        shipping_address_id: shippingAddressId,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      price: item.products.discount_price || item.products.price,
      quantity: item.quantity,
      selected_options: item.selected_options,
    }));

    await supabase.from('order_items').insert(orderItems);

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', userId);

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Prepare order for payment (TossPayments integration)
// Creates a pending order without clearing the cart
orderRoutes.post('/prepare', async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { shippingAddressId, amount } = req.body;

    console.log('Prepare order request:', { userId, shippingAddressId, amount });

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (cartError) throw cartError;

    console.log('Cart items:', cartItems?.length || 0);

    if (!cartItems?.length) {
      console.log('Error: Cart is empty');
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Calculate total (including delivery fee if applicable)
    const totalPrice = cartItems.reduce((sum, item) => {
      const price = item.products.discount_price || item.products.price;
      return sum + price * item.quantity;
    }, 0);

    console.log('Amount validation:', { requestAmount: amount, calculatedTotal: totalPrice, difference: Math.abs(amount - totalPrice) });

    // Validate amount matches
    if (amount !== totalPrice && Math.abs(amount - totalPrice) > 3500) {
      // Allow 3500 won difference for delivery fee
      console.log('Error: Amount mismatch');
      res.status(400).json({ error: 'Amount mismatch' });
      return;
    }

    // Create pending order (cart is NOT cleared yet)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_price: amount, // Use the amount from client (includes delivery fee)
        shipping_address_id: shippingAddressId,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      price: item.products.discount_price || item.products.price,
      quantity: item.quantity,
      selected_options: item.selected_options,
    }));

    await supabase.from('order_items').insert(orderItems);

    res.status(201).json({ orderId: order.id });
  } catch (err) {
    console.error('Order prepare error:', err);
    res.status(500).json({ error: 'Failed to prepare order' });
  }
});

// Get user's orders
orderRoutes.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ orders: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});
