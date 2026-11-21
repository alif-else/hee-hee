# Cat Clapping

A Next.js app that displays the supplied cat-clapping image on the home page.

## Getting started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

## Cloudflare Workers

The project uses OpenNext and Wrangler to build and deploy to Cloudflare Workers.
For local Worker preview, copy `.dev.vars.example` to `.dev.vars`, then run:

```bash
npm run preview
```

To deploy, authenticate with `npx wrangler login`, then run:

```bash
npm run deploy
```

The Cloudflare account needs to be selected or configured in Wrangler. The
`wrangler.jsonc` file defines the Worker and its static assets; no R2 cache is
configured because the app does not use incremental revalidation.
