# Amigo Helper

Build a simple, friendly, mobile-first frontend for an application called
  “Amigo”.

  Amigo is a local service assistant that helps users find trusted nearby
  service providers such as plumbers, electricians, tutors, and other informal
  local professionals. Users should be able to describe what they need naturally
  in English, Urdu, or Roman Urdu. The app sends the request to an AI-powered
  backend, extracts the service type, location, date, and time, then shows
  ranked local providers.

  The main audience includes people of every age and technical ability. The
  interface must be extremely easy to understand, with no complicated menus,
  confusing terminology, or unnecessary steps.

  Core user flow:

  1. Welcome screen
     - App name: Amigo
     - Friendly explanation of the app
     - Clear “Get Started” button
     - Login button
     - Visible “How Amigo Works” guide option

  2. Registration and login
     - Name, email, and password fields
     - Clear labels and validation messages
     - Password visibility toggle
     - Friendly error messages
     - Loading state while connecting to the server

  3. Home screen
     - Large text area asking: “What help do you need?”
     - Example requests:
       - “I need an electrician in Johar tomorrow at 2 PM”
       - “Mujhe Gulshan mein plumber chahiye”
       - “Johar mein AC repair karwana hai”
     - Quick suggestion buttons for common services
     - Explain that users can write in English, Urdu, or Roman Urdu
     - Prominent “Find Help” button
     - Navigation to Home, My Bookings, and User Guide

  4. Provider results screen
     - Display the user’s request in a readable summary
     - Show providers as clean cards
     - Each card should include:
       - Provider name
       - Service category
       - Neighborhood
       - Rating
       - Simple description
       - “Choose Provider” button
     - Sort providers by rating
     - Friendly empty state if no providers are found
     - Helpful clarification message if the user did not provide enough
     information

  5. Booking screen
     - Show selected provider clearly
     - Date and time inputs with readable formatting
     - Review section before confirmation
     - Clear “Confirm Booking” button
     - Explain that the booking will initially be pending
     - Show loading and error states

  6. My Bookings screen
     - Show all user bookings
     - Display provider, category, area, date, time, and status
     - Use clear status badges such as Pending and Confirmed
     - Include refresh functionality
     - Provide a friendly empty state when there are no bookings

  7. User guide
     - The guide must be accessible from the welcome screen, home screen, and
     navigation
     - Explain the app in three simple steps:
       1. Tell Amigo what help you need
       2. Choose a nearby provider
       3. Select a time and confirm your booking
     - Include examples in English, Urdu, and Roman Urdu
     - Use simple language suitable for children, older adults, and first-time
     smartphone users

  Design requirements:

  - Use a light, calm, welcoming theme.
  - Use the following color palette:
    - Cotton Rose: #E5C1BD
    - Bone: #D2D0BA
    - Dry Sage: #B6BE9C
    - Muted Teal: #7B9E87
    - Blue Slate: #5E747F
  - Use large readable text and high-contrast buttons.
  - Use rounded cards, generous spacing, and simple icons.
  - Avoid clutter and excessive animations.
  - Keep one main action per screen.
  - Make buttons large enough for older users and touchscreen users.
  - Add accessible labels and keyboard-friendly controls.
  - Make the layout responsive for mobile phones, tablets, and desktop browsers.
  - Use friendly wording instead of technical terms.
  - Include visible loading indicators and useful error messages.
  - Never expose API keys or secrets in frontend code.

  Backend integration:

  The frontend will connect to an existing FastAPI backend.

  Use an environment variable for the API URL:

  EXPO_PUBLIC_API_URL=http://localhost:8002

  Available endpoints:

  POST /register
  Request:
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password"
  }

  POST /login
  Request:
  {
    "email": "user@example.com",
    "password": "password"
  }

  The login response contains:
  {
    "access_token": "...",
    "token_type": "bearer"
  }

  POST /service-requests
  Requires:
  Authorization: Bearer ACCESS_TOKEN

  Request:
  {
    "message": "I need an electrician in Johar tomorrow at 2 PM"
  }

  POST /service-requests/{request_id}/book
  Requires:
  Authorization: Bearer ACCESS_TOKEN

  Request:
  {
    "provider_id": 1,
    "booking_time": "2026-08-10T14:30:00"
  }

  GET /bookings
  Requires:
  Authorization: Bearer ACCESS_TOKEN

  Persist the login token securely and automatically attach it to protected
  requests. Handle expired sessions gracefully by asking the user to log in
  again.

  Generate clean, maintainable frontend code with reusable components. The final
  design should feel trustworthy, warm, simple, and welcoming—more like a
  helpful community assistant than a complex business dashboard.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7801df99-3600-43a0-b665-14d1a8932914).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
