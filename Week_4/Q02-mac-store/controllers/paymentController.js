/**
 * Payment Controller
 * Handles checkout and Toss Payments integration
 */

const axios = require('axios');
const db = require('../database/db');

// USD to KRW exchange rate (approximate)
const USD_TO_KRW = 1450;

/**
 * Create checkout session and order
 * POST /api/checkout/create
 * Body: { shippingAddress: { name, address, city, zip, phone } }
 */
exports.createCheckout = async (req, res, next) => {
  const client = await db.getClient();

  try {
    const { userId, email } = req.user;
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address) {
      return res.status(400).json({
        error: 'Complete shipping address is required'
      });
    }

    await client.query('BEGIN');

    // Get cart items
    const cartResult = await client.query(
      `SELECT
        c.id as cart_item_id,
        c.product_id,
        c.quantity,
        c.config,
        p.name,
        p.price
       FROM w4q2_cart_items c
       JOIN w4q2_products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const items = cartResult.rows;
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO w4q2_orders (user_id, subtotal, tax, total_amount, shipping_address, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, created_at`,
      [userId, subtotal, tax, total, shippingAddress]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of items) {
      await client.query(
        `INSERT INTO w4q2_order_items (order_id, product_id, product_name, quantity, unit_price, config)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.name, item.quantity, item.price, item.config]
      );
    }

    await client.query('COMMIT');

    // Prepare order name for Toss
    const orderName = items.length === 1
      ? items[0].name
      : `${items[0].name} 외 ${items.length - 1}건`;

    const amountKRW = Math.round(total * USD_TO_KRW);

    res.json({
      orderId: order.id,
      amount: amountKRW,
      amountUSD: total,
      orderName,
      customerName: shippingAddress.name,
      customerEmail: email
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Confirm Toss payment
 * POST /api/payment/toss/confirm
 * Body: { paymentKey, orderId, amount }
 */
exports.confirmTossPayment = async (req, res, next) => {
  const client = await db.getClient();

  try {
    const { userId } = req.user;
    const { paymentKey, orderId, amount } = req.body;

    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({
        error: 'Missing required payment parameters'
      });
    }

    // Verify order belongs to user
    const orderCheck = await db.query(
      'SELECT id, total_amount, status FROM w4q2_orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderCheck.rows[0];

    // If already paid, return success (handles duplicate confirm calls)
    if (order.status === 'paid') {
      return res.json({
        success: true,
        order: { id: orderId, status: 'paid' }
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        error: `Order already ${order.status}`
      });
    }

    // Verify amount matches (order stores USD, Toss uses KRW)
    const expectedKRW = Math.round(parseFloat(order.total_amount) * USD_TO_KRW);
    if (expectedKRW !== parseInt(amount)) {
      return res.status(400).json({
        error: 'Amount mismatch'
      });
    }

    // Confirm payment with Toss API
    const tossSecretKey = process.env.TOSS_SECRET_KEY;

    if (!tossSecretKey) {
      return res.status(500).json({
        error: 'Toss Payments not configured on server'
      });
    }

    const tossResponse = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        paymentKey,
        orderId,
        amount
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    await client.query('BEGIN');

    // Update order status
    await client.query(
      `UPDATE w4q2_orders
       SET status = 'paid',
           payment_id = $1,
           payment_method = $2,
           paid_at = NOW()
       WHERE id = $3`,
      [paymentKey, tossResponse.data.method, orderId]
    );

    // Clear user's cart
    await client.query(
      'DELETE FROM w4q2_cart_items WHERE user_id = $1',
      [userId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      order: {
        id: orderId,
        status: 'paid',
        paymentMethod: tossResponse.data.method,
        paidAt: new Date().toISOString()
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.response) {
      // Toss API error
      console.error('Toss API error:', error.response.data);
      const tossCode = error.response.data.code;

      // If Toss says it's already processing/confirmed, check our DB
      if (tossCode === 'FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING' ||
          tossCode === 'ALREADY_PROCESSED_PAYMENT') {
        const recheck = await db.query(
          'SELECT status FROM w4q2_orders WHERE id = $1',
          [req.body.orderId]
        );
        if (recheck.rows[0]?.status === 'paid') {
          return res.json({
            success: true,
            order: { id: req.body.orderId, status: 'paid' }
          });
        }
      }

      return res.status(400).json({
        error: error.response.data.message || 'Payment verification failed'
      });
    }

    next(error);
  } finally {
    client.release();
  }
};

/**
 * Toss webhook handler
 * POST /api/payment/webhook
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const { eventType, data } = req.body;

    console.log('📩 Toss webhook received:', eventType);

    // Handle different event types
    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
        // Payment confirmed by Toss
        console.log('✅ Payment confirmed:', data.orderId);
        break;

      case 'PAYMENT_CANCELLED':
        // Payment cancelled
        await db.query(
          "UPDATE w4q2_orders SET status = 'cancelled' WHERE id = $1",
          [data.orderId]
        );
        break;

      default:
        console.log('Unknown event type:', eventType);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order details
 * GET /api/orders/:id
 */
exports.getOrder = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const orderResult = await db.query(
      'SELECT * FROM w4q2_orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await db.query(
      'SELECT * FROM w4q2_order_items WHERE order_id = $1',
      [id]
    );

    res.json({
      order,
      items: itemsResult.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's order history
 * GET /api/orders
 */
exports.getOrders = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const result = await db.query(
      `SELECT id, total_amount, status, created_at, paid_at
       FROM w4q2_orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      orders: result.rows
    });
  } catch (error) {
    next(error);
  }
};
