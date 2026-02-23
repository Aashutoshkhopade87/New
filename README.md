# TezWeb Starter (React + Vite + TypeScript + Tailwind + Firebase)

A fresh starter template with:
- React + Vite + TypeScript
- Tailwind CSS
- Firebase setup with `.env`
- Firebase Phone Auth (with country code selector)
- Firestore integration

## Folder Structure

```text
.
├── public/
├── src/
│   ├── components/
│   │   ├── CountryCodeSelect.tsx
│   │   └── PhoneAuthForm.tsx
│   ├── lib/
│   │   ├── env.ts
│   │   └── firebase.ts
│   ├── pages/
│   │   └── AuthPage.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── firestoreService.ts
│   ├── types/
│   │   └── auth.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add Firebase env values:
   ```bash
   cp .env.example .env
   ```
3. Fill `.env` with your Firebase project credentials.
4. Enable in Firebase Console:
   - Authentication > Sign-in method > **Phone**
   - Firestore Database
5. Run development server:
   ```bash
   npm run dev
   ```

## Notes
- Phone Auth uses Firebase reCAPTCHA in the `#firebase-recaptcha` container.
- On successful login, user profile is upserted in Firestore at `users/{uid}`.
