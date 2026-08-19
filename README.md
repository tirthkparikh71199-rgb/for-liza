# For Fats ❤️

A love-website + daily companion for my wife — hosted free on GitHub Pages.

**Live:** https://tirthkparikh71199-rgb.github.io/for-fats/
**Login:** husband's name + boop answer 🔒

## What's inside
- 🔒 Cute lock screen (wife-only)
- 💌 AI love letter + poem, new every day (Groq → `daily.json`, auto-published)
- 💕 **Love AI** chatbot — his AI twin + Dubai expert + trip planner (mini-RAG knowledge base)
- ✈️ Travel dream board + AI day-by-day itinerary planner
- 📸 Photo memories (saved on her phone via IndexedDB)
- 😊 Mood diary · ❤️ live note wall · 📝 shared list + her wishlist
- 🎬 Movie watchlist (TVMaze API) · 🍽️ dinner decider · 🔮 AI horoscope
- 🌤️ Dubai weather · 💱 world currency converter (daily rates)
- 💧 Water tracker + streaks
- 📮 One-tap "Ping Tirth" emails (kiss / miss you / call me / chocolate emergency)

## Automation (GitHub Actions)
| Workflow | Schedule | What it does |
|---|---|---|
| `water.yml` | every hour | 💧 water reminder email — **only 11 AM–11 PM Gulf time** |
| `daily.yml` | 06:00 UTC (10 AM Gulf) | generates AI letter → publishes to site → emails it to her |

## Secrets (repo → Settings → Secrets)
`GMAIL_USER` · `GMAIL_APP_PASSWORD` · `WIFE_EMAIL` · `GROQ_API_KEY`

## 🔄 Go-live: switch emails from test inbox to HER
```bash
printf 'lizabvora@gmail.com' | gh secret set WIFE_EMAIL -R tirthkparikh71199-rgb/for-fats
```

## Test emails manually
```bash
gh workflow run water.yml -R tirthkparikh71199-rgb/for-fats
gh workflow run daily.yml -R tirthkparikh71199-rgb/for-fats
```

## Optional: Firebase sync (cross-device notes/lists/photos)
Create a free project at console.firebase.google.com → Firestore + enable →
paste the web config into `config.js` → everything syncs live between both phones.
Without it, everything works perfectly on-device (localStorage/IndexedDB).

## Note
⚠️ First "Ping Tirth" requires a one-time activation — click "Activate Form" in the
email FormSubmit sent to the ping inbox.
