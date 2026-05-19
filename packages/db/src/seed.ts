/**
 * Seed the database.
 *
 * Inserts founder, initial Collective members, foundational projects, and the
 * knowledge base documents from `seeds/knowledge/`. Idempotent: safe to re-run.
 *
 * Usage: `pnpm db:seed`
 */
import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { db } from './client';
import { users, projects, knowledgeDocs } from './schema';

const __dirname = dirname(fileURLToPath(import.meta.url));

const seedUsers = [
  {
    email: 'krasumashi@ahtohmoh.com',
    fullName: 'Nai Kwashie Wyetey',
    displayName: 'Krasumashi',
    tier: 'founder' as const,
    craft: 'Creative Direction · Legacy Strategy',
    location: 'Accra, Ghana',
  },
  {
    email: 'chineyenwa@onuzika.com',
    fullName: 'Chineyenwa Okoro-Onu Wyetey',
    displayName: 'Chineyenwa',
    tier: 'resident' as const,
    craft: 'Partnership Lead — Piqabu',
    location: 'Accra, Ghana',
  },
];

const seedProjects = [
  {
    slug: 'piqabu',
    title: 'Piqabu',
    type: 'operational_sponsorship' as const,
    status: 'active' as const,
    description: 'Ephemeral, privacy-first messaging platform.',
    isExternalCommission: false,
  },
  {
    slug: 'deep-heritage-fields',
    title: 'Deep Heritage Fields',
    type: 'operational_sponsorship' as const,
    status: 'active' as const,
    description:
      'A new field treating African cultural traditions as substrates for sovereign computational systems.',
    isExternalCommission: false,
  },
  {
    slug: 'trotro-away',
    title: 'Trotro Away',
    artifactNumber: 1,
    type: 'artifact' as const,
    status: 'shipped' as const,
    description: 'A small game. A trotro lifts off from Accra and reaches for orbit.',
    isExternalCommission: false,
  },
  {
    slug: 'kente-logic',
    title: 'Kente Logic',
    artifactNumber: 2,
    type: 'artifact' as const,
    status: 'shipped' as const,
    description:
      'A generative engine that renders any image through the structural grammar of kente weaving.',
    isExternalCommission: false,
  },
];

async function seedKnowledge() {
  const dir = join(__dirname, '../seeds/knowledge');
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    console.log('No seeds/knowledge directory yet -- skipping knowledge seed.');
    return;
  }

  for (const file of files.filter((f) => f.endsWith('.md'))) {
    const body = await readFile(join(dir, file), 'utf-8');
    const slug = file.replace(/\.md$/, '');
    const titleLine = body.split('\n').find((l) => l.startsWith('# '));
    const title = titleLine?.replace(/^# /, '').trim() ?? slug;
    const category = slug.startsWith('agreement-')
      ? 'agreements'
      : slug.includes('brand') || slug.includes('strategy')
        ? 'strategy'
        : slug.includes('founding') || slug.includes('profile')
          ? 'founding'
          : 'operations';

    await db
      .insert(knowledgeDocs)
      .values({ slug, title, category, body, isPublic: false })
      .onConflictDoUpdate({
        target: knowledgeDocs.slug,
        set: { title, body, category, updatedAt: new Date() },
      });
    console.log(`  - ${slug}`);
  }
}

async function main() {
  console.log('Seeding users...');
  for (const u of seedUsers) {
    const existing = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
    if (existing.length === 0) {
      await db.insert(users).values(u);
      console.log(`  - ${u.displayName ?? u.fullName}`);
    } else {
      console.log(`  . ${u.displayName ?? u.fullName} (already present)`);
    }
  }

  console.log('Seeding projects...');
  const founder = await db.select().from(users).where(eq(users.email, seedUsers[0]!.email)).limit(1);
  const createdById = founder[0]?.id;
  if (!createdById) throw new Error('Founder user missing after seed.');

  for (const p of seedProjects) {
    const existing = await db.select().from(projects).where(eq(projects.slug, p.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(projects).values({ ...p, createdById });
      console.log(`  - ${p.title}`);
    } else {
      console.log(`  . ${p.title} (already present)`);
    }
  }

  console.log('Seeding knowledge base...');
  await seedKnowledge();

  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
