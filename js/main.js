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
});

/**
 * Membership signup form handling.
 *
 * SETUP FOR THE CLIENT (no coding needed):
 * 1. Create a free form endpoint at https://formspree.io (or similar) and
 *    replace FORM_ENDPOINT below with your form's URL. This is where
 *    signup details (name, email, plan, travel interest) get delivered
 *    to your inbox.
 * 2. Create three Stripe Payment Links (Products > Payment Links) in your
 *    Stripe account — one per membership tier — and paste each URL into
 *    the STRIPE_LINKS object below. Stripe handles all card payments,
 *    receipts, and recurring monthly billing automatically.
 * 3. That's it — when someone submits the form, their info is captured
 *    AND they're taken straight to secure checkout for the plan they chose.
 */
const FORM_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID';

const STRIPE_LINKS = {
  spark: 'https://buy.stripe.com/REPLACE_WITH_SPARK_PAYMENT_LINK',
  circle: 'https://buy.stripe.com/REPLACE_WITH_CIRCLE_PAYMENT_LINK',
  studio: 'https://buy.stripe.com/REPLACE_WITH_STUDIO_PAYMENT_LINK',
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

    const placeholder = FORM_ENDPOINT.includes('REPLACE_WITH');

    try {
      if (!placeholder) {
        await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
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
 * Travel interest form — simple lead capture, same Formspree endpoint
 * (or set TRAVEL_FORM_ENDPOINT to a separate one if you'd rather keep
 * travel inquiries in their own inbox/folder).
 */
const TRAVEL_FORM_ENDPOINT = FORM_ENDPOINT;

function initTravelForm() {
  const form = document.getElementById('travel-form');
  if (!form) return;
  const status = document.getElementById('travel-form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.classList.remove('ok', 'err');
    const data = new FormData(form);
    const placeholder = TRAVEL_FORM_ENDPOINT.includes('REPLACE_WITH');

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.setAttribute('aria-disabled', 'true');
    submitBtn.textContent = 'Sending…';

    try {
      if (!placeholder) {
        await fetch(TRAVEL_FORM_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
      }
      status.textContent =
        "Thank you! We'll be in touch with details on our next painting retreat.";
      status.classList.add('show', 'ok');
      form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong. Please email us directly.';
      status.classList.add('show', 'err');
    } finally {
      submitBtn.removeAttribute('aria-disabled');
      submitBtn.textContent = 'Request Retreat Info';
    }
  });
}

document.addEventListener('DOMContentLoaded', initTravelForm);
