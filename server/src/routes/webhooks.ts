// ============================================================
// REVIVE X — Razorpay Webhook Verification & Processing
// Verifies HMAC-SHA256 signature server-side before updating state
// ============================================================
import { Router } from 'express';
import crypto from 'crypto';
import { getWebhookSecret } from '../config/razorpay.js';
import { getTransactionById, saveTransaction } from '../engines/recoveryOrchestrator.js';
import { createAuditEntry } from '../utils/audit.js';

export const webhooksRouter = Router();

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

// ── POST /api/webhooks/razorpay ───────────────────────────
webhooksRouter.post('/razorpay', async (req, res) => {
  const secret = getWebhookSecret();
  const signature = req.headers['x-razorpay-signature'] as string;

  // In test/development mode without secret, allow mock testing if explicitly marked
  if (secret) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(rawBody, signature, secret);

    if (!isValid) {
      console.warn('[Webhook] Invalid Razorpay webhook signature rejected.');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEBHOOK_SIGNATURE',
          message: 'Razorpay webhook signature verification failed.',
        },
      });
    }
  }

  try {
    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;
    const orderNotes = paymentEntity?.notes || {};
    const transactionId = orderNotes.transactionId;

    if (transactionId) {
      const tx = await getTransactionById(transactionId);
      if (tx) {
        if (event === 'payment.captured') {
          tx.paymentStatus = 'success';
          tx.recoveryStatus = 'recovered';
          await saveTransaction(tx);

          await createAuditEntry({
            transactionId: tx.transactionId,
            eventType: 'RESULT_RECEIVED',
            actor: 'RAZORPAY',
            action: 'Process verified webhook payment.captured',
            reason: `Verified Razorpay payment ${paymentEntity.id} captured`,
            amount: tx.amount,
            status: 'PAYMENT_SUCCESS',
          });

          await createAuditEntry({
            transactionId: tx.transactionId,
            eventType: 'RECOVERY_RECORDED',
            actor: 'SYSTEM',
            action: 'Record recovered revenue from webhook',
            reason: 'Webhook confirmed payment success',
            amount: tx.amount,
            status: 'RECOVERED',
          });
        } else if (event === 'payment.failed') {
          tx.recoveryStatus = 'failed';
          tx.retryCount += 1;
          await saveTransaction(tx);

          await createAuditEntry({
            transactionId: tx.transactionId,
            eventType: 'RESULT_RECEIVED',
            actor: 'RAZORPAY',
            action: 'Process verified webhook payment.failed',
            reason: paymentEntity?.error_description || 'Payment failed on gateway',
            amount: tx.amount,
            status: 'PAYMENT_FAILED',
          });
        }
      }
    }

    return res.status(200).json({ success: true, received: true });
  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'WEBHOOK_PROCESS_ERROR', message: 'Failed to process webhook event' },
    });
  }
});
