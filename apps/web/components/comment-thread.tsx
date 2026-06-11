'use client';
import { useEffect, useState } from 'react';
import { Button, Textarea } from '@keep-playing/ui';

type Comment = {
  id: string;
  authorId: string;
  authorName?: string;
  body: string;
  createdAt: string;
};

export function CommentThread({
  targetType,
  targetId,
}: {
  targetType: 'project' | 'deliverable' | 'milestone' | 'voice_note';
  targetId: string;
}) {
  const [list, setList] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  async function load() {
    const res = await fetch(
      `/api/comments?targetType=${targetType}&targetId=${targetId}`,
    );
    if (res.ok) {
      const data = (await res.json()) as { comments: Comment[] };
      setList(data.comments);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [targetType, targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function post() {
    if (!body.trim()) return;
    setPosting(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, body }),
    });
    setPosting(false);
    if (res.ok) {
      setBody('');
      await load();
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
        Conversation
      </h3>
      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-strong">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id} className="rounded-md border border-edge card-quiet px-4 py-3">
              <p className="text-sm text-ink whitespace-pre-wrap">{c.body}</p>
              <p className="mt-2 text-xs text-muted">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a note..."
          rows={3}
        />
        <Button onClick={post} disabled={posting || !body.trim()}>
          {posting ? 'Posting...' : 'Comment'}
        </Button>
      </div>
    </div>
  );
}
