# Amigo mobile app — Phase 5

Amigo is an Expo/React Native client for the Smart Local Service Orchestrator.
It connects to the FastAPI backend for authentication, natural-language service
requests, provider results, bookings, and booking history.

## Run

From this directory:

```sh
npm install
npm start
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the computer
running FastAPI. For a physical phone, use the computer's LAN IP, not
`localhost`.

Then press `w` for web, or scan the Expo QR code with Expo Go.

## App flow

Welcome → Login/Register → Home → Provider results → Booking confirmation → My bookings

The Help button opens a short in-app guide explaining how Amigo works. The
colors are based on the root `theme.png` reference:

- Cotton Rose: `#E5C1BD`
- Bone: `#D2D0BA`
- Dry Sage: `#B6BE9C`
- Muted Teal: `#7B9E87`
- Blue Slate: `#5E747F`

## API setup

Install the secure token dependency:

```sh
npx expo install expo-secure-store
```

Start FastAPI so a phone can reach it:

```sh
uvicorn backend.main:app --reload --env-file .env --host 0.0.0.0 --port 8002
```

Use `http://localhost:8002` for web on the same computer. For Expo Go on a
physical phone, set `EXPO_PUBLIC_API_URL` to `http://<computer-lan-ip>:8002`.
Restart Expo after changing the mobile `.env` file.
