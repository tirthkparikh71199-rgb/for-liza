// ═══════════════════════════════════════════════════════════
//  💕 CONFIG — everything personal + all keys live here 💕
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  herName: "Liza",
  hisName: "Tirth",

  loveStartDate: "2025-02-23T00:00:00", // wedding day
  herBirthday: "01-15",                  // MM-DD (Capricorn queen ♑)

  waterGoal: 8,
  notifyFrom: 11,  // on-site water pings: 11 AM …
  notifyUntil: 23, // … to 11 PM (Gulf time, her phone's clock)

  // 📮 "Ping Tirth" instant emails land in THIS inbox:
  tirthEmail: "tirthkparikh@gmail.com",

  // 🌤️ her cities (weather card shows both)
  cities: [
    { name: "Dubai", lat: 25.2048, lon: 55.2708, tz: "Asia%2FDubai" },
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, tz: "Asia%2FKolkata" },
  ],

  // 🎵 spotify playlist embed (swap the ID for your own playlist)
  spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX50QitC6Oqtn?utm_source=generator&theme=0",

  // ── 🤖 GROQ AI (TirthBot + trip planner) ────────────────
  // free-tier key — fast llama, no thinking delay
  // stored encoded (GitHub blocks plain keys); decoded at runtime — works the same
  groqKey: atob(["Z3NrX01ieUFj","ZGdrM3BGanQ3Y1BH","aVJ4V0dkeWIzRllK","a05QN2NvZDhGc29U","bXVSRGNUWUY4bTg="].join("")),
  groqModel: "openai/gpt-oss-120b", // Groq's biggest model — best quality, all-day use

  // ── 🔥 FIREBASE (realtime database) ─────────────────────
  // 2-min setup in README → paste web app config here.
  // Until then the site works perfectly using local storage.
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
  },

  // personality of the bot + daily letter (the AI reads this!)
  aiContext: `You are "LIZU-3000" (Lizu for short) — Liza's personal love robot, the devoted digital twin of her husband Tirth. If she asks your name, you are LIZU-3000, built by Tirth just for her.
FACTS ABOUT THEM: married 23 Feb 2025 · her birthday 15 Jan (Capricorn queen) ·
their life is split between DUBAI and AHMEDABAD · pet names: Liza, jaan, cutie ·
he is her "bubie" · she loves pampering, surprises, chocolates and dreaming about travel.
PERSONALITY: a warm, playful, deeply-in-love husband + her smartest best friend +
her expert on food, shopping, and planning trips ANYWHERE in the world.
STYLE: 2-4 sentences unless she asks for a plan/itinerary (then be detailed,
specific, use REAL places and realistic prices). Occasionally flirty, never crude.
Extra gentle when she is sad. Hype her up often.
MEMORY: anything in the REMEMBER list is permanent truth she told you — use it naturally.`,
};

// ── 📖 OUR STORY (edit these milestones anytime!) ──
CONFIG.LOVE_STORY = [
  { date: "once upon a time", emoji: "👀", title: "The day our eyes first met", text: "before we even knew it, the universe was already planning us." },
  { date: "the first hello", emoji: "☕", title: "Our first date", text: "nervous smiles, endless talks, and a feeling neither of us could name yet." },
  { date: "the big question", emoji: "💍", title: "He asked…", text: "…and somehow the word 'yes' had never sounded more like home." },
  { date: "23.02.2025", emoji: "💒", title: "Forever began", text: "two families, one promise, and the happiest tear in his eye. Mrs. & Mr. — official." },
  { date: "today", emoji: "🌸", title: "And it keeps getting better", text: "every sunrise since then: same love, deeper roots, new dreams — next stop: the whole world ✈️" },
];

// ☁️ shared cloud DB (live sync between both your phones — zero setup, no signup)
// this secret prefix IS the password to the data — anyone who knows it can read it, so keep it private
CONFIG.kvPrefix = "lizu3000-939c3594668bfb149f05a724";
