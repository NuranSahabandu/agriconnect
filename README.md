# AgriConnect

## Selected Problem

Farmers in Sri Lanka often struggle to find reliable buyers for their produce, while buyers (retailers, exporters, households) have no easy way to discover what's available directly from local farmers. Middlemen absorb most of the margin on both sides, prices aren't transparent, and there's no shared platform where a farmer's listing and a buyer's request can find each other. Language is also a barrier — most existing digital tools are English-only, excluding a large share of the farming community that is more comfortable in Sinhala.

## Proposed Solution

AgriConnect is a bilingual (English/Sinhala) web marketplace that connects farmers and buyers directly. Farmers list their produce (crop, quantity, price, location); buyers post requests for what they need. Both sides can browse the marketplace, manage their own listings/requests from a dashboard, and communicate needs without a middleman — all in a lightweight app designed to work even when the backend or database is temporarily unavailable.

## Main Features

- **Product listings** — farmers create, update, and delete product listings (category, quantity, price, location) with client-side validation and demo presets for quick data entry.
- **Buyer requests** — buyers post requests for produce they need.
- **Marketplace browsing & search** — public product listing and search pages.
- **Dashboard** — a combined view of products and requests for the logged-in user, with graceful "Unknown product" handling when request data references a product that no longer matches.
- **Authentication** — registration and login with hashed passwords (bcrypt) and JWT-based sessions.
- **Bilingual UI (English / Sinhala)** — a language toggle backed by a shared translation dictionary, with Noto Sans Sinhala loaded for correct script rendering.
- **Resilient by design** — the client falls back to `localStorage` for products, registration, and login if the API is unreachable, so the UI keeps working offline or when MongoDB isn't connected; the server falls back to in-memory data if `MONGO_URI` is missing or the connection fails, instead of crashing.

## Technologies Used

**Frontend (`client/`)**
- React 19 + Vite
- React Router
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Oxlint

**Backend (`server/`)**
- Node.js + Express 5
- MongoDB + Mongoose (with in-memory fallback)
- JSON Web Tokens (`jsonwebtoken`) for auth
- `bcryptjs` for password hashing
- `dotenv`, `cors`, `nodemon`

## AI Tools Used

- **Claude Code** — used throughout the hackathon for implementation, debugging, and documentation.

## Team Members & Contributions

| Name | Contributions |
|---|---|
| Nuran Sahabandu | Full-stack development — auth flow, products/requests API, dashboard, project setup |
| Thisen Nambukara | Feature development and bug fixes across client and server |
| Virul Akbo De Silva | Feature development, UI work, and translations |

## Installation & Execution Instructions

This is a monorepo with two independent Node projects — `client/` and `server/` — each with its own `package.json`. There is no root-level install step.

### 1. Server

```bash
cd server
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # starts on the PORT set in .env (e.g. http://localhost:5050)
```

> On macOS, port 5000 is often taken by AirPlay Receiver — this project defaults dev setups to **5050** instead.
>
> `MONGO_URI` is optional: if it's missing or the connection fails, the server logs a warning and falls back to serving in-memory sample data instead of crashing.

### 2. Client

```bash
cd client
npm install
cp .env.example .env   # set VITE_API_URL to match the server's PORT
npm run dev             # Vite dev server, printed URL (default http://localhost:5173)
```

Make sure `client/.env`'s `VITE_API_URL` and `server/.env`'s `PORT` point at the same address.

### Other useful commands

```bash
# client/
npm run build     # production build
npm run preview   # preview a production build
npm run lint       # oxlint

# server/
npm start          # node index.js (no auto-restart)
```

## Deployed Application Link



## Demonstration Video Link

[Watch the demo](https://drive.google.com/file/d/1mvSsSSdtkpcqiSaVMHsv56Xz0Q82vXn9/view?usp=sharing)
