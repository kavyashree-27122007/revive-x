// ============================================================
// Unit Tests: Razorpay Webhook Signature Verification
// ============================================================
import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyWebhookSignature } from '../routes/webhooks.js';

describe('Webhook Verification', () => {
  const secret = 'rzp_test_webhook_secret_key_123';
  const payload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_H4x8918239',
          amount: 500000,
          currency: 'INR',
          status: 'captured',
          notes: { transactionId: 'TXN-TEST-001' },
        },
      },
    },
  });

  it('validates authentic signature generated with shared secret', () => {
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = verifyWebhookSignature(payload, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it('rejects tampered payload or forged signature', () => {
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const tamperedPayload = payload.replace('500000', '100000');
    const isValid = verifyWebhookSignature(tamperedPayload, validSignature, secret);
    expect(isValid).toBe(false);

    const isFakeSigValid = verifyWebhookSignature(payload, 'deadbeef1234567890abcdef', secret);
    expect(isFakeSigValid).toBe(false);
  });

  it('handles empty or missing signatures safely', () => {
    expect(verifyWebhookSignature(payload, '', secret)).toBe(false);
    expect(verifyWebhookSignature(payload, 'sig', '')).toBe(false);
  });
});
