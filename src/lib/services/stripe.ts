import { getStripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function createCheckoutSession({
  priceId,
  customerId,
  mode,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  customerId: string;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.create({
    customer: customerId,
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

export async function createCustomer({
  email,
  name,
  userId,
}: {
  email: string;
  name?: string;
  userId: string;
}): Promise<Stripe.Customer> {
  return getStripe().customers.create({ email, name, metadata: { userId } });
}
