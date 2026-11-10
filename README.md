# Rose Foundation

A community kindness app built with Next.js, TypeScript, and Tailwind CSS. Visitors can share community notes, and administrators can review, approve, archive, or delete submissions.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app works with secure defaults in development, and you can set a custom admin code and secret via environment variables if you want to override them.

Open http://localhost:3000 for the public site, /admin for secure access, and /dashboard for administration.

## Default development credentials

- Admin code: `rosecare`
- Session secret: a generated secret is set automatically in development if `ADMIN_SESSION_SECRET` is not provided

## Production notes

Before shipping to production, set environment variables for `ADMIN_ACCESS_CODE` and `ADMIN_SESSION_SECRET` in a real environment and do not commit `.env.local`.

The app stores records in `data/feedback.json` for local development. For a production deployment, replace the file-based store with a durable database and add privacy protections for user-submitted content.
