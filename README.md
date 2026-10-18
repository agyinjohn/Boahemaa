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
| **Admin** (`/admin`) | Password-protected dashboard to **publish news, upload videos, upload team photos and review applications** |

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

The site works in two modes, picked automatically from the environment variables:

| | **Local mode** (no accounts needed) | **Cloud mode** (for Vercel) |
|---|---|---|
| Uploaded files (images, videos, ID documents) | `data/uploads/` on your computer | **Cloudinary** |
| Data (news, videos, applications, team photos) | JSON files in `data/` | **Upstash Redis** |
| Turned on when | the variables below are empty | the variables below are set |

In cloud mode, files are uploaded **straight from the browser to Cloudinary**, so large videos never pass through Vercel (which only accepts about 4.5 MB per request). Customer ID documents are uploaded as private files, and only a logged-in admin can open them, through a link that expires after 10 minutes. News images and team photos are automatically resized and compressed by Cloudinary.

`data/news.json` holds 4 sample stories. They show on a fresh deployment until the first change is saved.

## Deploy to Vercel

1. **Cloudinary:** create a free account at [cloudinary.com](https://cloudinary.com). On the dashboard, copy your *Cloud name*, *API key* and *API secret*.
2. **Vercel:** import this GitHub repo at [vercel.com/new](https://vercel.com/new).
3. **Redis:** in the Vercel project, open **Storage → Create → Upstash for Redis** (free plan) and connect it to the project. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` for you.
4. **Environment variables:** in **Settings → Environment Variables**, add:
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `ADMIN_PASSWORD` (choose your own) and `SESSION_SECRET` (any long random text)
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect.

To try cloud mode locally, copy `.env.example` to `.env.local` and fill in the same values.

> If PDFs uploaded as ID documents won't open, turn on **Settings → Security → "Allow delivery of PDF and ZIP files"** in Cloudinary.

## Editing content

- Company info, products, team, projects, timeline and stats: `src/lib/site.ts`
- Colours and fonts: `src/app/globals.css`
- News, videos and team photos: use the admin dashboard (**Admin → Team photos** to upload a photo for each person)

## Project structure

```
src/
  app/
    (site)/        public pages (home, about, team, projects, news, videos, apply, contact)
    admin/         login + dashboard (applications, news, videos)
    actions.ts     server actions (apply, login, publish news/videos, update applications)
    uploads/       serves uploaded images/videos
  components/      navbar, footer, cards and admin UI
  lib/             db.ts (Redis / JSON files), storage.ts (Cloudinary / local uploads), auth, site content
data/              sample news + local-mode data and uploads
```
