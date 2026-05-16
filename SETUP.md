# VirtualFit Kiosk — Setup & Run Guide

## Prerequisites

- Node.js 20+
- npm or pnpm

## Quick Start (3 steps)

```bash
# 1. Install dependencies
npm install

# 2. Set up database (SQLite, no server needed)
npx prisma db push
npx tsx prisma/seed.ts

# 3. Start development server
npm run dev
```

Then open the URL set in `NEXT_PUBLIC_APP_URL` (default: **http://localhost:3002**)

---

## What You Get

- **Kiosk App**: http://localhost:3002/en/kiosk
- **Admin Panel**: http://localhost:3002/en/admin
- **Turkish Kiosk**: http://localhost:3002/tr/kiosk
- **Russian Kiosk**: http://localhost:3002/ru/kiosk
- **Kazakh Kiosk**: http://localhost:3002/kk/kiosk

---

## User Flow (Test It)

1. Open http://localhost:3002 → auto-redirects to `/en/kiosk`
2. Select language or tap "Touch to Start"
3. Enter your name (min 2 chars)
4. Accept privacy consent
5. Camera screen: position yourself, press "Take Photo"
6. 10-second countdown starts → auto-captures
7. Confirm or retake photo
8. Select product category (4 categories with real images)
9. Tap any product → try-on starts
10. Generating screen: in **mock mode**, results appear in ~5 seconds
11. View 4-pose results gallery (tap to fullscreen)
12. Share via QR/Email/WhatsApp/Telegram
13. End session or start new one

---

## Mock Mode

When `N8N_WEBHOOK_URL` is not configured (default), the app automatically:
- Returns 4 placeholder fashion images immediately
- Simulates the full UI flow without real AI
- After 5 seconds, the job is marked COMPLETED in DB

**To enable real AI generation:**
1. Set up n8n with the Fal.ai virtual try-on workflow
2. In Admin panel → Settings → enter your n8n webhook URL
3. Enter webhook secret
4. Copy the callback URL shown and paste in n8n

---

## n8n Callback Format

Your n8n workflow should POST to:
```
POST http://your-app-url/api/n8n/callback
```

With this body:
```json
{
  "sessionId": "...",
  "jobId": "...",
  "status": "completed",
  "results": [
    { "pose": 1, "imageUrl": "https://..." },
    { "pose": 2, "imageUrl": "https://..." },
    { "pose": 3, "imageUrl": "https://..." },
    { "pose": 4, "imageUrl": "https://..." }
  ]
}
```

Or for failure:
```json
{
  "sessionId": "...",
  "jobId": "...",
  "status": "failed",
  "error": "Error message"
}
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Database connection | `file:./dev.db` (SQLite) |
| `NEXT_PUBLIC_APP_URL` | App URL | `http://localhost:3002` |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint | (mock mode if empty) |
| `N8N_WEBHOOK_SECRET` | HMAC secret for webhook | `dev-secret-key` |

---

## Production Database (PostgreSQL)

Change `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/virtualfit"
```

Then run:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

## Admin Panel

- URL: http://localhost:3002/en/admin
- **Products**: Add/remove/view products with garment image URLs
- **Settings**: Configure n8n webhook, session timeouts, store name

Default seeded admin: `admin@virtualfit.io / admin123` (basic DB record, no auth enforced in MVP)

---

## Kiosk Hardware Setup

For a real touch-screen kiosk:

```bash
# Install Chromium kiosk mode launcher
chromium-browser --kiosk http://localhost:3002/en/kiosk \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --no-first-run \
  --disable-infobars
```

For fullscreen on startup, use the lockdown script from `DEPLOYMENT.md`.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/session/create` | Create customer session |
| DELETE | `/api/session/[id]` | Delete session + all data |
| POST | `/api/photo/upload` | Upload captured photo |
| POST | `/api/tryon/start` | Start try-on (→ n8n) |
| GET | `/api/tryon/status/[jobId]` | Poll job status |
| POST | `/api/n8n/callback` | Receive results from n8n |
| GET | `/api/products` | List products |
| GET | `/api/categories` | List categories |
| POST | `/api/share/link` | Generate share link + QR |
| POST | `/api/share/email` | Send results by email |
| GET/PATCH | `/api/admin/settings` | Store settings |
| GET/POST | `/api/admin/products` | Product management |

---

## File Structure

```
virtualfit-kiosk/
├── app/
│   ├── [locale]/kiosk/         ← All 12 kiosk screens
│   ├── [locale]/admin/         ← Admin panel
│   ├── share/[token]/          ← Public share gallery
│   └── api/                    ← All API routes
├── components/kiosk/           ← Camera, countdown, gallery, etc.
├── components/ui/              ← Reusable UI components
├── messages/                   ← EN, TR, RU, KK translations
├── prisma/
│   ├── schema.prisma           ← Full database schema
│   └── seed.ts                 ← Demo data
├── store/kioskStore.ts         ← Zustand global state
└── types/index.ts              ← TypeScript types
```
