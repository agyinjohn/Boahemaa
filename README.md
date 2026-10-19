# SUSU BOX Insurance Website

A school-project website for **SUSU BOX**, a fictional Ghanaian insurance company. Built with **Next.js 15 (React + Node.js)** and **Tailwind CSS**.

## Features

| Area | What it does |
|---|---|
| **Home** | Hero, insurance products, stats, story teaser, how it works, latest news, testimonials |
| **Our Story** (`/about`) | Company history timeline, mission, vision & values |
| **Insurance** (`/insurance`) | All plans with benefits and daily prices |
| **Our People** (`/team`) | Leadership and staff profiles (managed in Admin → Team) |
| **Projects** (`/projects`) | Community projects and programmes (managed in Admin → Projects) |
| **News** (`/news`) | News stories with category filter and article pages |
| **Videos** (`/videos`) | YouTube or uploaded videos |
| **Contact** (`/contact`) | Contact form (messages go to Admin → Messages), phone, WhatsApp, email, branches, map |
| **Apply** (`/apply`) | Application form in 3 steps with ID upload, a reference number and **online payment** |
| **Pay** (`/pay/<reference>`) | Pay the first premium by **Mobile Money or card through Paystack** (link is also sent by SMS) |
| **My account** (`/account`) | Customers sign in with their **phone number + SMS code**, see their policies and payments, **make claims** with photos/documents and track them |
| **SMS** | **mNotify** texts customers when they apply, pay, sign in, file a claim, and when an application or claim changes status |
| **Admin** (`/admin`) | Password-protected dashboard to **publish and edit news, upload videos, manage the team and projects, review applications and payments, read contact messages, and see every SMS sent** |

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

## Payments (Paystack) and SMS (mNotify)

**How it works**

1. A customer applies. The price is the plan's monthly premium from `src/lib/site.ts`, always worked out on the server.
2. They get an SMS with their reference number and a payment link, and can pay straight away on the success screen.
3. **Pay** opens Paystack's secure checkout (MTN MoMo, Telecel Cash, AirtelTigo Money, Visa, Mastercard).
4. Paystack sends them back to `/pay/callback`. The site **verifies the payment with Paystack**, marks the application paid and sends an SMS receipt. The webhook at `/api/paystack/webhook` does the same if they close the browser early. A payment is only recorded once.
5. When staff change an application to *Under Review*, *Approved* or *Rejected*, the customer gets an SMS.

**Admin**

