import { auth } from '@/lib/auth/server';
import { generateExportCsv } from '@/lib/services/exports';
import { getUserSubscriptionTier } from '@/lib/services/users';
import { exportRateLimit } from '@/lib/rate-limit';
import { exportFiltersSchema } from '@/lib/validations/exports';

export async function POST(request: Request): Promise<Response> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const tier = await getUserSubscriptionTier(session.user.id);
  if (tier !== 'pro') {
    return Response.json({ error: 'Pro subscription required' }, { status: 403 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';

  const { success } = await exportRateLimit.limit(ip);
  if (!success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const body = await request.json();
  const parsed = exportFiltersSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const csv = await generateExportCsv(parsed.data);

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="providers.csv"',
    },
  });
}
