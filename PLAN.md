# SUSU BOX: Website Plan (School Assignment)

**Client:** SUSU BOX, a fictional insurance company for a school project.
**Goal:** a simple, clean website that covers what the brief asks for. Nothing more.

---

## What the brief asks for

| Brief | What we build |
|---|---|
| Insurance company | Home page introducing SUSU BOX and its insurance types |
| History | About page with a short story and a timeline |
| Workers | Team page with photo cards (name + role) |
| Projects | Projects page with image cards |
| Application portal | An "Apply" form that saves applications |
| News stories & videos | A News page, plus a simple admin page to add stories and videos |

---

## Pages (7 total)

1. **Home**: banner, short intro, 3–4 insurance types (Health, Motor, Life, Property), latest news, "Apply Now" button
2. **About**: history timeline, mission & vision
3. **Team**: grid of staff cards
4. **Projects**: grid of project cards (image, title, short text)
5. **News & Videos**: list of news stories plus embedded YouTube videos
6. **Apply**: one form (name, phone, email, insurance type, message, optional ID upload) with a "Submitted!" message afterwards
7. **Admin** (password-protected): add/delete news stories and videos, view submitted applications

Every page shares one header (logo + menu) and one footer (contact info).

---

## Tech (keep it simple)

**Recommended:** HTML + CSS + JavaScript for the pages, and **PHP + MySQL** (run locally with XAMPP) for the parts that need saving:
- Apply form → saves to an `applications` table
- Admin → adds rows to a `news` table (title, text, image, YouTube link)
- News page → reads from the `news` table

Database (3 tables):
```
applications (id, full_name, phone, email, insurance_type, message, created_at)
news         (id, title, body, image, video_url, created_at)
admins       (id, username, password_hash)
```

**Alternatives if the course uses something else:** Firebase (no PHP needed) or plain WordPress.
Use whatever the lecturer expects; check the assignment guidelines.

---

## Build order

1. Header, footer, colours and logo (SUSU BOX branding)
2. Static pages: Home, About, Team, Projects
3. Apply form → saves to the database
4. Admin login → add news/videos
5. News page shows what admin added
6. Make it look good on phones (responsive CSS)
7. Fill with sample content and test everything

---

## Nice extras (only if there's time)
- Search on the News page
- Admin can mark an application "Approved / Rejected"
- Contact page with Google Map
