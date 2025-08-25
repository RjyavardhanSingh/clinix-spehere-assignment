# Clinix Sphere

Full-stack Clinix Sphere application (backend API, web dashboard, and Expo React Native patient app).

This README explains how to run the backend, the web client, and the mobile (Expo) app locally, how to configure environment variables, common troubleshooting, and deployment notes. It also includes a short API summary and testing tips for Expo/physical devices.

## Table of contents

- Project layout
- Quick start (local)
  - Backend
  - Web client
  - Mobile (Expo)
- Environment examples
- API summary (important endpoints)
- Common issues & fixes
- Deployment notes (Render / Vercel)
- Contributing
- Screenshots & video placeholder

## Project layout

Top-level folders:

- `server/` — Node.js + Express backend (MongoDB, Mongoose, JWT auth)
- `client/` — React + Vite web dashboard
- `clinix-patient-app/` — Expo (React Native) patient app

Refer to each folder's README for more details where present.

## Quick start (local)

Prerequisites:

- Node.js (recommended v18+)
- npm or yarn
- MongoDB access (local or cloud)
- For mobile testing: Expo Go on your phone and your development machine on the same LAN if testing against a local backend

Open three terminals (one per service) and run the following steps.

### Backend (server)

1. Install and start the server

```bash
cd server
npm install
cp .env.example .env   # edit .env with your values
npm run dev            # or `node server.js` / `npm start`
```

2. Default env variables expected (see `server/.env.example` below). The server listens on `PORT` (default 5000).

### Web client (dashboard)

1. Install and run the web client

```bash
cd client
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL (e.g. https://your-render-url.onrender.com)
npm run dev            # development server (Vite)
```

2. When deploying to Vercel, set `VITE_API_URL` in Vercel environment variables to your backend production URL.

### Mobile (Expo patient app)

1. Install dependencies and start Expo

```bash
cd "clinix-patient-app"
npm install
cp .env.example .env   # optional: set API base or use the LAN IP approach below
npx expo start
```

2. To test the mobile app against a locally-running backend, set the API base URL in `clinix-patient-app/config/api.js` (or similar) to your machine LAN IP: e.g. `http://192.168.1.42:5000`.

Notes for iPhone testing with Expo Go:

- Ensure your phone is on the same Wi‑Fi network as your dev machine.
- Use the LAN metro bundler option in Expo (not Tunnel) for best performance.
- If the backend is running locally, use the machine LAN IP (not `localhost` or `127.0.0.1`).

## Environment examples

server/.env.example

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/clinix?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
```

client/.env.example (for Vite web)

```
VITE_API_URL=https://your-backend-url.example.com
```

clinix-patient-app/.env.example

```
API_BASE_URL=http://192.168.x.x:5000  # development LAN IP or production URL
```

## API summary (important endpoints)

Authentication:

- POST /api/auth/register — register user
- POST /api/auth/login — login -> returns { token, user }

Appointments:

- GET /api/appointments — list appointments (protected)
- POST /api/appointments — create appointment (protected)
- PATCH /api/appointments/:id/status — update appointment status (protected)

Prescriptions:

- POST /api/prescriptions — create prescription (protected)
- GET /api/prescriptions/:appointmentId — list prescriptions by appointment (protected)

Notes:

- All protected routes require the Authorization header: `Authorization: Bearer <token>`
- The server must accept `OPTIONS` preflight and include the HTTP methods your client uses (especially `PATCH`).

## Common issues & fixes

- 401 Unauthorized after login:

  - Ensure the client sends header `Authorization: Bearer <token>` (no extra quotes or spaces).
  - Verify token expiry; add refresh-token logic if needed.

- CORS errors in browser (Access-Control-Allow-Origin / Methods):

  - Make sure `cors()` middleware runs before routes in `server/server.js` and that PATCH is allowed.
  - For a personal project you can allow all origins during development: `app.use(cors());` and handle OPTIONS responses.

- path-to-regexp / TypeError from Render build:

  - Don't register Express routes using full URLs. Use path-only strings like `/api/prescriptions/:appointmentId`.

- ESM vs CommonJS export errors ("does not provide an export named 'default'"):

  - If `package.json` sets `type: "module"`, export with `export default` and use `import` syntax.
  - Otherwise use `module.exports =` and `require()`.

- Nested git repository (folder with arrow on GitHub):
  - Remove the nested `.git` inside the subfolder and commit the folder to the parent repo:

```bash
cd path/to/that/subfolder
rm -rf .git
cd ../../
git add <folder>
git commit -m "Add folder without nested git"
git push
```

## Deployment notes

- Backend (Render): create a Web Service. Set `PORT`, `MONGO_URI`, and `JWT_SECRET` in Render environment variables. Ensure build and start commands match your repository.

- Web dashboard (Vercel): set `VITE_API_URL` to your backend production URL in Vercel environment settings and redeploy.

- Mobile (production): point `API_BASE_URL` to the production backend URL before building the native binary or releasing.

## Tests & verification

- Backend quick smoke test after starting:

```bash
curl -i http://localhost:5000/api/health || curl -i $VITE_API_URL/api/health
```

- Web: open Vite dev server URL shown by `npm run dev`.
- Mobile: open Expo Dev Tools, scan the QR code with Expo Go.

## Contributing

- Keep API base URLs in a single config file per client (`client/config/api.js`, `clinix-patient-app/config/api.js`).
- Normalize user id fields on the client (support both `user._id` and `user.id`).

## video for mobile

**Link**: https://drive.google.com/file/d/1_HFDznk-DGIY1F_8BJm5j0SWzbcXl2mn/view?usp=sharing


## License

This repository contains school/assignment code. Add a license if you plan to publish the project.

---

If you'd like, I can also:

- add `server/.env.example`, `client/.env.example`, and `clinix-patient-app/.env.example` files in the repo now, or
- create the centralized `client/config/api.js` and `clinix-patient-app/config/api.js` files and apply the small auth tweaks discussed earlier.

Tell me which of those you'd like me to add next and I will write them directly into the repository.
