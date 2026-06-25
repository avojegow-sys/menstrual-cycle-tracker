# 🌸 Cycle Tracker

A private **menstrual cycle tracker** built as a Progressive Web App (PWA).
Sign in with a **passwordless magic link** and your data syncs securely to the
cloud ([Supabase](https://supabase.com)) so it's available on every device and
survives reinstalls. A `localStorage` cache keeps the UI instant and readable
during brief offline periods. Install it to your iPhone or Android home screen.

![icon](public/icons/icon-192.png)

## Features

- **Interactive calendar** — tap any day to log or remove a period day; the
  current cycle day is shown up top.
- **Color-coded days** — period (pink), fertile window days 10–17 (light
  purple), ovulation day 14 (purple with a dot), PMS zone, and today (ring).
- **Predictions** — next period dates derived from your average cycle length.
- **History** — your last completed cycles with lengths and average.
- **Insights** — average cycle/period length, shortest/longest, regularity, and
  upcoming predicted periods.
- **Cloud sync + Magic Link auth** — passwordless email sign-in via Supabase;
  data is stored per-user with Row Level Security and synced across devices.
- **Installable PWA** — standalone display, custom icons, iOS home-screen
  support, and an offline service worker.
- **Multilingual** — English and Russian (Русский) with a one-tap language
  switcher. Localized dates and correct Russian pluralization.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Postgres + Magic Link auth + RLS
- [next-pwa](https://github.com/shadowwalker/next-pwa) for the service worker
- [date-fns](https://date-fns.org/) for all date math

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values (see below)
npm run dev
```

Open <http://localhost:3000>.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**. This creates the
   `cycles` table, indexes, and the Row Level Security policy.
3. **Project Settings → API** → copy the **Project URL** and the **anon public**
   key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. **Authentication → URL Configuration** → set **Site URL** to your app URL
   (e.g. `http://localhost:3000` for dev, your Vercel domain for prod) and add
   both to **Redirect URLs**. The magic link redirects back here.
5. Email sending works out of the box with Supabase's built-in provider for
   testing; configure your own SMTP for production volume.

> The service worker is **disabled in development** (so you don't fight the
> cache). To test full PWA/offline behavior, run a production build:
>
> ```bash
> npm run build
> npm start
> ```

### Regenerating the app icons (optional)

Icons are committed under `public/icons/`. To regenerate them (no dependencies
required):

```bash
node scripts/generate-icons.js
```

## Deploy to Vercel (zero config)

1. Push this folder to a GitHub/GitLab/Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Next.js — keep the defaults.
4. Add the two environment variables (**Settings → Environment Variables**):
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then **Deploy**.
5. Add your Vercel domain to Supabase **Authentication → URL Configuration**
   (Site URL + Redirect URLs) so magic links redirect correctly in production.

Prefer the CLI?

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

## How the cycle math works

- **Average cycle length** = mean of your last 6 completed cycles (a cycle = one
  period start to the day before the next). Defaults to **28 days** with no
  history. You can also set a manual override in the data model.
- **Predictions** roll forward from your most recent period start by the average
  cycle length.
- **Day coloring** is computed relative to the start of whichever cycle a day
  belongs to (logged or predicted): days 10–17 fertile, day 14 ovulation, and
  the last 5 days before the next period are the PMS zone.

## Project structure

```
src/
  app/
    layout.tsx          # PWA meta, fonts, bottom nav shell
    page.tsx            # "/"        Calendar + current cycle card
    history/page.tsx    # "/history" Past cycles + average
    insights/page.tsx   # "/insights" Stats, predictions, clear data
    globals.css
  components/
    Calendar.tsx        # month grid + color-coded days
    CycleInfoCard.tsx   # current cycle summary
    BottomNav.tsx       # Calendar / History / Insights tabs
    Legend.tsx
  components/
    auth/
      AuthProvider.tsx  # session context (magic link sign-in / sign-out)
      AuthGate.tsx      # shows login screen until signed in
      LoginScreen.tsx   # email + "Send magic link"
  hooks/
    useCycleData.ts     # cloud load + optimistic sync + localStorage cache
  lib/
    types.ts            # data model
    storage.ts          # localStorage cache read/write
    supabase.ts         # Supabase client + row types
    repository.ts       # periods <-> `cycles` rows (fetch / push / delete)
    cycle.ts            # all cycle calculations + day classification
public/
  manifest.json
  icons/                # 192 / 512 / maskable / apple-touch
supabase/
  schema.sql            # table + indexes + RLS policy (run in Supabase)
scripts/
  generate-icons.js     # dependency-free PNG icon generator
```

## Data, sync & privacy

- **Source of truth is Supabase.** Each period range is one row in the `cycles`
  table, scoped to your user via Row Level Security — you can only ever read or
  write your own rows.
- **On sign-in** the app loads your cycles from the cloud. **On every edit** it
  updates state optimistically, writes to a `localStorage` cache, then syncs the
  change to Supabase (status shown on the Insights tab).
- **Offline:** the cache lets you keep viewing data; edits made offline are
  pushed on the next successful sync while online.
- **Sign out** is under **Insights → Settings**. **Clear all data** deletes your
  rows in the cloud too.

> **iOS magic-link note:** tapping the email link may open it in Safari rather
> than the installed standalone PWA, and iOS sometimes isolates storage between
> the two. If sign-in doesn't carry into the home-screen app, open the app from
> the home screen and sign in there, or complete the first sign-in in Safari
> before installing.
