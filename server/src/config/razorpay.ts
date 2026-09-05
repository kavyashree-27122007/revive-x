// ============================================================
// REVIVE X — Razorpay Client Factory
// Returns test-mode client or null for mock mode.
// Secure: Key secret is NEVER exposed to the frontend.
// ============================================================
import Razorpay from 'razorpay';

export type RazorpayMode = 'test_mode' | 'mock_mode';

let razorpayClient: Razorpay | null = null;
let mode: RazorpayMode = 'mock_mode';

export function initRazorpay(): void {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (keyId && keySecret && keyId !== 'rzp_test_xxxx' && keySecret !== 'xxxx') {
    try {
      razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      mode = 'test_mode';
      console.info('[Razorpay] Valid credentials detected — running in RAZORPAY TEST MODE');
    } catch (err) {
      console.warn('[Razorpay] Client initialization failed, falling back to MOCK MODE:', err);
      mode = 'mock_mode';
      razorpayClient = null;
    }
  } else {
    console.info('[Razorpay] Test credentials not configured — running in clearly labelled MOCK PAYMENT MODE');
    mode = 'mock_mode';
    razorpayClient = null;
  }
}

export function getRazorpayClient(): Razorpay | null {
  return razorpayClient;
}

export function getRazorpayMode(): RazorpayMode {
  return mode;
}

/**
 * Public key ID is safe for frontend checkout JS.
 * Key secret is NEVER returned.
 */
export function getRazorpayKeyIdPublic(): string | null {
  if (mode === 'test_mode') {
    return process.env.RAZORPAY_KEY_ID ?? null;
  }
  return null;
}

export function getRazorpayKeySecret(): string | null {
  return process.env.RAZORPAY_KEY_SECRET ?? null;
}

export function getWebhookSecret(): string | null {
  return process.env.RAZORPAY_WEBHOOK_SECRET ?? null;
}
