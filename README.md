# TezWeb Starter (React + Vite + TypeScript + Tailwind + Firebase)

Starter includes:
- Firebase Phone OTP auth
- Template selection lock
- Seeded website generation config
- Dashboard with website CRUD + publish status
- Website builder with live preview
- Analytics tracking + charts

## Key UI modules
- Auth (login/signup + OTP)
- Template Preview (6+ templates)
- Website Generation (`designConfig` save)
- Dashboard
  - website list
  - thumbnails
  - publish status
  - Edit / Preview / Delete / Publish actions
  - builder loaded from saved config on edit
  - live preview panel
  - analytics charts

## Analytics tracked
For each website, Firestore stores:

```ts
analytics: {
  views,
  whatsappClicks,
  productClicks
}
```

Tracked events:
- Page views (on preview/edit open)
- WhatsApp clicks (from live preview)
- Product clicks (from live preview)

## Firestore structure
- `users/{uid}`
  - profile + `templateId` + `designConfig`
- `users/{uid}/websites/{websiteId}`
  - `templateId`
  - `designConfig`
  - `content`
  - `thumbnailUrl`
  - `status` (`draft` | `published`)
  - `analytics` (`views`, `whatsappClicks`, `productClicks`)

## Local setup
1. `npm install`
2. `cp .env.example .env`
3. Add Firebase env credentials
4. Enable Phone Auth and Firestore in Firebase console
5. `npm run dev`
