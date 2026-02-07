import { Router } from 'express';
import { supabase } from '../config/supabase';

export const categoryRoutes = Router();

categoryRoutes.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ categories: data });
  } catch (err) {
    console.error('Categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
