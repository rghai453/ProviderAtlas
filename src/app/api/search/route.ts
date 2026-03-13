import { searchProviders } from '@/lib/services/providers';
import { searchRateLimit } from '@/lib/rate-limit';
import { z } from 'zod/v4';

const SearchSchema = z.object({
  name: z.string().optional(),
  specialty: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
});

export async function GET(request: Request): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';

  const { success } = await searchRateLimit.limit(ip);
  if (!success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);

  const parsed = SearchSchema.safeParse({
    name: searchParams.get('name') ?? undefined,
    specialty: searchParams.get('specialty') ?? undefined,
    city: searchParams.get('city') ?? undefined,
    zip: searchParams.get('zip') ?? undefined,
    page: searchParams.get('page') ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const results = await searchProviders(parsed.data);

  return Response.json(results);
}
