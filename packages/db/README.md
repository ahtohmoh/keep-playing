# @keep-playing/db

The shape of the world. Drizzle schema, migrations, and seed data for Keep Playing.

## Quick reference

```bash
pnpm db:generate    # Generate a new migration from schema changes
pnpm db:migrate     # Run pending migrations
pnpm db:seed        # Seed users, projects, knowledge base
pnpm db:studio      # Open Drizzle Studio
```

## Schema source

The single source of truth is [`src/schema.ts`](src/schema.ts). It corresponds line-for-line with §4 of the build spec.

Edit the schema. Generate a migration. Run it. Never edit migration files by hand once committed.

## Local Postgres

```bash
docker run --name keep-playing-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=keep_playing \
  -p 5432:5432 -d postgres:16
```

Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/keep_playing` in `.env.local`.

## Production database

Neon (Postgres-as-a-service). Pro tier in production for the daily backups. The connection string goes in `DATABASE_URL`. For migrations, use the direct (non-pooled) URL in `DIRECT_DATABASE_URL`.

## Adding a knowledge document

Drop a markdown file in [`seeds/knowledge/`](seeds/knowledge/). The first `# Heading` line becomes the title. The filename (without `.md`) becomes the slug. Re-run `pnpm db:seed`.

Visibility is set per document in the seed script. By default, knowledge docs are not public — only Collective members see them.
