// External form endpoints. The site is `output: 'static'` on Amplify — there is no
// server and no serverless function — so every form posts straight to a third party.

// MailerLite JSONP subscribe endpoint. Posted with FormData + mode:'no-cors' from
// BaseLayout's delegated handler; we deliberately do not load webforms.min.js.
// Required fields: fields[email], fields[language], ml-submit=1, anticsrf=true.
export const MAILERLITE_SUBSCRIBE_ACTION =
  'https://assets.mailerlite.com/jsonp/2566948/forms/195410959002502556/subscribe';

// Formspree endpoint for the contact page. Plain native POST — Formspree answers
// with its own hosted "thanks" page, so no fetch/CORS dance is needed.
export const FORMSPREE_CONTACT_ACTION = 'https://formspree.io/f/mvkpkvzy';

// Shown as selectable text wherever a form appears, so there is a route to us
// even if the form provider breaks.
export const CONTACT_EMAIL = 'antonio.duran@insight-software.com';
