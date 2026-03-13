import { auth } from '@/lib/auth/server';
import { createPortalSession } from '@/lib/services/stripe';
import { getUserById } from '@/lib/services/users';

export async function POST(request: Request): Promise<Response> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (!user?.stripeCustomerId) {
    return Response.json({ error: 'No billing account' }, { status: 400 });
  }

  const portalSession = await createPortalSession({
    customerId: user.stripeCustomerId,
    returnUrl: `${request.headers.get('origin')}/dashboard/billing`,
  });

  return Response.json({ url: portalSession.url });
}
