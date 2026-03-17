import { auth } from '@/lib/auth/server';
import { createAlert, getAlertsByUser } from '@/lib/services/alerts';
import { getUserById } from '@/lib/services/users';
import { z } from 'zod/v4';

const CreateAlertSchema = z.object({
  name: z.string().min(1).max(100),
  query: z.object({
    specialty: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
  }),
});

export async function GET(request: Request): Promise<Response> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (user?.subscriptionTier !== 'pro') {
    return Response.json({ error: 'Pro subscription required' }, { status: 403 });
  }

  const userAlerts = await getAlertsByUser(session.user.id);

  return Response.json({ alerts: userAlerts });
}

export async function POST(request: Request): Promise<Response> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (user?.subscriptionTier !== 'pro') {
    return Response.json({ error: 'Pro subscription required' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = CreateAlertSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const alert = await createAlert({
    userId: session.user.id,
    name: parsed.data.name,
    query: parsed.data.query,
    active: true,
  });

  return Response.json({ alert }, { status: 201 });
}
