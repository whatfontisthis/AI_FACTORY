/**
 * Cart Controller
 * Handles shopping cart operations for authenticated users
 */

const db = require('../database/db');

/**
 * Get user's cart
 * GET /api/cart
 */
exports.getCart = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const result = await db.query(
      `SELECT
        c.id,
        c.product_id,
        c.quantity,
        c.config,
        p.name,
        p.price,
        p.image_url,
        (p.price * c.quantity) as line_total
       FROM w4q2_cart_items c
       JOIN w4q2_products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const items = result.rows;
    const subtotal = items.reduce((sum, item) => parseFloat(item.line_total), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    res.json({
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * POST /api/cart/add
 * Body: { productId, quantity, config }
 */
exports.addItem = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { productId, quantity = 1, config = {} } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Check if product exists
    const productResult = await db.query(
      'SELECT id, name, price, in_stock FROM w4q2_products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    if (!product.in_stock) {
      return res.status(400).json({ error: 'Product is out of stock' });
    }

    // Check if item already exists in cart
    const existingResult = await db.query(
      'SELECT id, quantity FROM w4q2_cart_items WHERE user_id = $1 AND product_id = $2 AND config::text = $3::text',
      [userId, productId, JSON.stringify(config)]
    );

    if (existingResult.rows.length > 0) {
      // Update existing item
      const newQuantity = existingResult.rows[0].quantity + quantity;
      await db.query(
        'UPDATE w4q2_cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
        [newQuantity, existingResult.rows[0].id]
      );
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO w4q2_cart_items (user_id, product_id, quantity, config) VALUES ($1, $2, $3, $4)',
        [userId, productId, quantity, config]
      );
    }

    // Return updated cart
    const cartResult = await db.query(
      `SELECT
        c.id,
        c.product_id,
        c.quantity,
        c.config,
        p.name,
        p.price,
        p.image_url
       FROM w4q2_cart_items c
       JOIN w4q2_products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    const items = cartResult.rows;
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    res.json({
      success: true,
      cart: {
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 * PATCH /api/cart/update/:id
 * Body: { quantity }
 */
exports.updateItem = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const result = await db.query(
      'UPDATE w4q2_cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({
      success: true,
      item: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/remove/:id
 */
exports.removeItem = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM w4q2_cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear entire cart
 * DELETE /api/cart/clear
 */
exports.clearCart = async (req, res, next) => {
  try {
    const { userId } = req.user;

    await db.query(
      'DELETE FROM w4q2_cart_items WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};
