import { Router } from 'express';
import { supabase } from '../config/supabase';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export const paymentRoutes = Router();

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

// 결제 승인 API
paymentRoutes.post('/confirm', async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;

  if (!paymentKey || !orderId || !amount) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  try {
    // 1. Supabase에서 임시 주문 조회 (금액 검증)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      res.status(404).json({ error: 'Order not found or already processed' });
      return;
    }

    // 2. 금액 검증 (보안: 프론트에서 온 금액이 실제 주문 금액과 일치하는지 확인)
    if (order.total_price !== amount) {
      res.status(400).json({ error: 'Amount mismatch' });
      return;
    }

    // 3. 토스페이먼츠 결제 승인 API 호출
    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('TossPayments error:', tossData);
      res.status(tossResponse.status).json({
        error: 'Payment approval failed',
        code: tossData.code,
        message: tossData.message,
      });
      return;
    }

    // 4. 주문 상태 업데이트 (결제 완료)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_key: paymentKey,
        payment_method: tossData.method || 'card',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update error:', updateError);
      res.status(500).json({ error: 'Failed to update order status' });
      return;
    }

    // 5. 장바구니 비우기
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', order.user_id);

    if (cartError) {
      console.log('Cart clear warning:', cartError);
    }

    // 6. 성공 응답
    res.json({
      success: true,
      orderId: order.id,
      amount: order.total_price,
      method: tossData.method,
      approvedAt: tossData.approvedAt,
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
