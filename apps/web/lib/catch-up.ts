/**
 * The async loop.
 *
 * "Since you were here" is built from the audit log (rows carrying projectId),
 * filtered to projects the member can see, sliced at their per-project
 * last-seen markers. Quiet by design: it reports what moved, it does not
 * demand anything.
 */
import { and, desc, eq, inArray, isNotNull, ne, sql } from 'drizzle-orm';
import {
  db,
  auditLog,
  projectContributors,
  projects,
  projectSeen,
  users,
  type User,
} from '@keep-playing/db';

export type CatchUpItem = {
  id: string;
  action: string;
  actorName: string | null;
  projectId: string;
  projectTitle: string | null;
  projectSlug: string | null;
  summary: string;
  at: Date;
};

/** Mark a project surface as seen. Upsert; call from project pages. */
export async function markProjectSeen(userId: string, projectId: string): Promise<void> {
  await db
    .insert(projectSeen)
    .values({ userId, projectId, lastSeenAt: new Date() })
    .onConflictDoUpdate({
      target: [projectSeen.userId, projectSeen.projectId],
      set: { lastSeenAt: new Date() },
    });
}

/** Project ids visible to this member, by tier. */
export async function visibleProjectIds(user: User): Promise<string[]> {
  if (user.tier === 'founder' || user.tier === 'resident') {
    const all = await db.select({ id: projects.id }).from(projects);
    return all.map((r) => r.id);
  }
  const mine = await db
    .select({ id: projectContributors.projectId })
    .from(projectContributors)
    .where(eq(projectContributors.userId, user.id));
  return mine.map((r) => r.id);
}

const ACTION_SUMMARY: Record<string, string> = {
  'project.create': 'started the project',
  'project.update': 'updated the project',
  'project.contributor.add': 'joined the team',
  'project.contributor.remove': 'left the team',
  'milestone.create': 'added a milestone',
  'milestone.edit': 'reshaped a milestone',
  'milestone.complete': 'completed a milestone',
  'milestone.delete': 'removed a milestone',
  'deliverable.init': 'uploaded a deliverable',
  'deliverable.delete': 'removed a deliverable',
  'comment.create': 'left a comment',
  'voicenote.create': 'left a voice note',
  'brief.update': 'revised the brief',
  'decision.create': 'recorded a decision',
};

/**
 * Everything that happened in the member's visible projects since their
 * per-project last-seen marks. Capped, newest first.
 */
export async function catchUp(user: User, limit = 30): Promise<CatchUpItem[]> {
  const ids = await visibleProjectIds(user);
  if (ids.length === 0) return [];

  const seen = await db.select().from(projectSeen).where(eq(projectSeen.userId, user.id));
  const seenMap = new Map(seen.map((s) => [s.projectId, s.lastSeenAt]));

  const rows = await db
    .select({
      log: auditLog,
      actorDisplay: users.displayName,
      actorFull: users.fullName,
      projectTitle: projects.title,
      projectSlug: projects.slug,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .leftJoin(projects, eq(auditLog.projectId, projects.id))
    .where(
      and(
        isNotNull(auditLog.projectId),
        inArray(auditLog.projectId, ids),
        ne(auditLog.userId, user.id),
      ),
    )
    .orderBy(desc(auditLog.createdAt))
    .limit(200);

  const items: CatchUpItem[] = [];
  for (const row of rows) {
    const pid = row.log.projectId!;
    const lastSeen = seenMap.get(pid);
    if (lastSeen && row.log.createdAt <= lastSeen) continue;
    items.push({
      id: row.log.id,
      action: row.log.action,
      actorName: row.actorDisplay ?? row.actorFull ?? null,
      projectId: pid,
      projectTitle: row.projectTitle,
      projectSlug: row.projectSlug,
      summary: ACTION_SUMMARY[row.log.action] ?? row.log.action.replace(/[._]/g, ' '),
      at: row.log.createdAt,
    });
    if (items.length >= limit) break;
  }
  return items;
}

/** Unread set for the project list: projectIds with activity since last seen. */
export async function unreadProjects(user: User): Promise<Set<string>> {
  const ids = await visibleProjectIds(user);
  if (ids.length === 0) return new Set();

  const seen = await db.select().from(projectSeen).where(eq(projectSeen.userId, user.id));
  const seenMap = new Map(seen.map((s) => [s.projectId, s.lastSeenAt]));

  const latest = await db
    .select({
      projectId: auditLog.projectId,
      lastActivity: sql<string>`max(${auditLog.createdAt})`.as('last_activity'),
    })
    .from(auditLog)
    .where(
      and(
        isNotNull(auditLog.projectId),
        inArray(auditLog.projectId, ids),
        ne(auditLog.userId, user.id),
      ),
    )
    .groupBy(auditLog.projectId);

  const unread = new Set<string>();
  for (const row of latest) {
    if (!row.projectId) continue;
    const lastSeen = seenMap.get(row.projectId);
    if (!lastSeen || new Date(row.lastActivity) > lastSeen) {
      unread.add(row.projectId);
    }
  }
  return unread;
}
