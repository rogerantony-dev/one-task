# one-task

Expo app with Expo Router (file-based routing).

## Setup

```bash
npm install
```

## Run

```bash
npx expo start
```

- **Android:** `npx expo start --android`
- **iOS:** `npx expo start --ios`
- **Web:** `npx expo start --web`

## Structure

- `src/app/` – Expo Router routes (`_layout.tsx`, `index.tsx`, etc.)
- `App.tsx` – unused when using Expo Router (entry is `expo-router/entry`)
- `assets/` – icons and splash
- `@/*` – path alias for `./src/*` (see `tsconfig.json`)

## Config

- **app.json** – Expo config (name, scheme, plugins)
- **tsconfig.json** – strict TypeScript, `@/*` paths
- **babel.config.js** – `babel-preset-expo`
