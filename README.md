# TezWeb Starter (React + Vite + TypeScript + Tailwind + Firebase)

Starter includes:
- Firebase Phone OTP auth
- Template selection lock
- Seeded website generation config
- Dashboard with website CRUD + publish status
- Website builder with live preview
- Analytics tracking + charts
- Publish / unpublish with subdomain mapping
- Paid plan system (trial + Razorpay)

## Trial + Subscription
- 7-day free trial (`trialEndsAt` stored in Firestore user profile)
- After trial expiry:
  - all websites are auto-unpublished (`status: draft`)
  - publish action is disabled in dashboard
- Paid subscription: **₹199/month**
- Razorpay checkout is integrated (requires `VITE_RAZORPAY_KEY_ID`)
- On payment success:
  - `subscriptionStatus: "active"`
  - `paidUntil: now + 30 days`

## Publish system
When a website is published:
- Subdomain is assigned as `{shopName}.tezweb.com` (with conflict-safe suffix fallback)
- Publish record is saved in Firestore at `publishedSites/{subdomain}`
- Website doc status is set to `published` and stores `subdomain`
- Requests to `*.tezweb.com` are resolved to matching Firestore website config and served

Unpublish:
- removes `publishedSites/{subdomain}` mapping
- sets website status back to `draft`

For local testing of published page resolver, open:
- `http://localhost:5173/?published=<subdomain>`

## Analytics tracked
For each website, Firestore stores:

```ts
analytics: {
  views,
  whatsappClicks,
  productClicks
}
```

## Firestore structure
- `users/{uid}`
  - profile + `templateId` + `designConfig`
  - `trialEndsAt`
  - `subscriptionStatus`
  - `paidUntil`
- `users/{uid}/websites/{websiteId}`
  - `templateId`
  - `designConfig`
  - `content`
  - `thumbnailUrl`
  - `status` (`draft` | `published`)
  - `subdomain`
  - `analytics` (`views`, `whatsappClicks`, `productClicks`)
- `publishedSites/{subdomain}`
  - `ownerUid`
  - `websiteId`

## Local setup
1. `npm install`
2. `cp .env.example .env`
3. Add Firebase + Razorpay env credentials
4. Enable Phone Auth and Firestore in Firebase console
5. `npm run dev`
