# TezWeb Starter (React + Vite + TypeScript + Tailwind + Firebase)

TezWeb includes:
- Phone OTP auth (Firebase)
- Template selection + website generation
- Dashboard with publish/unpublish
- Subscription + trial logic
- Dynamic SEO meta tags + OpenGraph
- Sitemap + robots.txt
- Vercel / Firebase Hosting ready configs

## SEO Features
- Dynamic meta tags by page via `applySeo()`.
- OpenGraph + Twitter tags auto-updated.
- Canonical URL updates per page.
- Static SEO files:
  - `public/sitemap.xml`
  - `public/robots.txt`

## Hosting Ready
Included config files:
- `vercel.json` (SPA rewrites + headers)
- `firebase.json` (hosting rewrites + headers)
- `.firebaserc` template

## Environment
Create `.env` from `.env.example` and add:
- Firebase keys
- Razorpay key (`VITE_RAZORPAY_KEY_ID`)

## Local Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy to Vercel
1. Push repo to GitHub.
2. Import project in Vercel.
3. Set environment variables from `.env.example`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

## Deploy to Firebase Hosting
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login:
   ```bash
   firebase login
   ```
3. Update `.firebaserc` with your project id.
4. Build app:
   ```bash
   npm run build
   ```
5. Deploy:
   ```bash
   firebase deploy --only hosting
   ```


## Demo Login (Testing)
- Set `VITE_ENABLE_DEMO_AUTH=true` in `.env` to show **Use Demo Login (Testing)** on auth screen.
- Demo login uses local browser storage (no OTP needed) so you can test dashboard flows quickly.
- Later, disable demo and continue with real Firebase Phone OTP flow.
