# WhichCraft

A community website connecting local crafters through **live monthly craft & painting sessions**, a **paid membership**, and **group painting travel retreats** around the world.

This is a static site (plain HTML/CSS/JS) — no build step, no server required. It can be hosted for free on GitHub Pages, Netlify, or Vercel.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home page — overview, plan teaser, testimonials |
| `membership.html` | Full plan comparison **+ the signup form** |
| `travel.html` | Group painting travel retreats, destinations, interest form |
| `about.html` | Instructor bio / story |
| `contact.html` | General contact form |

## What's already built

- Responsive design (mobile nav, works on phones/tablets/desktop)
- Three membership tiers (Spark / Circle / Studio) with full feature comparison
- A signup form that collects member details and routes to checkout by plan
- A travel-retreat interest/lead form
- FAQ section, testimonials, "how it works" steps

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
2. In the Stripe Dashboard, go to **Product catalog → Add product**, and create three recurring monthly products — one per tier (e.g. Spark $19/mo, Circle $39/mo, Studio $69/mo).
3. For each product, create a **Payment Link** (Stripe generates a hosted checkout page — no coding needed).
4. In `js/main.js`, paste each link into:
   ```js
   const STRIPE_LINKS = {
     spark: 'https://buy.stripe.com/...',
     circle: 'https://buy.stripe.com/...',
     studio: 'https://buy.stripe.com/...',
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
