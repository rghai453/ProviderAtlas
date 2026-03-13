import { auth } from '@/lib/auth/server';
import { createCheckoutSession } from '@/lib/services/stripe';
import { getUserById } from '@/lib/services/users';
import { z } from 'zod/v4';

const CheckoutSchema = z.object({
  priceId: z.string(),
  mode: z.enum(['payment', 'subscription']),
});

export async function POST(request: Request): Promise<Response> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const user = await getUserById(session.user.id);
  if (!user?.stripeCustomerId) {
    return Response.json({ error: 'No billing account' }, { status: 400 });
  }

  const checkoutSession = await createCheckoutSession({
    priceId: parsed.data.priceId,
    customerId: user.stripeCustomerId,
    mode: parsed.data.mode,
    successUrl: `${request.headers.get('origin')}/dashboard/billing?success=true`,
    cancelUrl: `${request.headers.get('origin')}/pricing?canceled=true`,
  });

  return Response.json({ url: checkoutSession.url });
}
