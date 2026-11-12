# Bangkok Sidekick 🇹🇭
_Bangkok Visit Support pack: your travel buddy in the Big Mango_

A quick-reference pack for colleagues visiting Bangkok for one week, staying at **Avani Ratchada Bangkok Hotel (opposite G Tower), Rama 9 – the "New CBD"**.

## 📱 The web app (main deliverable)

Open `app/index.html`, or host the `app/` folder on any static host (it has no build step). On a phone, use "Add to Home Screen" and it works offline. All content is in `app/data.js`. The Markdown files below are the same material in document form.

## 🌙 BKK Night Out

Explore > BKK Night Out lists top-rated dinner and drinks spots near the hotel (Google ratings as of 12 Nov 2026, budgets are estimates), one-tap searches for bars and cafés with live Google ratings, and the main night-out areas with train routes. Data lives in `nightout` in `app/data.js`.

## 💬 Chat assistant

A chat button ("Ask") answers questions from the guide itself (free, offline). `app/chat-proxy/` contains an proxy that upgrades it to a real AI when online (Cloudflare Workers AI, free allowance); see `app/chat-proxy/README.md`.

## What's inside

| File | What you'll find |
|------|------------------|
| [01-area-guide.md](01-area-guide.md) | Rama 9 / New CBD zone: what's around, things to see |
| [02-food-guide.md](02-food-guide.md) | Where to eat in Central Rama 9 and nearby, plus how to order food |
| [03-getting-around.md](03-getting-around.md) | MRT / BTS / Airport Link stations, key routes to downtown, payment |
| [04-apps.md](04-apps.md) | Grab, LINE MAN, MuvMI, Bolt – how and when to use each |
| [05-useful-tips.md](05-useful-tips.md) | Payments, weather, safety, etiquette, SIM, emergency numbers |
| [map/index.html](map/index.html) | Offline minimap – open in any browser (works on a phone too) |

## 30-second summary

- **Home base:** Rama 9 sits on the **MRT Blue Line** at **Phra Ram 9 station (BL20)**, a short walk from the hotel and G Tower.
- **To downtown:** MRT to **Sukhumvit (BL22)** for BTS Asok, or **Silom (BL26)** for BTS Sala Daeng and Lumphini Park. Roughly 10–25 min.
- **Card tip:** MRT gates accept **contactless Visa/Mastercard directly**. **BTS does not**: you need a Rabbit card, a QR ticket from the BTS app/machines, or coins/cash at a ticket machine.
- **Rides:** Use **Grab** (or Bolt) for taxis and bike/car, **LINE MAN** for food delivery, **MuvMI** for short electric tuk-tuk hops where it operates.
- **Always:** Bangkok is hot and humid, carry water, dress light, bring a layer for cold AC.

## How reliable is this guide?

Built with AI and checked against official and map sources on 12 Nov 2026: hotel details (official Avani site + Google listing), the locations of all 21 MRT/BTS stations (OpenStreetMap), walking distances (measured from map coordinates) and the App Store / Play Store links.

Things that change, so confirm them live before you rely on them: fares and travel times, opening days and hours (especially night markets), restaurant details and prices, and anything marked 🔎. AI can make mistakes. The same note is shown inside the app on the Home tab (`trust` in `app/data.js`).

## For the maintainer

- Edit the Markdown files directly; the map is a single self-contained HTML/SVG file with no dependencies.
- Last drafted: 2026-11-12.
