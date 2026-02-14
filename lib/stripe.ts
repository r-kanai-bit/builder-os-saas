import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  standard: {
    name: "Builder OS",
    priceId: process.env.STRIPE_PRICE_STANDARD ?? "",
    price: 5000,
    maxUsers: -1, // unlimited
    storage: "無制限",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
