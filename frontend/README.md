UzAirways Frontend

Local development

- Prerequisites: Node 18+, npm 9+
- Backend runs on `http://localhost:3001/api` (NestJS with CORS enabled)

Setup

- `cd frontend`
- `npm install`
- Adjust `VITE_API_BASE_URL` in `.env` if needed
- `npm run dev` and open the URL shown (usually http://localhost:5173)

Pages

- `/login` – Login / Register
- `/search` – Flight search (airports autocomplete, date)
- `/bookings` – My bookings (requires login)

Notes

- JWT is stored in `localStorage` as `token`.
- API endpoints use the backend global prefix `/api`.

