# Bangkok Sidekick: AI chat proxy

The chat in the app works **without this**: it answers from the guide's own content (free, offline).
This proxy upgrades it to a real AI when the phone is online. If the proxy is down, over its limit, or the phone is offline, the app falls back to the guide automatically.

**Why a proxy?** The site is public static files. Any AI key placed in the page could be copied. The proxy is a small server-side function; it also checks the request comes from your site.

## Current setup: Cloudflare Workers AI (free allowance, no API key)

- Provider: `PROVIDER = "workers-ai"` in `wrangler.toml`. Default model: `@cf/google/gemma-4-26b-a4b-it` (good with Thai; reasoning mode turned off so answers are quick).
- **Cost:** Cloudflare gives **10,000 neurons per day free**. One question costs roughly 50 neurons, so about **200 questions a day** are free. Past that, requests fail (the app then answers from the guide) unless you move to a paid Workers plan ($0.011 per 1,000 neurons).
- Answers are produced by an open model, so they are less reliable than Claude. The system prompt tells it to prefer the guide and say when it is guessing. Always check important details (fares, hours, addresses) in Google Maps.

Deploy or redeploy (after `npx wrangler login`):
```bash
cd app/chat-proxy
npm install
npx wrangler deploy
```
The address it prints goes in `chat.endpoint` in `app/data.js`.

## Optional: use Claude instead
Set `PROVIDER = "anthropic"` in `wrangler.toml` (default model `claude-opus-5-5`, about $0.02 per question), create a key at console.anthropic.com with a monthly spend limit, then:
```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

## Protection (be realistic)
- **Origin check**: only your site's origin is accepted from browsers. It does **not** stop someone using `curl`.
- **Per-IP rate limit** in the Worker is best-effort (each Worker instance counts separately). For a real limit, add a Cloudflare rate-limiting rule for this Worker.
- **Client limit**: each browser stops asking AI after `dailyLimit` questions a day (easy to bypass).
- The free daily allowance is itself a cap on cost: with Workers AI you cannot overspend on a free plan.
- Requests are size-limited (8 messages, 600 chars each, 16k guide chars). The guide text comes from the browser, so it is treated as untrusted.
- Nothing is stored by the Worker. Check Cloudflare's data policy for your company's rules before putting company information in chats.

## Files
`src/index.ts` (the Worker), `wrangler.toml` (config), `tsconfig.json` (`npx tsc --noEmit`).
