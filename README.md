# 3-Tier App

This project contains a simple three-tier application:

- Frontend: static HTML + JavaScript
- Backend: Node.js + Express API
- Database: MySQL-compatible schema, with SQLite fallback for quick local testing

## Project structure

- `backend/` - API server and database configuration
- `frontend/` - UI for interacting with the app
- `database/` - SQL script for database setup

## Run the app

1. Open a terminal in the `backend` folder.
2. Install dependencies:

   `npm install`

3. Start the backend:

   `npm start`

4. Open a second terminal and start a local static frontend server from the project root:

   `python -m http.server 3000 --directory frontend`

5. Open `http://localhost:3000` in the browser.

The API listens on port `5001` by default to avoid a local system service already using port `5000`.

## Database note

The database script in `database/three_tier_db.sql` is MySQL-based. If you want to run with MySQL locally, set the backend environment variables in `backend/.env`:

```env
PORT=5001
DB_CLIENT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=three_tier_db
```

If MySQL is unavailable, the backend automatically falls back to a local SQLite database so the app can still run.
