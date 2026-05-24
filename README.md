# MediTrack Pro

Medicine and medical equipment inventory tracking app based on the PRD and architecture plan in this workspace.

## What Is Implemented

- React + TypeScript + Tailwind PWA shell
- Dashboard summary cards, filtering, search, and status badges
- Medicine and equipment CRUD
- Stock intake, consumption, expired, and discarded audit logging
- Smart reorder calculation using configurable consumption windows
- Low-stock, expiry, and reorder alerts
- Reorder and full-inventory reports
- PDF, CSV, and Excel export from the browser
- Express API surface for the planned `/api/v1` endpoints
- Prisma schema for the PostgreSQL production data model

## Run Locally

Install dependencies once:

```bash
npm run setup
```

Start the API and frontend together from the project root:

```bash
npm run dev
```

This runs the backend at `http://localhost:4000` and the frontend at `http://localhost:5173`. Press `Ctrl+C` in that terminal to stop both.

The frontend defaults to local browser storage so it is usable immediately. The backend currently runs as a local demo API with in-memory data; the Prisma schema is ready for database wiring when Supabase/PostgreSQL credentials are available.
