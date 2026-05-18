// scripts/import-home.mjs
//
// Generates scripts/data/homePage-en.ndjson for the `homePage` schema.
// Note: most homepage sections (model cards, feature grid, pricing table,
// getting-started steps, blog feed) are hardcoded in the Astro template.
// This script only populates the CMS-controlled fields: hero, stats, and FAQ.
//
// Usage:  node scripts/import-home.mjs
// Import: cd studio && npx sanity dataset import ../scripts/data/homePage-en.ndjson production --replace

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const OUTPUT_PATH = 'scripts/data/homePage-en.ndjson';
const key = () => randomUUID().replace(/-/g, '').slice(0, 12);
function span(text, marks = []) { return { _type: 'span', _key: key(), text, marks }; }
function block(children) { return { _type: 'block', _key: key(), style: 'normal', markDefs: [], children }; }
function pt(text) { return [block([span(text)])]; }

const doc = {
  _id: 'homePage-en',
  _type: 'homePage',
  language: 'en',

  // ── Hero ────────────────────────────────────────────────────────────
  heroLabel:      'Your AI Knowledge Hub',
  heroHeadline:   'Master AI Tokens,',
  heroAccentText: 'Models & APIs',
  heroSubtitle:   'The definitive English-language guide to understanding AI tokens, comparing language models, calculating API costs, and navigating the rapidly evolving AI ecosystem — all in one place.',

  heroStats: [
    { _key: key(), _type: 'heroStat', statNumber: '60+',  statLabel: 'AI Models Covered' },
    { _key: key(), _type: 'heroStat', statNumber: '1000+', statLabel: 'Token Calculations' },
    { _key: key(), _type: 'heroStat', statNumber: 'Free', statLabel: 'Always & Forever' },
  ],

  // ── Token explainer ──────────────────────────────────────────────────
  tokenBody2: [block([
    span('Every API call you make is billed in tokens: '),
    span('input tokens', ['strong']),
    span(' (what you send) and '),
    span('output tokens', ['strong']),
    span(' (what the model generates). Mastering token math is essential for anyone building with AI.'),
  ])],

  // ── FAQ ─────────────────────────────────────────────────────────────
  faqTitle:    'Frequently Asked Questions',
  faqSubtitle: "Everything you've been wondering about AI tokens, APIs, and costs — answered.",

  faq: [
    {
      _key: key(), _type: 'faqItem',
      question: 'What is an AI Token?',
      answer: pt('A token is the basic unit that AI language models use to process text. In English, one token is roughly 4 characters or ¾ of a word. For example, "ChatGPT" is one token, "tokenization" is about 3 tokens. Models read and generate text token by token, and API pricing is based on the number of tokens used.'),
    },
    {
      _key: key(), _type: 'faqItem',
      question: 'What are Input Tokens and Output Tokens?',
      answer: pt("Input tokens are the tokens in your prompt — the text you send to the model. Output tokens are the tokens in the model's response. Most AI APIs charge different rates for input vs output, with output tokens typically costing more (often 3–5x more) because generating text is more computationally expensive than reading it."),
    },
    {
      _key: key(), _type: 'faqItem',
      question: 'What is a Model API?',
      answer: pt('A model API (Application Programming Interface) lets developers access AI language models programmatically. Instead of using a chat interface like ChatGPT, you send HTTP requests with your prompt and receive a response. This allows you to integrate AI into your own apps, automate workflows, and build products on top of models like GPT-4, Claude, or Gemini.'),
    },
    {
      _key: key(), _type: 'faqItem',
      question: 'How do I find the right AI model for my use case?',
      answer: pt('Consider four factors: (1) Capability — does the model handle your task well? (2) Context window — how much text can it process at once? (3) Cost — what\'s your budget per 1M tokens? (4) Speed — do you need real-time responses? Our comparison tool helps you evaluate all these factors side by side.'),
    },
    {
      _key: key(), _type: 'faqItem',
      question: 'How much does 1,000 AI API calls cost?',
      answer: pt('It depends heavily on the model and your average prompt/response length. For GPT-4o mini with short prompts (~500 tokens in, ~200 out), 1,000 calls would cost roughly $0.075–$0.15. For GPT-4o with longer conversations, the same 1,000 calls could cost $5–$20. Use our Token Calculator to estimate your specific scenario.'),
    },
    {
      _key: key(), _type: 'faqItem',
      question: 'Why do different APIs count tokens differently?',
      answer: pt('Each AI provider uses a different tokenizer — the algorithm that splits text into tokens. OpenAI uses tiktoken (BPE-based), Anthropic uses their own tokenizer, and Google uses SentencePiece. The same sentence can tokenize into different numbers of tokens depending on which model you use. This is why you should always use the provider\'s official tokenizer when estimating costs.'),
    },
    {
      _key: key(), _type: 'faqItem',
      question: 'Should enterprise users read AI Token King first?',
      answer: pt('Absolutely. Enterprise teams often overspend on AI APIs because they don\'t understand token economics. AI Token King covers token optimization strategies, batch API usage, caching techniques, and how to choose the right model tier for different tasks within a single product — all of which can reduce costs by 50–80%.'),
    },
  ],

  // ── SEO ─────────────────────────────────────────────────────────────
  seo: {
    seoTitle:       'AI Token King — Your AI Knowledge Hub',
    seoDescription: 'The definitive guide to AI tokens, model APIs, and cost calculation. Compare 60+ models, estimate token costs, and navigate the AI ecosystem — free, always.',
    noindex: false,
  },
};

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(doc) + '\n');
console.log(`✓ Wrote ${OUTPUT_PATH}`);
console.log(`  hero stats: ${doc.heroStats.length} | FAQ items: ${doc.faq.length} | tokenBody2: ✓`);
console.log(`\nImport: cd studio && npx sanity dataset import ../${OUTPUT_PATH} production --replace`);
