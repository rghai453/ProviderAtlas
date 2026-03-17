import { searchProviders, autocompleteProviders } from '@/lib/services/providers';
import { z } from 'zod/v4';
import { auth } from '@/lib/auth/server';
import { getUserSubscriptionTier } from '@/lib/services/users';
import { FREE_SEARCH_MAX_PAGES } from '@/lib/tier-limits';

const SearchSchema = z.object({
  name: z.string().optional(),
  specialty: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export async function GET(request: Request): Promise<Response> {
  // Rate limiting — skip if Upstash not configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  if (redisUrl && !redisUrl.includes('placeholder')) {
    try {
      const { searchRateLimit } = await import('@/lib/rate-limit');
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
      const { success } = await searchRateLimit.limit(ip);
      if (!success) {
        return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
    } catch {
      // Rate limiting unavailable — continue without it
    }
  }

  const { searchParams } = new URL(request.url);

  const parsed = SearchSchema.safeParse({
    name: searchParams.get('name') ?? undefined,
    specialty: searchParams.get('specialty') ?? undefined,
    city: searchParams.get('city') ?? undefined,
    zip: searchParams.get('zip') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Fast path for autocomplete (limit param = live search dropdown)
  if (parsed.data.limit && parsed.data.name) {
    const rows = await autocompleteProviders(parsed.data.name, parsed.data.limit);
    return Response.json({ providers: rows });
  }

  // Enforce page limit for non-Pro users
  if (parsed.data.page > FREE_SEARCH_MAX_PAGES) {
    let isPro = false;
    try {
      const { data: session } = await auth.getSession();
      if (session?.user) {
        const tier = await getUserSubscriptionTier(session.user.id);
        isPro = tier === 'pro';
      }
    } catch {
      // Auth unavailable
    }
    if (!isPro) {
      return Response.json(
        { error: 'Upgrade to Pro for unlimited results', upgradeRequired: true },
        { status: 403 },
      );
    }
  }

  const results = await searchProviders({
    ...parsed.data,
    pageSize: parsed.data.limit,
  });

  return Response.json(results);
}