- **Applications** shows Paid/Unpaid, the amount and payment method, and a *Resend payment link by SMS* button.
- **SMS log** lists every message with its status: `sent`, `failed` (with mNotify's error) or `simulated`. It also has a *Send a test SMS* form.
- **Overview** shows premiums collected and whether Paystack and mNotify are connected.

**Setting it up**

| Service | What to do |
|---|---|
| **Paystack** | Create an account at [paystack.com](https://paystack.com) (Ghana). Copy the **test secret key** (`sk_test_…`) from *Settings → API Keys & Webhooks* into `PAYSTACK_SECRET_KEY`. On the same page set the **webhook URL** to `https://<your-site>/api/paystack/webhook`. Test payments use Paystack's test cards and test MoMo numbers; no real money moves. Switch to the `sk_live_…` key only once the business is verified. |
| **mNotify** | Create an account at [mnotify.com](https://www.mnotify.com), buy some SMS credit, and **register a sender ID** (e.g. `SUSUBOX`; approval can take a day or two). Put the API key in `MNOTIFY_API_KEY` and the sender ID in `MNOTIFY_SENDER_ID`. Optionally set `ADMIN_SMS_PHONE` to get a text for every new application. |

Without these keys the site still works: the Pay button is hidden, and SMS messages are recorded in the SMS log as `simulated`, which is handy for a demo.

## Customer accounts and claims

**Signing in:** customers go to **My account**, enter the phone number they applied with, and get a 6-digit code by SMS. There are no passwords. Codes expire after 10 minutes and allow 5 wrong tries; sending codes is limited to 3 per number per 15 minutes (plus the usual spam protection). The account shows every application made with that phone number.

**Demo mode:** if mNotify isn't set up, the code is shown on screen instead of texted. This happens automatically with `npm run dev`. On a live site it only happens when `ALLOW_DEMO_LOGIN=true`, because it lets anyone sign in as any number, so only turn that on for a classroom demo.

**Policies:** an application becomes an **active policy** once an admin approves it *and* the first premium is paid. Customers see each one as Active, Awaiting payment (with a Pay button), Being processed, or Not approved.

**Claims:** customers with an active policy can **make a claim**: pick the policy, what happened (options depend on the product), the date, a description, an optional amount, and up to 5 photos/PDFs (stored privately). They can follow it through **Submitted → Under Review → Approved → Paid** (or More Info Needed / Rejected) and read notes from staff.

**Admin → Claims:** filter by status, read the details, open the documents, call or WhatsApp the customer, and update the status with a note and the approved amount. Every change is texted to the customer and kept in the claim's history. `ADMIN_SMS_PHONE` also gets a text for each new claim.

## Spam protection

The application form, contact form and admin login are protected by:

1. **Honeypot:** a hidden field that people never see but bots fill in. Those submissions are quietly dropped (the bot is shown a fake "success").
2. **Time check:** each form carries a signed timestamp. Submissions sent less than 3 seconds after the page loaded, or with a forged or expired (over 24 hours) token, are rejected.
3. **Cloudflare Turnstile (optional):** a free CAPTCHA that most visitors pass without clicking anything. The Submit/Sign in button unlocks once the check passes, and the server confirms every token with Cloudflare.
4. **Rate limits per IP address:** 5 applications and 5 contact messages per hour, and 10 login attempts per 15 minutes. On Vercel the counts are kept in Redis so they apply across all servers. This also stops bots from using up your SMS credit.

**Turning on Turnstile:** in the [Cloudflare dashboard](https://dash.cloudflare.com) open **Turnstile → Add widget**, choose *Managed* mode, and add your site's domain (plus `localhost` for local testing). Copy the keys into `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, then redeploy. To try it without an account, use Cloudflare's test keys: site key `1x00000000000000000000AA` and secret `1x0000000000000000000000000000000AA` (always pass). Without the keys, the other three protections still apply.

The limits are set in `src/app/actions.ts` (`checkSpam(fd, "apply")`, `rateLimit("login:…", 10, 15 * 60)`).

## Deploy to Vercel

1. **Cloudinary:** create a free account at [cloudinary.com](https://cloudinary.com). On the dashboard, copy your *Cloud name*, *API key* and *API secret*.
2. **Vercel:** import this GitHub repo at [vercel.com/new](https://vercel.com/new).
3. **Redis (required):** in the Vercel project, open **Storage**, create a free **Upstash for Redis** database (or Vercel's **Redis**) and **connect it to the project**. Vercel adds the connection settings for you. The site understands `KV_REST_API_URL` + `KV_REST_API_TOKEN`, `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (with or without a prefix such as `STORAGE_`), and `REDIS_URL`.
4. **Environment variables:** in **Settings → Environment Variables**, add:
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `PAYSTACK_SECRET_KEY`, `MNOTIFY_API_KEY`, `MNOTIFY_SENDER_ID` (see the section above)
   - optionally `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` (see *Spam protection*)
   - `ADMIN_PASSWORD` (choose your own) and `SESSION_SECRET` (any long random text)
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect.

To try cloud mode locally, copy `.env.example` to `.env.local` and fill in the same values.

**Check it worked:** sign in to `/admin`. The status cards at the top show **Database: Connected** and **File uploads: Cloudinary**. If anything is missing on Vercel, a red banner explains what to add.

> **"Application error: a server-side exception has occurred" when applying** means no database was connected when the site was deployed (Vercel can't save files). Connect Redis as in step 3, then **redeploy**. The site now shows customers a polite message instead, and the Vercel logs say `[SUSU BOX setup] …` with what's missing.

> If PDFs uploaded as ID documents won't open, turn on **Settings → Security → "Allow delivery of PDF and ZIP files"** in Cloudinary.

## Editing content

- **In the admin dashboard:** news stories, videos, team members (with photos) and projects. Team and projects can be added, edited, removed and put in order with the arrows. People in the *Leadership* department appear in the large cards; the first project is the wide featured card.
- **In code:** company details, insurance products and prices, the history timeline and stats live in `src/lib/site.ts`. The `team` and `projects` lists there are only the starting content, copied in the first time the site runs.
- **Colours and fonts:** `src/app/globals.css`

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
