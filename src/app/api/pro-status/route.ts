import { auth } from '@/lib/auth/server';
import { getUserSubscriptionTier } from '@/lib/services/users';

export async function GET(): Promise<Response> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ isPro: false });
  }

  const tier = await getUserSubscriptionTier(session.user.id);
  return Response.json({ isPro: tier === 'pro' });
}
