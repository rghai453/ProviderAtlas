import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

async function findUserByStripeCustomerId(
  customerId: string,
): Promise<typeof users.$inferSelect | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);
  return result[0] ?? null;
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const customerId = session.customer as string | null;
  if (!customerId) {
    console.error('[stripe-webhook] checkout.session.completed: missing customer ID');
    return;
  }

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) {
    console.error(
      `[stripe-webhook] checkout.session.completed: no user found for customer ${customerId}`,
    );
    return;
  }

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription?.id ?? null);

  await db
    .update(users)
    .set({
      subscriptionTier: 'pro',
      subscriptionId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = subscription.customer as string;

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) {
    console.error(
      `[stripe-webhook] customer.subscription.updated: no user found for customer ${customerId}`,
    );
    return;
  }

  const isActive =
    subscription.status === 'active' || subscription.status === 'trialing';

  await db
    .update(users)
    .set({
      subscriptionTier: isActive ? 'pro' : 'free',
      subscriptionId: subscription.id,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = subscription.customer as string;

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) {
    console.error(
      `[stripe-webhook] customer.subscription.deleted: no user found for customer ${customerId}`,
    );
    return;
  }

  await db
    .update(users)
    .set({
      subscriptionTier: 'free',
      subscriptionId: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
}

export async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.log(
    `[stripe-webhook] invoice.paid: invoice ${invoice.id} paid successfully for customer ${invoice.customer}`,
  );
}

export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  console.error(
    `[stripe-webhook] invoice.payment_failed: payment failed for invoice ${invoice.id}, customer ${invoice.customer}`,
  );
}
