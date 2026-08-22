# WhichCraft

A community website connecting local crafters through **live monthly craft & painting sessions**, a **paid membership**, and **group painting travel retreats** around the world.

This is a static site (plain HTML/CSS/JS) — no build step, no server required. It can be hosted for free on GitHub Pages, Netlify, or Vercel.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home page — overview, plan teaser, testimonials |
| `membership.html` | Full plan comparison **+ the signup form** |
| `travel.html` | Group painting travel retreats, destinations, interest form |
| `shop.html` | Marketplace preview (work-from-home kits + member listings) + launch notify form |
| `spotlight.html` | Circle-member video submissions, community voting, path to livestream + Studio invitations |
| `host.html` | "Host a Party" application — a Circle-tier perk to host a home craft party |
| `about.html` | Meet the teachers (Heather & Linda) |
| `contact.html` | General contact form |

## The business model (for context)

**Membership tiers:**
- **Spark** ($19/mo) — entry tier: the monthly live session + that month's project kit.
- **Circle** ($39/mo) — the highest tier anyone can directly purchase. Adds: discounted Shop/marketplace pricing, eligibility to apply to host a party, and the ability to submit videos to Spotlight + vote on shortlisted submissions.
- **Studio** — **invitation only, not purchasable.** Reserved for standout Circle members (based on Spotlight performance, hosting, community involvement). Includes guaranteed livestream slots, 1:1 feedback, and early access to everything.

**Spotlight** (the discovery pipeline): Circle members submit a video link of their craft → Heather & Linda review and shortlist submissions → Circle members vote on the shortlist → standout/popular submissions get invited to demo live on the channel (final scheduling also depends on the production calendar, not the vote alone) → consistent standouts may be invited into Studio.

- **Host a Party**: a Circle-tier perk — members apply to host a get-together at their home (or another space), like a Tupperware party. WhichCraft supplies the teacher and project; the host picks a free item from the marketplace as a thank-you.
- **Marketplace/Shop**: sells work-from-home kits for the crafts taught in live sessions, plus lets members list their own finished pieces for sale. Kits are chosen/rotated based on how well each project performs after being taught live — popular ones become official kits, slow sellers get swapped out. Circle members get discounted pricing.
- **Livestreams**: weekly/possibly daily short-form content (TikTok, etc.) to build audience alongside the monthly deep-dive live session — Spotlight winners are a natural source of livestream content.
- **Travel retreats**: members travel together to paint a destination live, a few times a year.

## Planned backend: Supabase

The `host.html`, `shop.html`, and `spotlight.html` forms currently submit as simple lead-capture (Formspree), same as the rest of the site. Once a **Supabase** project exists for this app, the natural next step is wiring these forms (and eventually membership, kit inventory, and marketplace listings/orders) directly into Supabase tables instead of/alongside Formspree — for things like:
- Real membership tiers tied to member accounts (so "Circle-only" pages/actions can actually be gated, not just labeled)
- Tracking host applications and approval status
- Kit/product inventory and per-kit sales performance (to decide what to keep vs. swap out)
- Member-submitted marketplace listings
- **Spotlight submissions, the review/shortlist status, and one-vote-per-member voting** (this one specifically needs Supabase Auth, not just a database table, to prevent duplicate/fraudulent votes)

To wire this up, share the Supabase **project URL** and **anon/public API key** (found in Supabase → Project Settings → API) and the relevant tables/forms can be connected.

## What's already built

- Responsive design (mobile nav, works on phones/tablets/desktop)
- Two purchasable membership tiers (Spark / Circle) with full feature comparison, plus an invitation-only Studio tier
- A signup form that collects member details and routes to checkout by plan
- A travel-retreat interest/lead form
- Host a Party application form
- Shop/Marketplace preview with launch-notify form
- Spotlight submission form (video link) with the review → vote → invite funnel explained
- FAQ sections, testimonials, "how it works" steps throughout

## What YOU need to configure before launch (no coding required)

Open `js/main.js` — everything you need to change is at the top of the file, clearly marked.

### 1. Connect the signup form to your inbox (Formspree)

1. Go to [formspree.io](https://formspree.io) and create a free account.
2. Create a new form and copy the endpoint URL it gives you (looks like `https://formspree.io/f/xxxxxxx`).
3. In `js/main.js`, replace:
   ```js
   const FORM_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID';
   ```
   with your real endpoint URL.

This single endpoint powers both the membership signup form and the travel interest form, so every submission lands in your inbox. (You can point `TRAVEL_FORM_ENDPOINT` to a second Formspree form if you'd like travel inquiries kept separate.)

### 2. Connect Stripe for monthly membership billing

1. Create a free [Stripe](https://stripe.com) account (or use your existing one).
2. In the Stripe Dashboard, go to **Product catalog → Add product**, and create two recurring monthly products — Spark ($19/mo) and Circle ($39/mo). (Studio is invitation-only and isn't purchased through checkout, so it doesn't need a product/link.)
3. For each product, create a **Payment Link** (Stripe generates a hosted checkout page — no coding needed).
4. In `js/main.js`, paste each link into:
   ```js
   const STRIPE_LINKS = {
     spark: 'https://buy.stripe.com/...',
     circle: 'https://buy.stripe.com/...',
   };
   ```

Once both are set, the flow is: a visitor fills out the signup form → their details are emailed to you via Formspree → they're automatically redirected to the correct Stripe checkout page to complete payment and start their subscription.

### 3. Update placeholder content

Search the site for bracketed notes like `[Client: ...]` — these mark spots to add your real name, bio, headshot photo, business email, and social links (currently `#` placeholders in the footer).

Membership pricing, descriptions, retreat destinations, and testimonials in `membership.html`, `travel.html`, and `index.html` are realistic starting points — edit the text directly in those files to match your actual offerings.

## Local preview

No install needed — just open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

**GitHub Pages (free, recommended for a static site like this):**
1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to **Settings → Pages** in the repository.
3. Set source to the `main` branch, root folder.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

**Netlify / Vercel:** drag-and-drop the project folder, or connect the GitHub repo — no build command needed (leave the publish/output directory as the repo root).

## Project structure

```
WhichCraft/
├── index.html
├── membership.html
├── travel.html
├── about.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/          (add your own photos here)
└── README.md
```
