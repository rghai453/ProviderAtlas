import { auth } from '@/lib/auth/server';
import { getProviderByNpi } from '@/lib/services/providers';
import { getUserSubscriptionTier } from '@/lib/services/users';
import { z } from 'zod/v4';

const ContactRevealSchema = z.object({
  npi: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const tier = await getUserSubscriptionTier(session.user.id);
  if (tier !== 'pro') {
    return Response.json({ error: 'Pro subscription required' }, { status: 403 });
  }

  try {
    const { contactRevealRateLimit } = await import('@/lib/rate-limit');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
    const { success } = await contactRevealRateLimit.limit(ip);
    if (!success) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
  } catch {
    // Rate limiting unavailable
  }

  const body = await request.json();
  const parsed = ContactRevealSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const provider = await getProviderByNpi(parsed.data.npi);
  if (!provider) {
    return Response.json({ error: 'Provider not found' }, { status: 404 });
  }

  return Response.json({
    phone: provider.phone,
    fax: provider.fax,
    addressLine1: provider.addressLine1,
    addressLine2: provider.addressLine2,
    city: provider.city,
    state: provider.state,
    zip: provider.zip,
  });
}
