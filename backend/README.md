# Phase 2 backend

## Setup

From the repository root:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example .env
```

Make sure the Phase 1 database exists and has been seeded before starting the
server. Set `SECRET_KEY` to a long random value in `.env` for anything beyond
local development.

## Run

```sh
uvicorn backend.main:app --reload --env-file .env
```

Open `http://127.0.0.1:8000/docs` to test the API interactively, or use
Postman with the bearer token returned by `/login`.

## Routes

- `GET /health`
- `POST /register`
- `POST /login`
- `GET /bookings`
- `POST /bookings`
- `PATCH /bookings/{booking_id}`
- `DELETE /bookings/{booking_id}` (marks the booking as cancelled)
- `POST /service-requests`
- `GET /service-requests/{request_id}/trace`
- `POST /service-requests/{request_id}/book`

Every booking query derives `user_id` from the authenticated JWT and applies it
as an ownership condition. Clients cannot submit a different `user_id` to gain
access to another user's bookings.

## Phase 3 orchestration

`POST /service-requests` accepts a natural-language request in English, Urdu,
or Roman Urdu. Gemini returns validated structured intent; the backend then
filters and ranks providers from SQLite by category, neighborhood, and rating.
The API records the request and each orchestration step in
`orchestration_requests` and `orchestration_logs`.

If `GEMINI_API_KEY` is not configured, the endpoint returns a clear `503`
response instead of pretending that intent extraction succeeded.
