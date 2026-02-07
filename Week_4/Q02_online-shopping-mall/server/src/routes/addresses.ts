import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateBody, createAddressSchema } from '../middleware/validate';
import { supabase } from '../config/supabase';
import { getSupabaseUserId } from '../services/userService';

export const addressRoutes = Router();

addressRoutes.use(authMiddleware);

// Get user's addresses
addressRoutes.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    res.json({ addresses: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Create address
addressRoutes.post('/', validateBody(createAddressSchema), async (req: AuthRequest, res) => {
  try {
    const userId = await getSupabaseUserId(req.uid!);
    const { label, recipient, phone, zipCode, address1, address2, isDefault } = req.body;

    // If setting as default, unset other defaults first
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        label,
        recipient,
        phone,
        zip_code: zipCode,
        address1,
        address2,
        is_default: isDefault || false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ address: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create address' });
  }
});
