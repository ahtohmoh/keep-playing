import { desc, eq } from 'drizzle-orm';
import { db, notifications } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { MarkAllRead } from './mark-all-read';

export default async function NotificationsPage() {
  const { user } = await requireUser();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  const unread = rows.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <Heading level={2}>Notifications</Heading>
        {unread > 0 && <MarkAllRead />}
      </div>
      <Prose className="mt-3 text-muted-strong">
        <p>
          {rows.length === 0
            ? 'Nothing here yet.'
            : `${unread > 0 ? `${unread} unread of ${rows.length}` : `${rows.length} notification${rows.length === 1 ? '' : 's'}`}.`}
        </p>
      </Prose>

      <ul className="mt-8 space-y-3">
        {rows.map((n) => (
          <li
            key={n.id}
            className={`rounded-md border p-4 ${
              n.read ? 'border-hairline card-quiet' : 'border-hairline-strong bg-paper2'
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <span className="text-xs text-muted">
                {new Date(n.createdAt).toLocaleDateString('en-GB', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            {n.body && <p className="mt-1 text-sm text-muted-strong">{n.body}</p>}
            {n.link && (
              <a
                href={n.link}
                className="mt-2 inline-block text-sm text-accent hover:opacity-80 transition-opacity"
              >
                Open →
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
