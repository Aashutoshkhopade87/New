# TezWeb Starter (React + Vite + TypeScript + Tailwind + Firebase)

Clean starter project with:
- React + Vite + TypeScript
- Tailwind CSS
- Firebase Auth (Phone OTP + reCAPTCHA)
- Searchable country selector (flags + country codes)
- Template preview screen (6+ cards, fixed action button)
- Website generation module with seeded randomness
- Firestore user profile setup with 7-day trial metadata

## Folder Structure

```text
.
├── public/
├── src/
│   ├── components/
│   │   ├── CountryCodeSelect.tsx
│   │   ├── PhoneAuthForm.tsx
│   │   ├── TemplateCard.tsx
│   ├── lib/
│   │   ├── designGenerator.ts
│   │   ├── env.ts
│   │   ├── firebase.ts
│   │   └── templates.ts
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── TemplatePreviewPage.tsx
│   │   └── WebsiteGenerationPage.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── firestoreService.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── design.ts
│   │   └── template.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
└── vite.config.ts
```

## Website generation rules

Generated `designConfig` uses seeded randomness for:
- Hero banner styles
- Color palettes
- Fonts
- Layouts
- Section ordering

Section order is fixed to:
1. AI Hero
2. Business name + tagline
3. Social icons
4. Products
5. Gallery
6. About
7. Location + Google Map
8. WhatsApp
9. Contact

Booking forms are removed from generation scope.

## Firestore user document

On first signup/login, profile is created at `users/{uid}`:

```ts
{
  uid,
  phone,
  createdAt,
  trialEndsAt, // createdAt + 7 days
  plan: "trial",
  status: "active",
  maxWebsites: 2,
  templateId,
  designConfig
}
```

`templateId` is saved once and locked to prevent repeated selection on refresh/edit.
`designConfig` is saved after generation from selected template + seeded uid.

## Local setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy env template
   ```bash
   cp .env.example .env
   ```
3. Fill `.env` with Firebase values.
4. Enable in Firebase Console:
   - Authentication > Sign-in method > Phone
   - Firestore Database
5. Run the app:
   ```bash
   npm run dev
   ```
