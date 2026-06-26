# PaperShare

PaperShare is a full-stack study-content marketplace for sharing papers, notes, and academic resources. The repository is split into a Node/Express backend and a Vite/React frontend.

## Project Structure

- `backend/` - Express API, MongoDB models, routes, middleware, services, and upload handling
- `frontend/` - React client, UI components, pages, and Vite build config
- `files/` - Supporting static documents used by the project
- `uploads/` - Runtime upload storage used by the app
- `vercel.json` - Deployment routing for the monorepo

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS
- Auth and utilities: JWT, bcryptjs, multer, socket.io

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB Atlas or a reachable MongoDB instance

## Environment Variables

Backend configuration lives in `backend/.env`.

Required values:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` is optional; defaults to `5002`

Frontend configuration uses Vite env files:

- `frontend/.env.development`
- `frontend/.env.production`

## Run Locally

Start the backend:

```bash
npm start
```

Start the frontend from the repo root:

```bash
npm run dev:frontend
```

Open the frontend at the URL printed by Vite, usually `http://localhost:5173`.

## Build

Build the frontend:

```bash
npm run build:frontend
```

Preview the frontend build:

```bash
npm run preview:frontend
```

## Data Maintenance

The repository includes a maintenance script for normalizing paper and note metadata:

- `backend/scripts/normalize-content-data.mjs`

## Notes

- The backend serves uploaded files from `backend/uploads/`.
- Build artifacts and local logs are ignored so the repository stays source-focused.
- If MongoDB Atlas blocks access, confirm the cluster IP allowlist and connection string in `backend/.env`.

## Deployment

The repository includes Vercel configuration for the frontend and API shell.

### Vercel Setup

1. Create a new Vercel project from this GitHub repo.
2. Keep the project root at the repository root.
3. Add these environment variables in Vercel:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Do not set a custom frontend API URL unless you are separating the backend from the same deployment.
5. Deploy the project and let Vercel run the frontend build automatically.

### Important Caveat

This app uses server-side uploads and realtime features.

- Uploaded files stored on disk will not be persistent on Vercel.
- If you need upload persistence, move file storage to a service like S3, Cloudinary, or Vercel Blob.
- Socket-style realtime features are not a great fit for Vercel serverless functions.

If you want the smoothest Vercel setup, host the frontend on Vercel and move the upload-heavy backend pieces to a persistent Node host. If you want, I can help split it that way and give you the exact deployment config.
