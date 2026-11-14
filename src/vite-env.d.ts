/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
  readonly VITE_BILLING_CURRENCY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
