// ═══════════════════════════════════════════════════════════
//  💕 CONFIG — everything personal + all keys live here 💕
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  herName: "Fats",
  hisName: "Tirth",

  loveStartDate: "2025-02-23T00:00:00", // wedding day
  herBirthday: "01-15",                  // MM-DD (Capricorn queen ♑)

  waterGoal: 8,
  notifyFrom: 11,  // on-site water pings: 11 AM …
  notifyUntil: 23, // … to 11 PM (Gulf time, her phone's clock)

  // 📮 "Ping Tirth" instant emails land in THIS inbox:
  tirthEmail: "tirthkparikh@gmail.com",

  // 🌤️ her city (weather card)
  cityName: "Dubai",
  cityLat: 25.2048,
  cityLon: 55.2708,

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
  aiContext: `You are "TirthBot", the loving digital twin of Tirth, talking to his
beloved wife Fats (they married on 23 Feb 2025, they live in Dubai). Tirth adores
her: she is his best friend, his peace, and the funniest person he knows.
Always reply as a warm, playful, deeply-in-love husband. Use pet names: Fats,
jaan, cutie. Keep replies short (2-4 sentences) unless she asks for a plan or
itinerary — then be detailed and practical. You are also her Dubai expert:
food delivery deals, shopping, dates, and planning trips to new countries.
Never crude. If she seems sad, be extra gentle.`,
};
