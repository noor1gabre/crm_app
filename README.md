# Coil CRM — Module 1 Learning Project

A minimal CRM app writing directly to Amazon RDS PostgreSQL. This is the
OLTP source for the CDC → Iceberg streaming pipeline you'll build in later
modules. Every create, stage change, and delete here becomes a row in the
Postgres WAL.

## Stack
- Next.js 16 (App Router, Server Actions)
- Prisma ORM
- Tailwind CSS v4
- PostgreSQL (Amazon RDS)

## Prerequisites
- Node.js 18+
- An Amazon RDS PostgreSQL instance (see Module 1 doc for setup steps —
  free tier `db.t3.micro` is enough)
- `rds.logical_replication` enabled on the instance (needed for the next
  module's CDC pipeline, doesn't affect this app)

## Setup

1. Install dependencies (this also runs `prisma generate`):
   ```bash
   npm install
   ```

2. Copy the env example and fill in your RDS connection string:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@your-rds-endpoint.rds.amazonaws.com:5432/crmdb?schema=public"
   ```

3. Push the schema to your RDS database (creates the tables):
   ```bash
   npm run db:push
   ```
   This creates `companies`, `contacts`, `deals`, and `activities` tables
   matching the schema in `prisma/schema.prisma`.

4. (Optional) Browse your data with Prisma Studio:
   ```bash
   npm run db:studio
   ```

5. Run the app:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## What generates CDC-relevant events

| Action in the app | SQL event | Table |
|---|---|---|
| Add company / contact / deal | `INSERT` | companies / contacts / deals |
| Change a deal's stage (dropdown on Deals page) | `UPDATE` | deals |
| Delete a deal | `DELETE` | deals |
| Log an activity | `INSERT` | activities |

Use the Deals page to move deals through `prospecting → qualified →
proposal → won/lost` — these stage-change UPDATEs are exactly the kind of
event your Bronze (append-only) and Silver/ODS (upsert) tables need to
handle correctly downstream.

## Schema

See `prisma/schema.prisma` for the full model. Summary:
- **companies** — accounts you sell to
- **contacts** — people at those accounts
- **deals** — pipeline opportunities with a `stage` field
- **activities** — calls/emails/meetings/notes logged against a deal

## Security note

This is a learning project. The setup steps in Module 1 make the RDS
instance publicly accessible with a permissive security group so you can
connect from your laptop easily. Never do this with real data — in
production, put RDS in a private subnet and connect through a VPN,
bastion host, or from within the VPC.
