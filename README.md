# SUSU BOX Insurance Website

A school-project website for **SUSU BOX**, a fictional Ghanaian insurance company. Built with **Next.js 15 (React + Node.js)** and **Tailwind CSS**.

## Features

| Area | What it does |
|---|---|
| **Home** | Hero, insurance products, stats, story teaser, how it works, latest news, testimonials |
| **Our Story** (`/about`) | Company history timeline, mission, vision & values |
| **Insurance** (`/insurance`) | All plans with benefits and daily prices |
| **Our People** (`/team`) | Leadership and staff profiles |
| **Projects** (`/projects`) | Community projects and programmes |
| **News** (`/news`) | News stories with category filter and article pages |
| **Videos** (`/videos`) | YouTube or uploaded videos |
| **Contact** (`/contact`) | Phone, WhatsApp, email, branches, map |
| **Apply** (`/apply`) | Application form in 3 steps with ID upload and a reference number |
| **Admin** (`/admin`) | Password-protected dashboard to **publish news, upload videos and review applications** |

## Run it

Requires Node.js 18.18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The admin dashboard is at http://localhost:3000/admin.

**Default admin password:** `susubox123`

To change it, copy `.env.example` to `.env.local` and set your own `ADMIN_PASSWORD` and `SESSION_SECRET`.

For a production build: `npm run build && npm start`.

## How data is stored

To keep things simple there is no database server. Everything is saved as JSON files in the `data/` folder:

- `data/news.json`: news stories (comes with 4 sample stories)
- `data/videos.json`: videos
- `data/applications.json`: applications submitted on the website (created automatically)
- `data/uploads/`: uploaded images and videos. Customer ID documents go in `data/uploads/private/` and only logged-in admins can open them.

> Note: because data is saved to files, host it somewhere with a persistent disk (e.g. Render, Railway or a VPS). Vercel's serverless hosting does not keep files written at runtime.

## Editing content

- Company info, products, team, projects, timeline and stats: `src/lib/site.ts`
- Colours and fonts: `src/app/globals.css`
- News and videos: use the admin dashboard

## Project structure

```
src/
  app/
    (site)/        public pages (home, about, team, projects, news, videos, apply, contact)
    admin/         login + dashboard (applications, news, videos)
    actions.ts     server actions (apply, login, publish news/videos, update applications)
    uploads/       serves uploaded images/videos
  components/      navbar, footer, cards and admin UI
  lib/             data storage, auth and site content
data/              JSON "database" + uploads
```
