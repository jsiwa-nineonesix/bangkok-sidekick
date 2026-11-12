# Bangkok Sidekick: AI chat proxy (optional, stage 2)

The chat in the app already works **without this**: it answers from the guide's own content (free, offline).
This proxy upgrades it to a real AI (Claude) that can answer anything, using the guide as its reference.

**Why a proxy?** The site is public static files. An API key placed in the page can be copied by anyone and run up your bill.
The proxy is a tiny server-side function that keeps the key secret.

> Status: type-checked against the Anthropic TypeScript SDK and the app's side of the switch was tested against a fake endpoint.
> The proxy itself has **not been run against the real API or deployed**. Test it after deploying.

## Set it up (about 15 minutes)

1. **API key.** Create one at https://console.anthropic.com . Put it in its own workspace and set a **monthly spend limit** there. This is your real safety net.
2. **Cloudflare account** (free plan is enough): https://dash.cloudflare.com/sign-up
3. Deploy:
   ```bash
   cd app/chat-proxy
   npm install
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY     # paste the key when asked
   npx wrangler deploy                           # prints your URL, e.g. https://bangkok-sidekick-chat.<you>.workers.dev
   ```
4. In `app/data.js` set `chat: { endpoint: "https://bangkok-sidekick-chat.<you>.workers.dev", dailyLimit: 30 }`, commit and push.
5. Open the app: the chat header should say **AI assistant · uses the guide**. Ask something outside the guide to confirm.

If the proxy is down, over its limit, or the visitor is offline, the app silently falls back to guide answers.

## Cost (approximate, check current pricing)

Each question sends the guide (about 3-4k tokens) plus a short answer (up to 700 tokens).

| Model | Rough cost per question | 500 questions |
|---|---|---|
| `claude-opus-5-5` (default, $4 in / $20 out per MTok) | about $0.02 | about $10 |
| `claude-haiku-5-5` ($0.10 in / $0.50 out per MTok) | well under $0.01 | about $0.30 |

Switch models by uncommenting `MODEL` in `wrangler.toml`. A smaller model is plenty for travel Q&A, but the default favours quality; it's your call.

## Protection (be realistic)

- **Origin check**: only your site's origin is accepted from browsers. It does **not** stop someone using `curl`.
- **Per-IP rate limit** in the Worker is best-effort (each Worker instance counts separately). Add a real rule in Cloudflare: *Security → WAF → Rate limiting rules* for this Worker URL.
- **Client limit**: each browser stops asking AI after `dailyLimit` questions a day (easy to bypass, only a courtesy).
- **Spend limit on the Anthropic key** is the real cap. Set it.
- Requests are size-limited (8 messages, 600 chars each, 16k guide chars) and `max_tokens` is 700.
- The guide text comes from the browser, so treat it as untrusted: the system prompt says so.
- Nothing is stored. The Worker only forwards the question; check Cloudflare/Anthropic data policies for your company's rules before sharing company information in chats.

## Files

- `src/index.ts`: the Worker. `wrangler.toml`: config. `tsconfig.json`: for `npm run typecheck`.
