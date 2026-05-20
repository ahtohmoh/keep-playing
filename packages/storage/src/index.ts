/**
 * Storage adapter.
 *
 * Two backends:
 *  - "r2": Cloudflare R2 (S3-compatible). Production default.
 *  - "local": files on disk under ./local-storage/. Dev convenience.
 *
 * Backend is selected by env. If R2 env vars are set, R2 is used; otherwise
 * local. This lets developers click through file uploads without provisioning
 * a bucket.
 */
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { createHmac, randomBytes } from 'node:crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type PresignedUpload = {
  key: string;
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers?: Record<string, string>;
};

export type Storage = {
  backend: 'r2' | 'local';
  presignedUpload(opts: { key: string; contentType?: string; ttlSeconds?: number }): Promise<PresignedUpload>;
  presignedDownload(opts: { key: string; ttlSeconds?: number }): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  publicUrl(key: string): string;
};

function r2Storage(): Storage {
  const bucket = process.env.R2_BUCKET!;
  const accountId = process.env.R2_ACCOUNT_ID!;
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return {
    backend: 'r2',
    async presignedUpload({ key, contentType, ttlSeconds = 600 }) {
      const url = await getSignedUrl(
        client,
        new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
        { expiresIn: ttlSeconds },
      );
      return {
        key,
        uploadUrl: url,
        method: 'PUT',
        headers: contentType ? { 'content-type': contentType } : undefined,
      };
    },
    async presignedDownload({ key, ttlSeconds = 600 }) {
      return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
        expiresIn: ttlSeconds,
      });
    },
    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
    async exists() {
      return true; // optimistic; full HEAD check is rarely worth the round-trip
    },
    publicUrl(key) {
      const base = process.env.R2_PUBLIC_URL ?? '';
      return base ? `${base.replace(/\/$/, '')}/${key}` : key;
    },
  };
}

function localStorage(): Storage {
  const root = resolve(process.cwd(), 'local-storage');
  const secret = process.env.AUTH_SECRET ?? 'dev-secret';

  function sign(key: string, exp: number): string {
    return createHmac('sha256', secret).update(`${key}.${exp}`).digest('base64url');
  }

  return {
    backend: 'local',
    async presignedUpload({ key, ttlSeconds = 600 }) {
      const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
      const sig = sign(`PUT:${key}`, exp);
      return {
        key,
        uploadUrl: `/api/local-storage/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}`,
        method: 'PUT',
      };
    },
    async presignedDownload({ key, ttlSeconds = 600 }) {
      const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
      const sig = sign(`GET:${key}`, exp);
      return `/api/local-storage/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}`;
    },
    async delete(key) {
      const path = join(root, key);
      try {
        const { unlink } = await import('node:fs/promises');
        await unlink(path);
      } catch {
        /* ignore */
      }
    },
    async exists(key) {
      try {
        await stat(join(root, key));
        return true;
      } catch {
        return false;
      }
    },
    publicUrl(key) {
      return `/api/local-storage/public/${encodeURIComponent(key)}`;
    },
  };
}

let _storage: Storage | null = null;
export function storage(): Storage {
  if (_storage) return _storage;
  const hasR2 =
    process.env.R2_BUCKET &&
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY;
  _storage = hasR2 ? r2Storage() : localStorage();
  return _storage;
}

/** Helpers for local-storage route handlers. */
export const localStore = {
  root: () => resolve(process.cwd(), 'local-storage'),
  verify(method: 'PUT' | 'GET', key: string, exp: number, sig: string): boolean {
    if (exp < Math.floor(Date.now() / 1000)) return false;
    const expected = createHmac('sha256', process.env.AUTH_SECRET ?? 'dev-secret')
      .update(`${method}:${key}.${exp}`)
      .digest('base64url');
    if (sig.length !== expected.length) return false;
    // timing-safe compare
    let r = 0;
    for (let i = 0; i < sig.length; i++) r |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return r === 0;
  },
  async write(key: string, data: Buffer): Promise<void> {
    const path = join(this.root(), key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
  },
  async read(key: string): Promise<Buffer> {
    return readFile(join(this.root(), key));
  },
};

/** Build a storage key for a deliverable. */
export function deliverableKey(opts: {
  projectId: string;
  deliverableId: string;
  version: number;
  filename: string;
}): string {
  const safe = opts.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
  return `deliverables/${opts.projectId}/${opts.deliverableId}/${opts.version}/${safe}`;
}

/** Build a storage key for a voice note. */
export function voiceNoteKey(noteId: string, ext = 'webm'): string {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `voice-notes/${year}/${month}/${noteId}.${ext}`;
}

/** Random id for a new object before the DB row exists. */
export function newObjectId(): string {
  return randomBytes(12).toString('hex');
}
