# Insurance Company Website: Project Plan

## 1. What the client asked for

> Insurance company · History · Workers · Projects · Application portal · "and stuff like that" · Areas to upload news stories and videos

In practice that means three things:

1. **A public website** that presents the company and builds trust (who they are, their history, their team, their products and projects).
2. **An application portal** where customers apply for insurance (and later track applications or file claims).
3. **An admin area (CMS)** where staff publish news, videos, team profiles and projects themselves, without a developer.

---

## 2. Sitemap

```
Home
├── About Us
│   ├── Our History (timeline)
│   ├── Mission, Vision & Values
│   ├── Leadership / Board
│   └── Our Team (Workers)
├── Insurance Products
│   ├── Life / Health / Motor / Property / Travel / Business (as applicable)
│   └── Each product page → "Apply Now" button
├── Projects & CSR (community projects, partnerships, case studies)
├── Media Centre
│   ├── News & Press Releases
│   ├── Videos
│   └── Photo Gallery
├── Apply Online  (Application Portal)
├── Claims (how to file a claim, claim form)
├── Careers (job openings + CV upload)
├── FAQs
├── Contact Us (branches, map, phone, WhatsApp, form)
└── Legal: Privacy Policy, Terms, Regulatory Licence info
```

---

## 3. Features by section

### Public website
| Section | Features |
|---|---|
| Home | Hero banner/slider, product highlights, "Get a Quote / Apply" call to action, latest news, testimonials, partner logos |
| History | Visual timeline of milestones, founder story, photos |
| Team | Staff cards (photo, name, role, short bio), filter by department, managed from admin |
| Projects | Project cards with images, description, date, location; detail page per project |
| Products | One page per product: benefits, what's covered, eligibility, downloadable brochure, apply button |
| News | Article list with categories, search, share buttons, detail page with images |
| Videos | Embedded YouTube/Vimeo or uploaded videos, organised by playlist/category |
| Contact | Form, branch locator with map, click-to-call, WhatsApp chat button |

### Application portal
- Customer selects a product → fills a **multi-step form** (personal details → coverage details → beneficiaries → document upload → review & submit).
- Upload ID cards, photos, supporting documents.
- Customer gets a **reference number** plus email/SMS confirmation.
- **Phase 2:** customer accounts (login), track application status, renew policy, file and track claims, pay premiums online (card / mobile money).

### Admin dashboard (for client staff)
- Publish, edit and schedule **news stories**
- Upload or embed **videos**, manage the photo gallery
- Manage **team members**, **projects**, **products**, **job openings**
- View, filter and export **applications**, change status (Pending → Under Review → Approved/Rejected), with automatic email/SMS to the applicant
- View contact form messages and claims
- User roles: Super Admin, Editor (content only), Underwriter (applications only)

---

## 4. Recommended tech stack

| Layer | Option A: Modern (recommended) | Option B: Budget / fast |
|---|---|---|
| Frontend | Next.js (React) + Tailwind CSS | WordPress theme |
| CMS (news, videos, team, projects) | Sanity or Strapi (headless CMS) | WordPress admin |
| Application portal backend | Next.js API routes + PostgreSQL (e.g. Supabase) | WordPress + Gravity Forms / WPForms |
| File storage (documents, images) | Supabase Storage / AWS S3 / Cloudinary | WordPress media library |
| Videos | YouTube embeds (free, fast) or Cloudinary/Mux for self-hosted | YouTube embeds |
| Email / SMS | Resend or SendGrid; local SMS gateway (e.g. Hubtel, Arkesel) | Plugin-based |
| Payments (phase 2) | Paystack / Flutterwave (cards + mobile money) | WooCommerce + Paystack |
| Hosting | Vercel + Supabase | Managed WordPress host |

**Recommendation:** Option A if the portal will grow (accounts, claims, payments). Option B if the client mostly needs a content site with a simple application form, on a tight budget.

---

## 5. Security & compliance (insurance sites handle sensitive data)
- HTTPS everywhere; encrypted storage for uploaded IDs and documents
- Role-based admin access, strong passwords / 2FA for staff
- Data protection compliance (e.g. Ghana Data Protection Act, 2012 or local equivalent), with consent checkbox on forms
- Display regulator licence details (e.g. National Insurance Commission) in the footer
- Spam protection on forms (reCAPTCHA / Turnstile)
- Regular automated backups

---

## 6. Delivery phases & rough timeline

| Phase | Scope | Est. time |
|---|---|---|
| 0. Discovery | Meet the client, gather content, brand assets, product list, answer questions in section 8 | 1 week |
| 1. Design | Wireframes → high-fidelity mockups (desktop + mobile), client sign-off | 1–2 weeks |
| 2. Public site + CMS | All public pages, news/video/team/project management | 3–4 weeks |
| 3. Application portal (MVP) | Online application forms, document upload, admin review, email/SMS notifications | 2–3 weeks |
| 4. Testing & launch | Content loading, QA on mobile, SEO setup, Google Analytics, staff training, go-live | 1 week |
| 5. Phase 2 (optional) | Customer accounts, claims tracking, online premium payments, renewals | 4–6 weeks |

**MVP (phases 0–4): about 8–11 weeks.**

---

## 7. Deliverables to quote the client
1. Responsive website (mobile, tablet, desktop)
2. Admin dashboard + staff training session and short user guide
3. Online application portal (MVP)
4. Basic SEO setup, Google Analytics, Google Business Profile link
5. Domain/hosting setup and business email (if needed)
6. 1–3 months post-launch support / maintenance (then a monthly retainer)

---

## 8. Questions to ask the client before quoting
1. Which insurance products do they offer? (Each product may need a different application form.)
2. Should the portal only **collect applications**, or also let customers **log in, pay, renew and file claims**?
3. Do they already have a **logo, brand colours, photos and videos**? Or do we need a photoshoot / content writing?
4. How many staff will use the admin area, and who approves applications?
5. Do they want **online payments** (mobile money, card)? Which provider do they bank with?
6. Do they have existing internal systems (policy admin software) the portal must connect to?
7. Do they already own a **domain name** and hosting?
8. Languages needed (English only, or local languages too)?
9. Any website they like the look of (competitors or others)?
10. What's the budget range and the target launch date?

---

## 9. Next steps
1. Send the client this plan plus the questions in section 8.
2. Agree scope (MVP vs. full) and stack (Option A or B).
3. Produce wireframes for Home, Product, Apply and News pages.
4. Send a quote and timeline for approval, then start build.
