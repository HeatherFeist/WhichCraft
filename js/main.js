// WhichCraft — shared site behavior
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', String(expanded));
    });
  }

  // Highlight active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll-reveal: fade/lift in cards, plans, steps, etc. as they enter
  // the viewport. Progressive enhancement only — everything is fully
  // visible without JS (see the reduced-motion fallback in style.css).
  const revealSelectors = [
    '.card', '.plan', '.step', '.quote-card', '.dest-card', '.teacher-card',
  ];
  const revealEls = document.querySelectorAll(revealSelectors.join(','));
  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach((el) => el.setAttribute('data-reveal', ''));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  }
});

/**
 * Membership signup form handling.
 *
 * Form delivery is powered by Web3Forms (web3forms.com) — every form on
 * the site posts here with a hidden `access_key` field (see each form's
 * HTML) tied to the client's inbox. No account/dashboard needed on their
 * end; submissions just arrive as email.
 *
 * SETUP FOR THE CLIENT (no coding needed) — Stripe checkout:
 * Create two Stripe Payment Links (Products > Payment Links) in your
 * Stripe account — one for Spark, one for Circle — and paste each URL
 * into the STRIPE_LINKS object below. Stripe handles all card payments,
 * receipts, and recurring monthly billing automatically. (The Studio
 * tier is invitation-only and isn't purchased/checked out — no link
 * needed for it.) Once set, submitting the signup form captures the
 * member's info AND takes them straight to secure checkout for the plan
 * they chose.
 */
const FORM_ENDPOINT = 'https://api.web3forms.com/submit';

const STRIPE_LINKS = {
  spark: 'https://buy.stripe.com/REPLACE_WITH_SPARK_PAYMENT_LINK',
  circle: 'https://buy.stripe.com/REPLACE_WITH_CIRCLE_PAYMENT_LINK',
};

function initMembershipForm() {
  const form = document.getElementById('membership-form');
  if (!form) return;

  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.classList.remove('ok', 'err');

    const data = new FormData(form);
    const plan = data.get('plan');

    if (!plan) {
      status.textContent = 'Please choose a membership plan above.';
      status.classList.add('show', 'err');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.setAttribute('aria-disabled', 'true');
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.success === false) {
        throw new Error(result.message || 'Submission failed');
      }

      status.textContent =
        "Thanks! We've got your info — taking you to secure checkout to finish your membership…";
      status.classList.add('show', 'ok');

      const checkoutUrl = STRIPE_LINKS[plan];
      if (checkoutUrl && !checkoutUrl.includes('REPLACE_WITH')) {
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1200);
      } else {
        status.textContent +=
          ' (Checkout link not configured yet — the site owner needs to add Stripe Payment Links in js/main.js.)';
      }
    } catch (err) {
      status.textContent =
        'Something went wrong sending your info. Please email us directly so we can help.';
      status.classList.add('show', 'err');
    } finally {
      submitBtn.removeAttribute('aria-disabled');
      submitBtn.textContent = 'Join the Community';
    }
  });
}

document.addEventListener('DOMContentLoaded', initMembershipForm);

/**
 * Simple lead-capture forms — travel interest, host applications, and
 * shop launch notifications all follow the same pattern: submit to
 * Web3Forms, show a success message, reset the form. Each currently
 * shares FORM_ENDPOINT (and therefore the same inbox, distinguished by
 * each form's hidden "subject" field); give any of them their own
 * Web3Forms access key below if you'd rather route those inquiries to a
 * separate inbox.
 *
 * NOTE ON SUPABASE: once the "Host a Party" program and marketplace are
 * ready for a real backend (tracking host applications/approvals, kit
 * inventory, member listings, and sales data to decide which kits stay
 * or get swapped out), these forms are the natural place to switch from
 * (or add alongside) Web3Forms to writing directly into Supabase tables
 * — that's already scaffolded in supabase/migrations/.
 */
const TRAVEL_FORM_ENDPOINT = FORM_ENDPOINT;
const HOST_FORM_ENDPOINT = FORM_ENDPOINT;
const SHOP_NOTIFY_ENDPOINT = FORM_ENDPOINT;
const SPOTLIGHT_FORM_ENDPOINT = FORM_ENDPOINT;
const CONTACT_FORM_ENDPOINT = FORM_ENDPOINT;

function initLeadForm({ formId, statusId, endpoint, sendingLabel, idleLabel, successMessage }) {
  const form = document.getElementById(formId);
  if (!form) return;
  const status = document.getElementById(statusId);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.classList.remove('ok', 'err');
    const data = new FormData(form);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.setAttribute('aria-disabled', 'true');
    submitBtn.textContent = sendingLabel;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.success === false) {
        throw new Error(result.message || 'Submission failed');
      }
      status.textContent = successMessage;
      status.classList.add('show', 'ok');
      form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong. Please email us directly.';
      status.classList.add('show', 'err');
    } finally {
      submitBtn.removeAttribute('aria-disabled');
      submitBtn.textContent = idleLabel;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLeadForm({
    formId: 'travel-form',
    statusId: 'travel-form-status',
    endpoint: TRAVEL_FORM_ENDPOINT,
    sendingLabel: 'Sending…',
    idleLabel: 'Request Retreat Info',
    successMessage: "Thank you! We'll be in touch with details on our next painting retreat.",
  });

  initLeadForm({
    formId: 'host-form',
    statusId: 'host-form-status',
    endpoint: HOST_FORM_ENDPOINT,
    sendingLabel: 'Submitting…',
    idleLabel: 'Submit Host Application',
    successMessage:
      "Thanks for applying to host! We'll review your application and follow up soon to confirm a date.",
  });

  initLeadForm({
    formId: 'shop-notify-form',
    statusId: 'shop-notify-status',
    endpoint: SHOP_NOTIFY_ENDPOINT,
    sendingLabel: 'Sending…',
    idleLabel: 'Notify Me',
    successMessage: "You're on the list! We'll email you the moment the shop opens.",
  });

  initLeadForm({
    formId: 'spotlight-form',
    statusId: 'spotlight-form-status',
    endpoint: SPOTLIGHT_FORM_ENDPOINT,
    sendingLabel: 'Submitting…',
    idleLabel: 'Submit to Spotlight',
    successMessage:
      "Thanks! Your submission is in — we'll review it and let you know if it's shortlisted for a community vote.",
  });

  initLeadForm({
    formId: 'contact-form',
    statusId: 'contact-form-status',
    endpoint: CONTACT_FORM_ENDPOINT,
    sendingLabel: 'Sending…',
    idleLabel: 'Send Message',
    successMessage: "Thanks for reaching out — we'll get back to you soon.",
  });
});
