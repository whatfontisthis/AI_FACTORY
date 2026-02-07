import { Router } from 'express';
import { validateQuery, productsQuerySchema } from '../middleware/validate';
import { supabase } from '../config/supabase';

export const productRoutes = Router();

// List products with filtering and pagination
productRoutes.get('/', validateQuery(productsQuerySchema), async (req, res) => {
  try {
    const { category, search, sort, page = '1', limit = '20', min_price, max_price, min_rating, rocket_only } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('products')
      .select('*, categories(name)', { count: 'exact' });

    if (category) query = query.eq('category_id', category);
    if (search) query = query.ilike('name', `%${search}%`);
    if (min_price) query = query.gte('price', Number(min_price));
    if (max_price) query = query.lte('price', Number(max_price));
    if (min_rating) query = query.gte('rating', Number(min_rating));
    if (rocket_only === 'true') query = query.eq('is_rocket_delivery', true);
    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'rating') query = query.order('rating', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ products: data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
productRoutes.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ product: data });
  } catch (err) {
    console.error('Product detail error:', err);
    res.status(404).json({ error: 'Product not found' });
  }
});
