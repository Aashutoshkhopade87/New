# TezWeb AI Website Builder

Professional React + Vite + TypeScript + Tailwind + Firebase setup for Indian SMB website onboarding.

## Included product flow

- Landing page with two CTAs:
  - **Create Website**
  - **Browse Templates**
- Hero text:
  - **Create Your Business Website in Just 2 Minutes**
  - **No coding needed. WhatsApp powered websites.**
- Create Website form:
  - Business Name
  - Business Category
  - WhatsApp Number with Country Code selector
  - Language selector (English, Hindi, Marathi)
  - Additional Instructions
- AI website generation with this section order:
  1. Hero banner with AI image
  2. Business name + tagline
  3. Products / Services
  4. Gallery
  5. Social links
  6. About
  7. Location + Map
  8. WhatsApp CTA
  9. Contact
- One-time template selection + live preview + Next CTA after select.
- Deferred login: user asked to login only for publish/edit/dashboard.
- Dashboard:
  - Website list
  - Edit / Preview / Delete / Publish / Unpublish
  - Trial days left + subscription status
  - Analytics counters
  - Editor auto-save
  - Image upload support
- Publish URLs:
  - `https://tezweb.com/site/{slug-id}`
  - Future-ready: `https://{shopname}.tezweb.com`

## Pricing logic implemented

- Free: 7-day trial, 1 website
- Paid ₹199/month: up to 2 websites
- Trial expiry auto-unpublish flow
- Razorpay checkout integration hook present

## Firebase usage

- Auth: Phone OTP
- Firestore: users/websites/publish mapping/plans/analytics
- Storage: website image upload

## Environment

Copy `.env.example` to `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_RAZORPAY_KEY_ID=
VITE_ENABLE_DEMO_AUTH=true
```

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
