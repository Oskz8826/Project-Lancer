# Lancer

Game dev pricing and budget estimator. Built with Next.js and PocketBase.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)

## Setup

```bash
git clone https://github.com/Oskz8826/Project-Lancer.git
cd Project-Lancer
npm install
```

## Running the Project

Lancer requires **two processes running simultaneously** — the backend (PocketBase) and the frontend (Next.js). Open two terminals.

### Terminal 1 — Backend (PocketBase)

```bash
cd pocketbase_0.36.9_windows_amd64
./pocketbase.exe serve
```

PocketBase runs at `http://127.0.0.1:8090`. Admin panel at `http://127.0.0.1:8090/_/`.

### Terminal 2 — Frontend (Next.js)

```bash
npm run dev
```

App runs at `http://localhost:3000`.

**Both must be running at the same time.** Start PocketBase first.

## Admin Access

You should have received your own admin credentials separately. Log in at `http://127.0.0.1:8090/_/` — change your password on first login.

## Project Structure

```
app/          - Next.js pages and layouts
components/   - UI components
hooks/        - Custom React hooks
lib/          - Utilities and PocketBase client
types/        - TypeScript types
pocketbase_0.36.9_windows_amd64/ - Backend binary and migrations
```

## Environment

The app expects PocketBase running locally on port `8090`. No `.env` setup needed for local development — the defaults are pre-configured.
