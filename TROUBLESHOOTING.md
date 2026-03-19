# LUMIÈRE eCOM — Troubleshooting & Maintenance Guide

## Tech Stack

| Layer          | Technology                  |
|----------------|-----------------------------|
| Framework      | Next.js 14 (App Router)     |
| i18n           | next-intl v4                |
| Database       | Neon (PostgreSQL serverless) |
| ORM            | Drizzle ORM                 |
| Styling        | Tailwind CSS                |
| Payments       | Stripe                      |
| Images         | Cloudinary                  |
| Email          | Resend                      |
| Hosting        | Vercel (region: fra1)       |

---

## Project Structure (Key Files)

```
src/
├── routing.ts              # next-intl routing config (locales, defaultLocale)
├── i18n.ts                 # next-intl request config (message loading)
├── middleware.ts            # Locale detection & routing middleware
├── messages/
│   ├── en.json             # English translations
│   └── ar.json             # Arabic translations
├── app/
│   ├── layout.tsx          # Root layout (fonts, html/body)
│   ├── page.tsx            # Root page (redirects to /en)
│   ├── not-found.tsx       # Root 404 page
│   ├── [locale]/
│   │   ├── layout.tsx      # Locale layout (NextIntlClientProvider, Navbar, Footer)
│   │   ├── page.tsx        # Home page
│   │   ├── shop/           # Shop page
│   │   ├── product/[slug]/ # Product detail
│   │   ├── cart/           # Cart page
│   │   ├── checkout/       # Checkout page
│   │   └── admin/          # Admin panel
│   └── api/                # API routes (products, orders, categories, etc.)
```

---

## Common Issues & Fixes

### 1. Vercel 404 on All Pages

**Symptom:** Site deploys but every page returns 404.

**Cause:** `next-intl` version mismatch. The code was written for v3 API but v4 is installed.

**Key difference (v3 vs v4):**

```ts
// v3 (OLD - broken)
getRequestConfig(async ({ locale }) => { ... })

// v4 (CORRECT)
getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale;
  ...
})
```

In v4, `locale` in the callback is `undefined` for normal page renders. Only `requestLocale` (a Promise) provides the detected locale from the middleware.

**Fix:** Update `src/i18n.ts` to use `requestLocale` and `await` it.

---

### 2. Middleware Not Redirecting / Locale Not Detected

**Symptom:** Visiting `/` doesn't redirect to `/en`, or locale switching doesn't work.

**Check:**
- `src/middleware.ts` uses `createMiddleware` from `next-intl/middleware`
- It imports `routing` from `src/routing.ts` (the v4 pattern)
- The `matcher` in `middleware.ts` excludes `api`, `_next`, `_vercel`, and static files

**Matcher pattern:**
```ts
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

---

### 3. Build Fails with Font Errors

**Symptom:** `next/font` error — "Failed to fetch font from Google Fonts"

**Cause:** Network issue during build (Google Fonts unreachable).

**Fix:** Retry the build, or use local font files instead of Google Fonts in `src/app/layout.tsx`.

---

### 4. Environment Variables Missing on Vercel

**Required env vars (check Vercel dashboard → Settings → Environment Variables):**

| Variable              | Purpose                    |
|-----------------------|----------------------------|
| `DATABASE_URL`        | Neon PostgreSQL connection |
| `STRIPE_SECRET_KEY`   | Stripe server-side key     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client-side key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary uploads       |
| `CLOUDINARY_API_KEY`  | Cloudinary API key         |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret    |
| `RESEND_API_KEY`      | Resend email service       |

If any are missing, API routes will fail with 500 errors.

---

### 5. API Routes Return 500

**Check:**
1. Environment variables are set (see above)
2. Database is accessible (Neon dashboard → check connection)
3. Drizzle schema matches DB: run `npm run db:push` to sync

---

### 6. Images Not Loading

**Symptom:** Broken images or Next.js image optimization errors.

**Check `next.config.mjs`** — allowed domains:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'upload.wikimedia.org' },
    { protocol: 'https', hostname: '**.cloudinary.com' },
  ],
}
```

Add any new image domains here.

---

## Vercel Deployment Checklist

1. Ensure all env vars are set in Vercel dashboard
2. Framework is auto-detected as Next.js (don't override in vercel.json)
3. Build command: `next build`
4. Output directory: auto (`.next`)
5. Node.js version: 18.x or 20.x
6. Region: `fra1` (configured in `vercel.json`)

---

## Adding a New Locale

1. Add locale code to `src/routing.ts` → `locales` array
2. Add locale code to `src/i18n.ts` → `locales` array
3. Create `src/messages/<locale>.json` (copy from `en.json` and translate)
4. Update `src/app/[locale]/layout.tsx` if locale needs RTL or special font

---

## Useful Commands

```bash
npm run dev          # Local development
npm run build        # Production build
npm run lint         # ESLint check
npm run db:push      # Push Drizzle schema to database
npm run db:migrate   # Run database migrations
```
