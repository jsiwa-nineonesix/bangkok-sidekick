# Check In service (private)

A small Cloudflare Worker + D1 database behind the **Check In** tab. It tracks access-card hand-overs for visiting colleagues.
**No names, groups or statuses are stored in this repo or the public site.** The browser only receives them after a PIN login.

## Steps and who can update them
| # | Step | Updated by |
|---|------|------------|
| 1 | Access card created | done for everyone (automatic) |
| 2 | Given to buddy | the buddy (SM) for their group, or the RTE |
| 3 | Buddy returned card to SPOC | SM / SPOC, or the RTE |
| 4 | SPOC returned card to RTE | SM / SPOC, or the RTE |
| 5 | RTE confirmed receipt | RTE only |

A step can only be ticked when the one before it is done, and undone only when the next is not. Every change is logged with who and when.

Roles: `rte` (steps 2-5, all groups), `sm` (steps 2-4, own group), an `sm` with `spoc = 1` (steps 2-4, all groups), `viewer` (read-only).

## How it is protected
- Personal PINs (6 characters), stored only as salted SHA-256 hashes. Sign-in gives a signed 12-hour token.
- 8 wrong PINs from one address lock sign-in for 10 minutes.
- Only the site's origin is accepted; every data call needs a valid token; permissions are checked on the server.

## Setup (already done for this project)
```bash
cd app/checkin-api && npm install
npx wrangler d1 create bangkok-sidekick-checkin            # then put the id in wrangler.toml
# create schema (run each statement of schema.sql), then:
openssl rand -hex 32 | npx wrangler secret put TOKEN_SECRET
openssl rand -hex 32 | npx wrangler secret put PIN_PEPPER   # keep a private copy: PINs are derived from it
npx wrangler deploy
```
The roster loader and the PIN list are kept **outside this repo** (`~/.bkk-checkin/`).

## Handy commands
```bash
# make someone the SPOC (can update steps 2-4 for every group)
npx wrangler d1 execute bangkok-sidekick-checkin --remote --command "UPDATE people SET spoc = 1 WHERE id = '<person-id>'"
# list who is who
npx wrangler d1 execute bangkok-sidekick-checkin --remote --command "SELECT id, label, role, spoc FROM people"
```
