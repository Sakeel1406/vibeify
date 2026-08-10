# Vibeify-Dynamic Audio Player — MERN Stack Music Streaming App / Vibeify

A full-stack Spotify-inspired music streaming web app built with MongoDB, Express, React, and Node.js. Check out the live version at [Vibeify](https://vibeify-ashy.vercel.app/).

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

```text
vibeify/
├── client/          # React frontend (Vite)
│   ├── src/
│   ├── public/
│   └── package.json
└── server/          # Express + MongoDB backend
    ├── models/
    ├── routes/
    ├── uploads/
    └── package.json
