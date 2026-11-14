import type { BillingCycle, PaymentProvider, PlanId } from '@/types';

/**
 * Payment adapter layer.
 *
 * This module defines the single seam between the app and a payment provider.
 * Nothing here charges anyone: it validates configuration and produces the
 * request that a real Paystack or Stripe checkout would need. Wire the real
 * keys in at build time (see `.env.example`) and implement `beginCheckout`
 * against the provider SDK/API to go live.
 */

export interface PaymentConfig {
  provider: PaymentProvider;
  publicKey: string | null;
  currency: 'NGN' | 'USD';
  configured: boolean;
}

export interface CheckoutRequest {
  provider: Exclude<PaymentProvider, null>;
  planId: PlanId;
  billingCycle: BillingCycle;
  amount: number;
  currency: 'NGN' | 'USD';
  reference: string;
  email: string;
  callbackUrl: string;
}

export interface CheckoutResult {
  ok: boolean;
  /** Populated when the provider is fully configured and a redirect is possible. */
  checkoutUrl?: string;
  reference: string;
  message: string;
}

const env = (key: string): string | null => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return value && value.trim() ? value.trim() : null;
};

export function getPaymentConfig(): PaymentConfig {
  const stripeKey = env('VITE_STRIPE_PUBLIC_KEY');
  const paystackKey = env('VITE_PAYSTACK_PUBLIC_KEY');
  const currency = (env('VITE_BILLING_CURRENCY') as 'NGN' | 'USD') ?? (paystackKey ? 'NGN' : 'USD');

  if (stripeKey) {
    return { provider: 'stripe', publicKey: stripeKey, currency: 'USD', configured: true };
  }
  if (paystackKey) {
    return { provider: 'paystack', publicKey: paystackKey, currency, configured: true };
  }
  return { provider: null, publicKey: null, currency, configured: false };
}

export function buildReference(planId: PlanId, cycle: BillingCycle): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CK-${planId.toUpperCase()}-${cycle.toUpperCase()}-${stamp}${rand}`;
}

export function buildCheckoutRequest(args: {
  planId: PlanId;
  billingCycle: BillingCycle;
  amount: number;
  email: string;
}): CheckoutRequest | { error: string } {
  const config = getPaymentConfig();
  if (!config.provider) {
    return {
      error:
        'No payment provider is configured. Add VITE_PAYSTACK_PUBLIC_KEY or VITE_STRIPE_PUBLIC_KEY to enable checkout.',
    };
  }
  return {
    provider: config.provider,
    planId: args.planId,
    billingCycle: args.billingCycle,
    amount: args.amount,
    currency: config.currency,
    reference: buildReference(args.planId, args.billingCycle),
    email: args.email,
    callbackUrl: `${window.location.origin}/app/billing/callback`,
  };
}

/**
 * Starts a checkout. Until a provider key is configured this resolves to a
 * clearly-labelled dry-run so the upgrade flow can be exercised end to end
 * without pretending a payment happened.
 */
export async function beginCheckout(args: {
  planId: PlanId;
  billingCycle: BillingCycle;
  amount: number;
  email: string;
}): Promise<CheckoutResult> {
  const request = buildCheckoutRequest(args);
  if ('error' in request) {
    return {
      ok: false,
      reference: '',
      message: request.error,
    };
  }

  // Real integration point:
  //   Paystack -> window.PaystackPop.setup({ ...request, callback })
  //   Stripe   -> stripe.redirectToCheckout({ lineItems, mode: 'subscription' })
  // Until then, return the prepared request so the UI can show exactly what
  // would be sent to the provider.
  return {
    ok: true,
    reference: request.reference,
    message: `Checkout prepared with ${request.provider}. Reference ${request.reference}.`,
  };
}

export function providerLabel(provider: PaymentProvider): string {
  if (provider === 'stripe') return 'Stripe';
  if (provider === 'paystack') return 'Paystack';
  return 'Not connected';
}
