# TezWeb Starter (React + Vite + TypeScript + Tailwind + Firebase)

Clean starter project with:
- React + Vite + TypeScript
- Tailwind CSS
- Firebase Auth (Phone OTP + reCAPTCHA)
- Searchable country selector (flags + country codes)
- Template preview screen (6+ cards, fixed action button)
- Firestore user profile setup with 7-day trial metadata

## Folder Structure

```text
.
├── public/
├── src/
│   ├── components/
│   │   ├── CountryCodeSelect.tsx
│   │   ├── PhoneAuthForm.tsx
│   │   └── TemplateCard.tsx
│   ├── lib/
│   │   ├── env.ts
│   │   ├── firebase.ts
│   │   └── templates.ts
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   └── TemplatePreviewPage.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── firestoreService.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── template.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
└── vite.config.ts
```

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
  templateId // saved once from Template Preview screen
}
```

`templateId` is saved once and locked to prevent repeated selection on refresh/edit.

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
