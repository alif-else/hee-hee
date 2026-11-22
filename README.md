# Cat Clapping

A Next.js app that displays the supplied cat-clapping image on the home page.

## Getting started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

## Cloudflare Pages

The app is statically exported to the `out` directory. In Cloudflare Pages,
connect the GitHub repository and configure:

```bash
Build command:   npm run build
Build directory: out
```

When using a Workers Build deployment, configure:

```bash
Build command:  npm run build
Deploy command: npx wrangler deploy
```

`wrangler.jsonc` serves `out/` as static assets without OpenNext migration.

The same `out` directory is used by the Docker image.
