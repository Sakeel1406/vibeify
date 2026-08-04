# Spotify Clone — MERN Stack Music Streaming App

A full-stack Spotify-inspired music streaming web app built with MongoDB, Express, React, and Node.js.

> ⚠️ For learning/portfolio use only. Don't use Spotify's actual logos, branding, or artwork if you plan to publish this publicly — see the note at the bottom.

## Features

- **Auth** — Register, login, JWT-based sessions, logout
- **Player** — Play/pause, next/previous, shuffle, repeat, volume, seekable progress bar
- **Playlists** — Create, delete, rename, add/remove songs
- **Search** — Search songs, browse by artist/album
- **Library** — Liked songs, recently played, your playlists
- **Admin** — Upload songs (audio + cover image), delete songs

## Tech Stack

- **Frontend:** React 18, React Router, Axios, React Icons, Vite
- **Backend:** Node.js, Express, JWT, Multer, bcryptjs
- **Database:** MongoDB + Mongoose

## Project Structure

```
spotify-clone/
├── client/     React frontend (Vite)
└── server/     Express + MongoDB backend
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 2. Install dependencies

From the project root:
```bash
npm run install:all
```
Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

`server/.env` already exists with defaults — edit it:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/spotify-clone
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```
If you're using MongoDB Atlas, replace `MONGO_URI` with your connection string.

### 4. Run the app

From the project root (runs both client and server together):
```bash
npm run dev
```
Or in two terminals:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

- Backend API: http://localhost:5000
- Frontend: http://localhost:5173 (Vite proxies `/api` and `/uploads` to the backend automatically)

### 5. Upload songs (Admin)

New users register with role `"user"` by default. To upload songs, promote yourself to admin:

1. Register a normal account through the app.
2. Open your MongoDB shell / Atlas UI / Compass, find your user in the `users` collection, and change:
   ```json
   { "role": "admin" }
   ```
3. Log out and back in (or just refresh), then visit `/admin` in the app to upload songs (title, artist, album, audio file, cover image).

Uploaded files are stored in `server/uploads/songs` and `server/uploads/images`, and served statically at `/uploads/...`.

## API Endpoints

```
POST    /api/auth/register
POST    /api/auth/login
GET     /api/auth/me

GET     /api/songs
GET     /api/songs/:id
POST    /api/songs                (admin, multipart: audio, image, title, artist, album)
DELETE  /api/songs/:id            (admin)
PUT     /api/songs/:id/like       (toggle like)
GET     /api/songs/liked/me
POST    /api/songs/:id/play       (record recently played)
GET     /api/songs/recent/me

GET     /api/playlists
GET     /api/playlists/:id
POST    /api/playlists
PUT     /api/playlists/:id        (rename / addSongId / removeSongId)
DELETE  /api/playlists/:id
```

## Notes

- This project avoids Spotify's actual logos, brand colors' exact hex values, and artwork — it's a UI/UX-inspired clone for learning purposes. If you plan to publish or distribute it, swap in your own branding and only upload music/artwork you have rights to use.
- The client was built and dependency-checked, but `npm install` wasn't run in the delivery sandbox (no network access there) — install locally as described above before running.
