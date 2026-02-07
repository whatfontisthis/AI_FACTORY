import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateBody, addToCartSchema, updateCartSchema } from '../middleware/validate';
import { supabase } from '../config/supabase';
import { getSupabaseUserId } from '../services/userService';

export const cartRoutes = Router();

cartRoutes.use(authMiddleware);

// Get user's cart
cartRoutes.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ items: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
cartRoutes.post('/', validateBody(addToCartSchema), async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { productId, quantity, selectedOptions } = req.body;

    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          quantity,
          selected_options: selectedOptions || null,
        },
        { onConflict: 'user_id,product_id' },
      )
      .select('*, products(*)')
      .single();

    if (error) throw error;
    res.json({ item: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update quantity
cartRoutes.patch('/:id', validateBody(updateCartSchema), async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { quantity } = req.body;

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ item: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove from cart
cartRoutes.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});
