/**
 * Product Controller
 * Handles product catalog operations
 */

const db = require('../database/db');

/**
 * Get all products with optional category filter
 * GET /api/products?category=macbook-air
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM w4q2_products WHERE in_stock = true';
    const params = [];

    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    res.json({
      products: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM w4q2_products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Product not found');
      error.name = 'NotFoundError';
      throw error;
    }

    res.json({
      product: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 * GET /api/products/category/:category
 */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const result = await db.query(
      'SELECT * FROM w4q2_products WHERE category = $1 AND in_stock = true ORDER BY price ASC',
      [category]
    );

    res.json({
      category,
      products: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories
 * GET /api/products/categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT category,
              COUNT(*) as product_count,
              MIN(price) as min_price,
              MAX(price) as max_price
       FROM w4q2_products
       WHERE in_stock = true
       GROUP BY category
       ORDER BY category`
    );

    res.json({
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
};
