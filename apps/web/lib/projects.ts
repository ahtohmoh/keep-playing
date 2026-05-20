/**
 * Project-shaped queries. Tier-aware: each call returns only what the viewer
 * can see, computed from the permission matrix.
 */
import 'server-only';
import { and, eq, desc, inArray, or } from 'drizzle-orm';
import { db, projects, projectContributors, users, type Project } from '@keep-playing/db';
import type { Tier, ContributionRole } from '@keep-playing/shared';

export async function listVisibleProjects(viewer: { id: string; tier: Tier }) {
  if (viewer.tier === 'founder' || viewer.tier === 'resident') {
    return db
      .select()
      .from(projects)
      .where(eq(projects.status as never, projects.status))
      .orderBy(desc(projects.updatedAt));
  }
  // Fellows + Externals see only projects they contribute to.
  const memberships = await db
    .select({ projectId: projectContributors.projectId })
    .from(projectContributors)
    .where(eq(projectContributors.userId, viewer.id));
  const ids = memberships.map((m) => m.projectId);
  if (ids.length === 0) return [];
  return db
    .select()
    .from(projects)
    .where(inArray(projects.id, ids))
    .orderBy(desc(projects.updatedAt));
}

export type ProjectMembership = {
  isContributor: boolean;
  role: ContributionRole | null;
};

export async function getMembershipFor(
  projectId: string,
  userId: string,
): Promise<ProjectMembership> {
  const rows = await db
    .select({ role: projectContributors.role })
    .from(projectContributors)
    .where(
      and(
        eq(projectContributors.projectId, projectId),
        eq(projectContributors.userId, userId),
      ),
    )
    .limit(1);
  if (rows.length === 0) return { isContributor: false, role: null };
  return { isContributor: true, role: rows[0]!.role };
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getContributorsForProject(projectId: string) {
  return db
    .select({
      userId: projectContributors.userId,
      role: projectContributors.role,
      joinedAt: projectContributors.joinedAt,
      user: users,
    })
    .from(projectContributors)
    .innerJoin(users, eq(projectContributors.userId, users.id))
    .where(eq(projectContributors.projectId, projectId));
}
