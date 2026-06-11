import { NextResponse } from 'next/server';
import { and, eq, ilike, inArray, or } from 'drizzle-orm';
import { db, knowledgeDocs, projects, users } from '@keep-playing/db';
import { requireUser } from '@/lib/session';
import { visibleProjectIds } from '@/lib/catch-up';

export const runtime = 'nodejs';

/**
 * Palette search. Tier-aware, capped, fast. Postgres ILIKE for Stage 1.5;
 * pgvector semantic search upgrades this in place when the extension lands.
 */
export async function GET(req: Request) {
  const { user } = await requireUser();
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  const pattern = `%${q}%`;
  const ids = await visibleProjectIds(user);

  const [projectRows, memberRows, knowledgeRows] = await Promise.all([
    ids.length === 0
      ? Promise.resolve([])
      : db
          .select({
            id: projects.id,
            slug: projects.slug,
            title: projects.title,
            description: projects.description,
          })
          .from(projects)
          .where(
            and(
              inArray(projects.id, ids),
              or(ilike(projects.title, pattern), ilike(projects.description, pattern)),
            ),
          )
          .limit(6),
    ['founder', 'resident', 'fellow', 'correspondent'].includes(user.tier)
      ? db
          .select({
            id: users.id,
            fullName: users.fullName,
            displayName: users.displayName,
            craft: users.craft,
          })
          .from(users)
          .where(
            and(
              eq(users.active, true),
              or(
                ilike(users.fullName, pattern),
                ilike(users.displayName, pattern),
                ilike(users.craft, pattern),
              ),
            ),
          )
          .limit(5)
      : Promise.resolve([]),
    user.tier === 'external_collaborator'
      ? Promise.resolve([])
      : db
          .select({
            id: knowledgeDocs.id,
            slug: knowledgeDocs.slug,
            title: knowledgeDocs.title,
            category: knowledgeDocs.category,
          })
          .from(knowledgeDocs)
          .where(or(ilike(knowledgeDocs.title, pattern), ilike(knowledgeDocs.body, pattern)))
          .limit(5),
  ]);

  return NextResponse.json({
    results: [
      ...projectRows.map((p) => ({
        kind: 'project' as const,
        title: p.title,
        detail: p.description ?? undefined,
        href: `/projects/${p.slug}`,
      })),
      ...memberRows.map((m) => ({
        kind: 'member' as const,
        title: m.displayName ?? m.fullName,
        detail: m.craft ?? undefined,
        href: `/members/${m.id}`,
      })),
      ...knowledgeRows.map((k) => ({
        kind: 'knowledge' as const,
        title: k.title,
        detail: k.category,
        href: `/knowledge/${k.slug}`,
      })),
    ],
  });
}
