import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, projects, projectContributors } from '@keep-playing/db';
import { projectCreateSchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { listVisibleProjects } from '@/lib/projects';

export const runtime = 'nodejs';

export async function GET() {
  const { user } = await requireUser();
  const rows = await listVisibleProjects(user);
  return NextResponse.json({ projects: rows });
}

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (!can('project.create', { userId: user.id, tier: user.tier })) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { title: 'Invalid project.', detail: parsed.error.message },
      { status: 400 },
    );
  }

  const exists = await db.select().from(projects).where(eq(projects.slug, parsed.data.slug)).limit(1);
  if (exists.length > 0) {
    return NextResponse.json({ title: 'That slug is already in use.' }, { status: 409 });
  }

  const inserted = await db
    .insert(projects)
    .values({ ...parsed.data, createdById: user.id, status: 'draft' })
    .returning();
  const project = inserted[0]!;

  // Creator becomes lead contributor.
  await db.insert(projectContributors).values({
    projectId: project.id,
    userId: user.id,
    role: 'lead',
  });

  await audit({
    userId: user.id,
    action: 'project.create',
    targetType: 'project',
    targetId: project.id,
    projectId: project.id,
    payload: { slug: project.slug },
  });

  return NextResponse.json({ id: project.id, slug: project.slug }, { status: 201 });
}
