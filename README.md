# Amigo — Smart Local Service Orchestrator

Amigo is an AI-assisted local service discovery and booking application. Users
describe a need in English, Urdu, or Roman Urdu. The backend extracts intent,
finds matching providers from SQLite, ranks them by rating, creates bookings,
and records a trace of the orchestration workflow.

[Full formatted project documentation](docs/Amigo_Project_Documentation.pdf)

## Features

- JWT authentication and PBKDF2-HMAC-SHA256 password hashing
- User-owned booking access controls
- Gemini structured intent extraction
- Provider filtering and rating-based ranking
- Booking creation, status updates, and cancellation
- Traceable orchestration logs
- Responsive React/TypeScript web frontend
- Optional Expo/React Native mobile frontend
- English, Urdu, and Roman Urdu support

## Stack

**Backend:** Python, FastAPI, Uvicorn, SQLite, Pydantic, JWT, Gemini API,
Pytest, and HTTPX.

**Frontend:** React, TypeScript, TanStack Start/Router, Vite, Tailwind CSS,
Lucide, ESLint, and Prettier.

## Structure

```text
backend/       FastAPI application, routes, schemas, and tests
database/      SQLite schema and seed data
frontend/      Current React/TypeScript web application
mobile/        Optional Expo mobile client
docs/          Formatted project PDF
```

## Setup

Requirements: Python 3.11+, Node.js/npm, Git, and a Gemini API key for live AI
requests. Automated tests mock Gemini and do not require an API key.

### Backend

```bash
cd ~/local-service-orchestrator
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example .env
```

Configure `.env`:

```env
SECRET_KEY=replace-with-a-long-random-secret
DATABASE_PATH=database/khidmat.db
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-3.6-flash
CORS_ORIGINS=http://localhost:5173,http://localhost:8081,http://localhost:19006
```

Never commit `.env` or expose the Gemini API key.

Create a fresh database if needed:

```bash
sqlite3 database/khidmat.db < database/schema.sql
sqlite3 database/khidmat.db < database/seed_data.sql
```

### Start the backend

```bash
cd ~/local-service-orchestrator
source .venv/bin/activate
python -m uvicorn backend.main:app \
  --reload --env-file .env --host 0.0.0.0 --port 8002
```

Check it with `curl http://127.0.0.1:8002/health`. The expected response is
`{"status":"ok"}`. Interactive API documentation is available at
`http://127.0.0.1:8002/docs`.

### Web frontend

```bash
cd ~/local-service-orchestrator/frontend
npm install
cp -n .env.example .env
npm run dev
```

Set `frontend/.env` to:

```env
VITE_API_URL=http://localhost:8002
```

Open the Vite URL, normally `http://localhost:5173`.

### Optional mobile frontend

```bash
cd ~/local-service-orchestrator/mobile
npm install
cp -n .env.example .env
npx expo start
```

For a physical phone, use the computer LAN IP instead of `localhost`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8002
```

## User flow

```text
Welcome → Register/Login → Ask for help → Provider results → Booking → My Bookings
```

## API reference

Base URL: `http://127.0.0.1:8002`. Protected endpoints require:

```http
Authorization: Bearer ACCESS_TOKEN
```

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/register` | Create an account |
| POST | `/login` | Receive a JWT |
| GET | `/bookings` | List the current user's bookings |
| POST | `/bookings` | Create a general booking |
| PATCH | `/bookings/{booking_id}` | Update booking status |
| DELETE | `/bookings/{booking_id}` | Cancel a booking |
| POST | `/service-requests` | Extract intent and find providers |
| GET | `/service-requests/{request_id}/trace` | View workflow trace |
| POST | `/service-requests/{request_id}/book` | Book a matched provider |

Natural-language request:

```json
{"message":"I need an electrician in Johar on 2026-08-10 at 14:30"}
```

The response includes `request_id`, extracted `intent`, ranked `providers`, and
`trace`. Missing service type or area produces `needs_clarification`.

Booking request:

```json
{"provider_id":2,"booking_time":"2026-08-10T14:30:00"}
```

New bookings begin with status `pending`.

## Testing

Backend tests use a temporary SQLite database, an internal HTTPX client, and
mocked Gemini extraction:

```bash
cd ~/local-service-orchestrator
source .venv/bin/activate
PYTHONPATH=. pytest -q backend/tests
```

Expected result: `9 passed`.

Run all checks:

```bash
python3 -m compileall -q backend
git diff --check
cd frontend
npm run build
npm run lint
```

`npm run build` checks the production bundle. `npm run lint` checks frontend
code quality and formatting. A Fast Refresh warning with zero lint errors is
non-blocking.

## Manual test checklist

1. Register and log in.
2. Submit an English request.
3. Confirm providers appear in rating order.
4. Select a provider and create a booking.
5. Open and refresh **My Bookings**.
6. Test Urdu or Roman Urdu input.
7. Test an incomplete request and clarification message.
8. Test an incorrect password.
9. Log out and verify protected pages require login.

## Troubleshooting and security

If port `8002` is busy, run `ss -ltnp | grep :8002`. If the frontend cannot
connect, verify the backend health endpoint, `VITE_API_URL`, CORS, and the LAN
IP when using a phone. Restart the relevant server after changing `.env`.

To fix frontend formatting:

```bash
cd ~/local-service-orchestrator/frontend
npm run lint -- --fix
npm run lint
```

- Never commit `.env` files or API keys.
- Never store plaintext passwords.
- Use a strong `SECRET_KEY` outside local development.
- Keep ownership filters on protected queries.
- Validate external data with Pydantic.
- Do not commit `node_modules`, caches, databases, or build output.

## Future improvements

Real provider onboarding, availability, reminders, notifications, refresh
tokens, PostgreSQL, rate limiting, browser end-to-end tests, reviews, provider
profiles, and administration tools.

## Commit documentation changes

```bash
cd ~/local-service-orchestrator
git add README.md docs/Amigo_Project_Documentation.pdf
git commit -m "Add GitHub README and formatted project documentation"
```
