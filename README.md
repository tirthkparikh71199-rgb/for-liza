# LIZU3000 ❤️

A love-website + daily companion for my wife Liza — hosted free on GitHub Pages.

**Live:** https://tirthkparikh71199-rgb.github.io/for-liza/
**Login:** name `bubie` · secret word `paap` 🔒
**Her inbox:** `vorabliza@gmail.com` (emails currently point at Tirth for testing)

## What's inside
- 🔒 Cute lock screen (wife-only)
- 💌 AI love letter + poem, new every day (Groq → `daily.json`, auto-published)
- 🤖 **LIZU-3000** — her personal love robot: his AI twin + Dubai/Ahmedabad expert + trip planner, with permanent memory ("remember that…")
- 🌸 **Cycle tracker** — period, ovulation day, fertile + PMS windows, 35-day forecast strip, symptom log, and it *learns* her real average cycle length from her own logs
- 📖 Our-story timeline · 🌌 wedding-night sky (heart constellation seeded by 23.02.2025)
- ✈️ Travel dream board + AI day-by-day itinerary planner
- 📸 Photo memories (on her phone, IndexedDB)
- 😊 Mood diary · ❤️ live note wall · 📝 shared list + her wishlist
- 🎬 Movie watchlist (TVMaze) · 🍽️ dinner decider · 🔮 AI horoscope
- 🌤️ Dubai + Ahmedabad weather · 💱 currency converter
- 💧 Water tracker + streaks · 🎮 arcade
- 📮 One-tap "Ping Tirth" emails (kiss / miss you / call me / chocolate emergency)

## ☁️ Live sync between both phones (no setup)
Notes, lists, moods, water, watchlist, travel board and the cycle tracker all live in a shared
cloud KV bucket (`CONFIG.kvdbBucket` in [config.js](config.js)) and refresh every 12s — so what she
saves on her phone shows up on his. `localStorage` is only the offline fallback.
Photos stay on-device (IndexedDB) because they're too big for the bucket.

## Automation (GitHub Actions)
| Workflow | Schedule | What it does |
|---|---|---|
| `water.yml` | every 20 min | 💧 water reminder email — **de-duped to exactly 1/hour, 11 AM–11 PM Gulf** (GitHub cron runs late, so it fires often and the script decides) |
| `daily.yml` | `30 4 * * *` UTC = **8:30 AM Gulf** | generates the AI letter → publishes it to the site → emails it to her |
| `welcome.yml` | manual only | 💌 the one-time welcome letter |

## Secrets (repo → Settings → Secrets)
`GMAIL_USER` · `GMAIL_APP_PASSWORD` · `WIFE_EMAIL` · `GROQ_API_KEY`

## 🔄 Go-live: point the emails at HER inbox
```bash
# TEST MODE (current): everything lands in Tirth's inbox
printf 'tirthkparikh@gmail.com' | gh secret set WIFE_EMAIL -R tirthkparikh71199-rgb/for-liza

# GO LIVE (her real inbox — only when you're ready):
printf 'vorabliza@gmail.com' | gh secret set WIFE_EMAIL -R tirthkparikh71199-rgb/for-liza
```

## Send things manually
```bash
gh workflow run welcome.yml -R tirthkparikh71199-rgb/for-liza   # 💌 the welcome letter (once!)
gh workflow run daily.yml   -R tirthkparikh71199-rgb/for-liza   # 💌 today's love letter
gh workflow run water.yml   -R tirthkparikh71199-rgb/for-liza   # 💧 water nudge
```

## Optional: Firebase (instead of the KV bucket)
Create a free project at console.firebase.google.com → enable Firestore →
paste the web config into `config.js`. If it's filled in, it takes priority over the KV bucket.

## Note
⚠️ First "Ping Tirth" requires a one-time activation — click "Activate Form" in the
email FormSubmit sends to the ping inbox.
