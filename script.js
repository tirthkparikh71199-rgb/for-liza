/* ═══════════ FOR LIZA ❤️ — the whole brain ═══════════ */
const $ = (id) => document.getElementById(id);
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dayOfYear = () => {
  const n = new Date();
  return Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 864e5);
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ─────────── 🔒 LOCK SCREEN ─────────── */
(function lock() {
  const open = () => {
    $("lockScreen").classList.add("open");
    confetti(innerWidth / 2, innerHeight / 2, 26);
  };
  if (localStorage.getItem("liza_unlocked") === "1" || location.search.includes("preview")) { open(); }
  const tryUnlock = () => {
    const n = $("lockName").value.trim().toLowerCase();
    const p = $("lockPass").value.trim().toLowerCase();
    if (n === "bubie" && p === "paap") {
      localStorage.setItem("liza_unlocked", "1");
      $("lockMsg").textContent = "welcome home, wifey 💕";
      open();
    } else {
      $("lockCard").classList.remove("shake");
      void $("lockCard").offsetWidth;
      $("lockCard").classList.add("shake");
      $("lockMsg").textContent = "nope! only my wife knows this 😌 try again";
    }
  };
  $("lockBtn").addEventListener("click", tryUnlock);
  $("lockPass").addEventListener("keydown", (e) => e.key === "Enter" && tryUnlock());
  $("lockName").addEventListener("keydown", (e) => e.key === "Enter" && $("lockPass").focus());
})();

/* ─────────── 🔥 STORAGE LAYER (Firestore if configured, else local) ─────────── */
let db = null;
const FS_OK = !CONFIG.firebase.apiKey.startsWith("YOUR");
if (FS_OK && window.firebase) {
  try { firebase.initializeApp(CONFIG.firebase); db = firebase.firestore(); } catch (e) { db = null; }
}
const localArr = (k) => JSON.parse(localStorage.getItem("fs_" + k) || "[]");
const saveLocalArr = (k, v) => localStorage.setItem("fs_" + k, JSON.stringify(v));

async function store(coll, id, data) {
  if (db) { try { await db.collection(coll).doc(id).set(data, { merge: true }); return; } catch (e) {} }
  localStorage.setItem(`fs_${coll}:${id}`, JSON.stringify(data));
}
async function fetchDoc(coll, id) {
  if (db) { try { const s = await db.collection(coll).doc(id).get(); return s.exists ? s.data() : null; } catch (e) {} }
  const v = localStorage.getItem(`fs_${coll}:${id}`);
  return v ? JSON.parse(v) : null;
}
async function pushItem(coll, data) {
  data.ts = Date.now();
  if (db) { try { await db.collection(coll).add(data); return; } catch (e) {} }
  const a = localArr(coll); a.unshift(data); saveLocalArr(coll, a.slice(0, 200));
  renderAllLists();
}
async function updateItem(coll, ts, patch) {
  if (db) { try { const q = await db.collection(coll).where("ts", "==", ts).get(); q.forEach((d) => d.ref.update(patch)); return; } catch (e) {} }
  const a = localArr(coll); const i = a.findIndex((x) => x.ts === ts);
  if (i > -1) { Object.assign(a[i], patch); saveLocalArr(coll, a); }
}
async function deleteItem(coll, ts) {
  if (db) { try { const q = await db.collection(coll).where("ts", "==", ts).get(); q.forEach((d) => d.ref.delete()); return; } catch (e) {} }
  saveLocalArr(coll, localArr(coll).filter((x) => x.ts !== ts)); renderAllLists();
}
const watchers = {};
function watch(coll, cb) {
  watchers[coll] = cb;
  if (db) {
    try { db.collection(coll).orderBy("ts", "desc").limit(60).onSnapshot((s) => cb(s.docs.map((d) => d.data())), () => cb(localArr(coll))); } catch (e) { cb(localArr(coll)); }
  } else cb(localArr(coll));
}
function renderAllLists() { Object.keys(watchers).forEach((k) => watchers[k](localArr(k))); }

/* ─────────── ✨ FX: confetti, rain, cursor trail, floaters ─────────── */
function confetti(x, y, n = 14) {
  const em = ["💖", "💕", "💗", "❤️", "✨", "🌸"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "confetti-heart";
    s.textContent = em[Math.floor(Math.random() * em.length)];
    s.style.left = x + "px"; s.style.top = y + "px";
    s.style.setProperty("--dx", (Math.random() * 260 - 130) + "px");
    s.style.setProperty("--dy", (Math.random() * -220 - 40) + "px");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}
function emojiRain(emojis, n = 26) {
  const ov = $("overlay");
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "rain-emoji";
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = 2.4 + Math.random() * 2.4 + "s";
    s.style.fontSize = 1.4 + Math.random() * 1.8 + "rem";
    ov.appendChild(s);
    setTimeout(() => s.remove(), 5200);
  }
}
if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
  let last = 0;
  addEventListener("pointermove", (e) => {
    const t = Date.now(); if (t - last < 110) return; last = t;
    const s = document.createElement("span");
    s.className = "trail-heart"; s.textContent = "💗";
    s.style.left = e.clientX - 7 + "px"; s.style.top = e.clientY - 7 + "px";
    document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  });
}
/* ─────────── ⏱️ COUNTERS & COUNTDOWNS ─────────── */
const loveStart = new Date(CONFIG.loveStartDate);
setInterval(() => {
  const d = Date.now() - loveStart.getTime();
  $("cDays").textContent = Math.floor(d / 864e5);
  $("cHours").textContent = Math.floor(d / 36e5) % 24;
  $("cMins").textContent = Math.floor(d / 6e4) % 60;
  $("cSecs").textContent = Math.floor(d / 1e3) % 60;
}, 1000);
function daysUntil(mmdd) {
  const [m, d] = mmdd.split("-").map(Number);
  const n = new Date(); n.setHours(0, 0, 0, 0);
  let t = new Date(n.getFullYear(), m - 1, d);
  if (t <= n) t = new Date(n.getFullYear() + 1, m - 1, d);
  return Math.round((t - n) / 864e5);
}
function refreshCountdowns() {
  $("cdBday").textContent = daysUntil(CONFIG.herBirthday) + " days";
  const anni = `${String(loveStart.getMonth() + 1).padStart(2, "0")}-${String(loveStart.getDate()).padStart(2, "0")}`;
  $("cdAnni").textContent = daysUntil(anni) + " days";
}
refreshCountdowns(); setInterval(refreshCountdowns, 36e5);

/* ─────────── 🤖 LOVE AI (Groq + mini RAG) ─────────── */
const KB = [
  "DUBAI DATES: sunset at Kite Beach (free), Dubai Fountain show every 30 min evenings (free), 1-2 AED abra ride across Dubai Creek, Miracle Garden (Nov-May), Global Village (seasonal ~25 AED), Al Seef walk, JBR beach, Marina dhow cruise dinner (~100-150 AED pp), desert safari with BBQ (~100-200 AED pp), Museum of the Future, Dubai Frame, Love Lake Al Qudra (heart-shaped, free), Al Fahidi lanes, Souk Madinat Jumeirah.",
  "DUBAI DAY TRIPS & STAYCATIONS: Hatta (kayak + mountains), Abu Dhabi (Grand Mosque, Louvre, Yas Island), Fujairah beaches, RAK Jebel Jais zipline, Sharjah art areas, staycation deals on Cobone/Groupon — UAE residents get big hotel discounts in summer.",
  "CHEAP EATS DUBAI: Ravi Restaurant Satwa, Al Ustad Special Kabab, Bu Qtair fish, Karama cafeterias, Meena Bazaar street food, 1 AED karak chai, luqaimat at Global Village, Al Mallah shawarma.",
  "FOOD DELIVERY UAE: Talabat (biggest, Pro = free delivery), Careem (Plus discounts), Deliveroo, Noon Food (often cheapest), Instashop (groceries). PRO TIP: check the SAME restaurant on Talabat vs Careem vs Noon Food before ordering — coupons differ a lot. Grocery: Viva cheapest, Carrefour app deals, Lulu online.",
  "SHOPPING UAE: Noon vs Amazon.ae (compare both), Shein/Namshi sales, Dragon Mart bargains, Deira Gold Souk (bargain hard), perfumes at Dubai malls, Dubai Shopping Festival (Dec-Jan) huge sales, Outlet Village. FLOWERS/GIFTS delivery Dubai: Floward, Ferns N Petals, Joi Gifts — same-day.",
  "AHMEDABAD FOOD: Manek Chowk night street food (legendary), Law Garden food stalls, Gujarati thali at Gordhan Thal or Agashiye, sev khamani, dabeli, fafda-jalebi breakfast, khaman dhokla, Lucky Tea stall, Alpha One/Ahmedabad One mall food courts.",
  "AHMEDABAD PLACES: Sabarmati Riverfront evening walk, Kankaria Lake (zoo + toy train + night lights), Adalaj Stepwell, heritage pols walk in old city, Sidi Saiyyed mosque (tree lattice), Science City, Sarkhej Roza. DAY TRIPS: Statue of Unity (world's tallest statue), Polo Forest, Modhera Sun Temple, Gir lions (safari), Udaipur weekend.",
  "TRAVEL ANYWHERE — BOOKING CHEAP: Skyscanner 'everywhere' search + Google Flights price tracking, fly Tue/Wed, book 6-8 weeks ahead, compare airline site vs aggregator, use incognito. Hotels: Booking.com free cancellation, compare with Agoda. Always check visa BEFORE booking.",
  "VISA GUIDE (Indian passport / UAE residents): visa-free or easy e-visa: Thailand, Indonesia (Bali), Malaysia, Maldives, Mauritius, Seychelles, Sri Lanka, Nepal, Bhutan, Georgia, Azerbaijan, Armenia, Uzbekistan, Kyrgyzstan, Kazakhstan. Schengen (Europe): apply via VFS/BLS 4-6 weeks ahead with hotel+flight+insurance+bank statements. Japan/Korea: e-visa for UAE residents. Keep passport valid 6+ months.",
  "BEST SEASONS: Europe May-Sep, Georgia May-Oct, Maldives Nov-Apr, Bali Apr-Oct, Thailand Nov-Feb, Japan cherry blossom late Mar-Apr + autumn Nov, Switzerland Jun-Sep (winter for snow), Vietnam Feb-Apr, Turkey Apr-Jun, Kashmir Mar-Oct.",
  "HONEYMOON-STYLE TRIPS BY VIBE: beaches=Maldives/Mauritius/Bali · snow=Georgia/Switzerland/Kashmir · city+food=Japan/Singapore/Istanbul · budget=Vietnam/Sri Lanka/Uzbekistan · luxury=Santorini/Paris · adventure=New Zealand.",
  "TRAVEL SMART: travel insurance always, Airalo eSIM for data, carry some USD, keep Day 1 light (arrive + sunset + dinner), mix activity days with rest days, one surprise romantic dinner per trip, screenshot all bookings offline, check baggage rules on budget airlines.",
  "ROMANTIC IDEAS ANYWHERE: breakfast in bed, handwritten note hidden in her bag, flowers just because, recreate the first date, print + frame a photo, cook her favorite meal, stargazing drive, slow dance in the living room, sunset picnics, surprise weekend staycation.",
  "GIFT IDEAS: under 200 AED — flowers + her favorite chocolate + handwritten card, photo book of memories, customized jewelry with her name, perfume from her wishlist, pajama + movie night kit. Bigger: gold (Deira souk, bargain), watch, designer bag on sale, trip surprise. Best gift = something from her wishlist on this site 👀🎁.",
];
function retrieve(q) {
  const words = q.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2);
  return KB.map((c) => ({ c, s: words.reduce((n, w) => n + (c.toLowerCase().includes(w) ? 1 : 0), 0) }))
    .sort((a, b) => b.s - a.s).slice(0, 3).map((x) => x.c).join("\n");
}
const getFacts = () => JSON.parse(localStorage.getItem("loveai_facts") || "[]");
async function askAI(userMsg, opts = {}) {
  const facts = getFacts();
  const sys = CONFIG.aiContext
    + (facts.length ? "\n\nREMEMBER (permanent things she told you):\n- " + facts.join("\n- ") : "")
    + "\n\nHELPFUL FACTS (use naturally, never mention this list):\n" + retrieve(userMsg);
  const body = {
    model: CONFIG.groqModel,
    reasoning_effort: "low",
    temperature: 0.85,
    max_completion_tokens: opts.long ? 1400 : 400,
    messages: [{ role: "system", content: sys }, ...(opts.history || []), { role: "user", content: userMsg }],
  };
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + CONFIG.groqKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("ai error");
  return (await r.json()).choices[0].message.content.trim();
}

/* ─────────── 💌 DAILY LETTER ─────────── */
const FALLBACK_LETTERS = [
  { letter: "My dearest Liza, another day has begun and my first thought was you — as always. You make ordinary days feel like festivals and quiet evenings feel like home. I hope today is as soft and beautiful as your heart.", poem: "Morning light on your sleepy face,\nmy favorite view, my favorite place.\nAnother day, another chance to say —\nI love you more than yesterday." },
  { letter: "Jaan, if I could bottle the way you laugh, I'd be the richest man in Dubai. Thank you for choosing me every single day. I don't say it enough, but you are my greatest blessing.", poem: "Your laugh, my favorite song,\nwith you is where I belong.\nThrough every high and every low,\nit's you and me — that's all I know." },
  { letter: "Liza, somewhere between our first hello and this very moment, you became my whole world. Drink your water, eat well, and remember — someone is counting hours to see you.", poem: "The sun rose twice since I saw you last,\ntime without you moves so fast… said no one — it crawls!\nCome home soon, my heart, my muse,\nit's your smile I always choose." },
];
/* ─────────── 💌 DAILY LETTER (sealed envelope → typewriter) ─────────── */
let TODAY_LETTER = null;
function typewrite(el, text, done) {
  el.textContent = "";
  let i = 0;
  const cursor = document.createElement("span");
  cursor.className = "type-cursor";
  cursor.innerHTML = "&nbsp;";
  const skip = () => { i = text.length; };
  el.addEventListener("click", skip, { once: true });
  const t = setInterval(() => {
    i += 2;
    el.textContent = text.slice(0, i);
    el.appendChild(cursor);
    if (i >= text.length) { clearInterval(t); el.textContent = text; cursor.remove(); done && done(); }
  }, 16);
}
$("envelope").addEventListener("click", () => {
  const env = $("envelope");
  if (env.classList.contains("open")) return;
  if (!TODAY_LETTER) { env.querySelector(".env-hint").textContent = "sealing it with love… 💕"; return; }
  env.classList.add("open");
  const r = env.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + 60, 20);
  setTimeout(() => env.classList.add("gone"), 700);
  setTimeout(() => {
    env.style.display = "none";
    $("letterContent").classList.remove("hidden");
    typewrite($("letterBody"), TODAY_LETTER.body, () => { $("letterPoem").textContent = TODAY_LETTER.poem || ""; });
  }, 1150);
});
(async function letter() {
  const today = todayKey();
  $("letterDate").textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  try {
    const r = await fetch("daily.json?d=" + Date.now());
    if (r.ok) {
      const d = await r.json();
      if (d.date === today && d.letter) { TODAY_LETTER = { body: d.letter, poem: d.poem || "" }; return; }
    }
  } catch (e) {}
  const f = FALLBACK_LETTERS[dayOfYear() % FALLBACK_LETTERS.length];
  TODAY_LETTER = { body: f.letter, poem: f.poem };
})();

/* ─────────── 🔮 HOROSCOPE (AI, cached daily) ─────────── */
(async function horo() {
  const key = "horo_" + todayKey();
  const cached = localStorage.getItem(key);
  if (cached) { $("horoText").textContent = cached; return; }
  try {
    const t = await askAI(`Give my wife Liza (Capricorn, born 15 Jan) a sweet 2-3 sentence love-focused horoscope for today, ${new Date().toDateString()}. Warm, playful, hopeful — from the stars, with love.`);
    localStorage.setItem(key, t);
    $("horoText").textContent = t;
  } catch (e) {
    $("horoText").textContent = "The stars say a very handsome man is thinking about you right now, and he will for the rest of forever. Lucky you, Capricorn ♑💕";
  }
})();

/* ─────────── 🌤️ WEATHER + 💱 WORLD FX ─────────── */
(async function weather() {
  const codes = { 0: ["☀️", "clear"], 1: ["🌤️", "mostly sunny"], 2: ["⛅", "partly cloudy"], 3: ["☁️", "cloudy"], 45: ["🌫️", "foggy"], 48: ["🌫️", "foggy"], 51: ["🌦️", "drizzle"], 61: ["🌧️", "rain"], 80: ["🌦️", "showers"], 95: ["⛈️", "storm"] };
  try {
    const rows = await Promise.all(CONFIG.cities.map(async (c) => {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=${c.tz}`);
      const d = await r.json();
      const w = d.current_weather;
      const [em, desc] = codes[w.weathercode] || ["🌈", "beautiful"];
      return `<div class="weather-row"><span class="w-emoji">${em}</span><div><b class="w-city">${c.name}</b><span class="w-temp">${Math.round(w.temperature)}°C</span><p class="w-desc">${desc} · ↑${Math.round(d.daily.temperature_2m_max[0])}° ↓${Math.round(d.daily.temperature_2m_min[0])}° · 💨${Math.round(w.windspeed)}</p></div></div>`;
    }));
    $("weatherNow").innerHTML = rows.join("");
    $("weatherTip").textContent = "wherever you are today, jaan — dress cute, drink water, miss him a little 🥰";
  } catch (e) { $("weatherNow").textContent = "the sky is shy today — but you're still the view 🌸"; }
})();
(async function fx() {
  try {
    let data;
    const cached = JSON.parse(localStorage.getItem("fx_rates") || "null");
    if (cached && Date.now() - cached.at < 12 * 36e5) data = cached.d;
    else {
      const r = await fetch("https://open.er-api.com/v6/latest/AED");
      data = await r.json();
      localStorage.setItem("fx_rates", JSON.stringify({ at: Date.now(), d: data }));
    }
    const codes = Object.keys(data.rates);
    const fav = ["AED", "INR", "USD", "EUR", "GBP", "PKR", "PHP", "SAR", "QAR", "OMR", "KWD", "BHD"];
    const opts = [...fav, ...codes.filter((c) => !fav.includes(c))].map((c) => `<option>${c}</option>`).join("");
    $("fxFrom").innerHTML = opts; $("fxTo").innerHTML = opts;
    $("fxFrom").value = "AED"; $("fxTo").value = "INR";
    const convert = () => {
      const amt = parseFloat($("fxAmt").value) || 0;
      const aed = amt / data.rates[$("fxFrom").value];
      const out = aed * data.rates[$("fxTo").value];
      $("fxResult").textContent = `${amt} ${$("fxFrom").value} = ${out.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${$("fxTo").value}`;
      $("fxRate").textContent = `1 ${$("fxFrom").value} = ${(data.rates[$("fxTo").value] / data.rates[$("fxFrom").value]).toFixed(3)} ${$("fxTo").value} · updated ${data.time_last_update_utc.slice(0, 16)}`;
    };
    ["fxAmt", "fxFrom", "fxTo"].forEach((id) => $(id).addEventListener("input", convert));
    $("fxSwap").addEventListener("click", () => { const a = $("fxFrom").value; $("fxFrom").value = $("fxTo").value; $("fxTo").value = a; convert(); });
    convert();
  } catch (e) { $("fxResult").textContent = "rates are shy right now — try again later 💸"; }
})();

/* ─────────── 😊 MOOD DIARY ─────────── */
const MOODS = ["😍", "🥰", "😊", "😐", "😴", "😢", "😤", "🤒"];
let selMood = null;
$("moodRow").innerHTML = MOODS.map((m) => `<button class="mood-btn" data-m="${m}">${m}</button>`).join("");
$("moodRow").addEventListener("click", (e) => {
  const b = e.target.closest(".mood-btn"); if (!b) return;
  document.querySelectorAll(".mood-btn").forEach((x) => x.classList.remove("sel"));
  b.classList.add("sel"); selMood = b.dataset.m;
});
$("moodSave").addEventListener("click", async (e) => {
  if (!selMood) { $("moodNote").focus(); return; }
  await store("moods", todayKey(), { mood: selMood, note: $("moodNote").value.trim(), ts: Date.now() });
  $("moodNote").value = "";
  confetti(e.clientX, e.clientY);
  loadMoods();
});
async function loadMoods() {
  let html = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const m = await fetchDoc("moods", k);
    html += `<div class="mood-dot">${m ? m.mood : "·"}<small>${d.toLocaleDateString("en-GB", { weekday: "short" })}</small></div>`;
    if (i === 0 && m) { document.querySelectorAll(".mood-btn").forEach((x) => x.classList.toggle("sel", x.dataset.m === m.mood)); selMood = m.mood; if (m.note) $("moodNote").placeholder = m.note; }
  }
  $("moodHistory").innerHTML = html;
}
loadMoods();

/* ─────────── 🍽️ FOOD DECIDER ─────────── */
const FOODS = ["🍛 biryani night — order from the cheapest app!", "🍕 pizza + a rom-com", "🥘 butter chicken + garlic naan, homemade", "🍜 ramen date at home", "🌮 taco tuesday energy (any day counts)", "🍝 creamy pasta + candles", "🥗 healthy bowls… then dessert 🍰", "🍔 burger night, his treat", "🫕 hotpot night!", "🍣 sushi + sofa + cuddles", "🥞 breakfast for dinner 🥞", "🧀 cheese board + grape juice, fancy mode", "🍲 her choice — he cooks tonight 👨‍🍳", "🌯 shawarma from the favorite spot", "🍫 skip dinner, dessert only (rebel night)"];
$("foodBtn").addEventListener("click", () => {
  const el = $("foodPick"); el.classList.add("spinning");
  let i = 0;
  const spin = setInterval(() => { el.textContent = FOODS[Math.floor(Math.random() * FOODS.length)]; if (++i > 14) { clearInterval(spin); el.classList.remove("spinning"); el.textContent = FOODS[Math.floor(Math.random() * FOODS.length)]; confetti(innerWidth / 2, el.getBoundingClientRect().top, 10); } }, 80);
});
$("foodAI").addEventListener("click", () => {
  document.querySelector("#bot").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => { $("chatInput").value = "plan a full dinner date for us in Dubai tonight — cuisine, area, and one sweet after-dinner plan. budget ~200 AED"; sendChat(); }, 700);
});

/* ─────────── 💧 WATER ─────────── */
const WATER_MSGS = ["good start, my love 💧", "sip sip hooray! 🥤", "glowing already ✨", "he's proud of you 🥹", "hydration queen 👑", "skin says thank you 💕", "almost there, jaan!", "goal smashed! 🎉 drink anyway 😉"];
let glasses = 0;
async function loadWater() {
  const d = await fetchDoc("water", todayKey());
  glasses = d ? d.glasses || 0 : 0;
  renderDrops();
  let streak = 0;
  for (let i = 1; i <= 60; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const w = await fetchDoc("water", k);
    if (w && w.glasses >= CONFIG.waterGoal) streak++; else break;
  }
  $("waterStreak").textContent = streak;
}
function renderDrops() {
  $("drops").innerHTML = Array.from({ length: CONFIG.waterGoal }, (_, i) => `<span class="drop ${i < glasses ? "filled" : ""}">💧</span>`).join("");
  $("waterStatus").textContent = WATER_MSGS[Math.min(glasses, WATER_MSGS.length - 1)] + (glasses >= CONFIG.waterGoal ? "" : ` (${glasses}/${CONFIG.waterGoal})`);
}
$("drinkBtn").addEventListener("click", async (e) => {
  glasses++;
  await store("water", todayKey(), { glasses, ts: Date.now() });
  renderDrops();
  confetti(e.clientX, e.clientY, 8);
  if (glasses === CONFIG.waterGoal) emojiRain(["💧", "🎉", "💙"], 20);
});
$("notifBtn").addEventListener("click", async () => {
  if (!("Notification" in window)) { alert("this browser can't do notifications, my love"); return; }
  const p = await Notification.requestPermission();
  $("notifBtn").textContent = p === "granted" ? "🔔 reminders on!" : "🔕 blocked by browser";
});
setInterval(() => {
  const n = new Date();
  if (window.Notification && Notification.permission === "granted" && n.getMinutes() < 2 && n.getHours() >= CONFIG.notifyFrom && n.getHours() < CONFIG.notifyUntil) {
    new Notification("💧 water, jaan!", { body: "one glass for me? pretty please 🥺💕" });
  }
}, 6e4);
loadWater();

/* ─────────── 🎵 MUSIC ─────────── */
$("spotifyFrame").src = CONFIG.spotifyEmbed;

/* ─────────── 📸 PHOTO MEMORIES (IndexedDB) ─────────── */
const idb = {
  open: () => new Promise((res, rej) => {
    const r = indexedDB.open("forLiza", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }),
  async add(p) { const d = await this.open(); return new Promise((res) => { const tx = d.transaction("photos", "readwrite"); tx.objectStore("photos").add(p); tx.oncomplete = () => res(); tx.onerror = () => res(); }); },
  async all() { const d = await this.open(); return new Promise((res) => { const q = d.transaction("photos").objectStore("photos").getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); }); },
  async del(id) { const d = await this.open(); return new Promise((res) => { const tx = d.transaction("photos", "readwrite"); tx.objectStore("photos").delete(id); tx.oncomplete = () => res(); tx.onerror = () => res(); }); },
};
function compressPhoto(file) {
  return new Promise((res) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement("canvas");
      const s = Math.min(1, 1200 / Math.max(img.width, img.height));
      c.width = img.width * s; c.height = img.height * s;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => res(b), "image/jpeg", 0.82);
    };
    img.src = url;
  });
}
async function renderPhotos() {
  const items = (await idb.all()).sort((a, b) => b.ts - a.ts);
  $("photoGrid").innerHTML = items.map((p) => `
    <div class="photo-item" data-id="${p.id}">
      <img alt="${esc(p.caption || "memory")}" />
      ${p.caption ? `<small>${esc(p.caption)}</small>` : ""}
      <button class="photo-del" data-del="${p.id}">✖</button>
    </div>`).join("");
  items.forEach((p) => { $(`photoGrid`).querySelector(`[data-id="${p.id}"] img`).src = URL.createObjectURL(p.blob); });
}
$("photoInput").addEventListener("change", async (e) => {
  const f = e.target.files[0]; if (!f) return;
  const blob = await compressPhoto(f);
  await idb.add({ blob, caption: $("photoCaption").value.trim(), ts: Date.now() });
  $("photoCaption").value = ""; $("photoInput").value = "";
  confetti(innerWidth / 2, innerHeight / 2, 12);
  renderPhotos();
});
$("photoGrid").addEventListener("click", async (e) => {
  const del = e.target.closest("[data-del]");
  if (del) { e.stopPropagation(); await idb.del(Number(del.dataset.del)); renderPhotos(); return; }
  const item = e.target.closest(".photo-item");
  if (item) {
    $("viewerImg").src = item.querySelector("img").src;
    $("photoViewer").classList.remove("hidden");
  }
});
$("photoViewer").addEventListener("click", () => $("photoViewer").classList.add("hidden"));
renderPhotos();

/* ─────────── ❤️ NOTE WALL ─────────── */
$("noteAdd").addEventListener("click", async () => {
  const t = $("noteText").value.trim(); if (!t) return;
  await pushItem("notes", { from: $("noteFrom").value, text: t });
  $("noteText").value = "";
});
watch("notes", (items) => {
  $("notesWall").innerHTML = items.map((n) => `<div class="sticky from-${esc(n.from)}">${esc(n.text)}<small>— ${esc(n.from)} · ${new Date(n.ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small></div>`).join("") || `<p class="muted tiny">no notes yet — he'll fix that soon 😌</p>`;
});

/* ─────────── ✈️ TRAVEL DREAMS + AI PLANNER ─────────── */
$("destAdd").addEventListener("click", async () => {
  const n = $("destName").value.trim(); if (!n) return;
  await pushItem("destinations", { name: n, note: $("destNote").value.trim() });
  $("destName").value = ""; $("destNote").value = "";
});
watch("destinations", (items) => {
  $("destList").innerHTML = items.map((d) => `
    <div class="dest-chip">
      <b>${esc(d.name)}</b>${d.note ? `<small>${esc(d.note)}</small>` : ""}
      <button class="dest-plan" data-place="${esc(d.name)}">plan this ✨</button>
      <span class="dest-del" data-ts="${d.ts}">✖</span>
    </div>`).join("") || `<p class="muted tiny">add your first dream destination 🌍</p>`;
});
$("destList").addEventListener("click", async (e) => {
  const plan = e.target.closest(".dest-plan");
  if (plan) { $("tripPlace").value = plan.dataset.place; $("tripPlan").click(); return; }
  const del = e.target.closest(".dest-del");
  if (del) await deleteItem("destinations", Number(del.dataset.ts));
});
$("tripPlan").addEventListener("click", async () => {
  const place = $("tripPlace").value.trim();
  const days = Math.min(Math.max(parseInt($("tripDays").value) || 4, 1), 14);
  if (!place) { $("tripPlace").focus(); return; }
  const box = $("tripResult");
  box.classList.add("show");
  box.innerHTML = `<span class="typing-dots"><i></i><i></i><i></i></span> planning your ${days}-day escape to ${esc(place)}…`;
  try {
    const plan = await askAI(`Create a romantic day-by-day ${days}-day itinerary to ${place} for a couple flying from Dubai. Format exactly like:\nDay 1: …\nDay 2: …\nEach day 1-2 lines: one sight, one food spot, one romantic moment. End with "💸 Budget hint:" (flights + hotel from Dubai in AED) and one visa tip for UAE residents.`, { long: true });
    box.textContent = plan;
  } catch (e) {
    box.textContent = `my travel brain hiccuped, jaan 🥺 try again in a moment — or just tell Tirth "${place}" and watch him plan everything 💕`;
  }
});

/* ─────────── ❓ QUESTION OF THE DAY ─────────── */
const QUESTIONS = ["What's your favorite memory of us so far?", "One thing I do that always makes you smile?", "If we could teleport anywhere tonight, where?", "What food should we cook together this week?", "Your favorite thing about being married to me 😌?", "One dream you want us to chase together?", "What song feels like 'us'?", "Something small I did that you never forgot?", "Where should our next date be?", "What are you most grateful for today?", "One thing you want more of from us?", "Our funniest moment — describe it in one line 😂", "What should our couple tradition be?", "If we had a free Sunday, zero plans — what do we do?", "What did you think of me the first time we met?", "One place in Dubai we still haven't been together?", "What's your love language this week?", "Something you want to learn together?", "Best meal we've ever had together?", "What movie should be our next movie night?", "One thing about our home you love most?", "If you could relive one day of us, which one?", "What should we name our future pet 🐱?", "Your favorite photo of us — which one and why?", "One habit of mine you secretly find cute?", "What adventure should next year hold for us?", "What did you dream about last night?", "One thing you want to tell me but keep forgetting?", "What made you smile today, jaan?", "If we opened a small café, what would we call it?", "Describe our love in exactly three words 💕"];
$("qodText").textContent = "“" + QUESTIONS[dayOfYear() % QUESTIONS.length] + "”";
(async function qod() {
  const a = await fetchDoc("answers", todayKey());
  if (a) { if (a.liza) $("ansLiza").value = a.liza; if (a.tirth) $("ansTirth").value = a.tirth; renderAnswers(a); }
})();
$("ansSave").addEventListener("click", async (e) => {
  const a = { liza: $("ansLiza").value.trim(), tirth: $("ansTirth").value.trim(), ts: Date.now() };
  await store("answers", todayKey(), a);
  renderAnswers(a);
  confetti(e.clientX, e.clientY, 10);
});
function renderAnswers(a) {
  $("ansShow").innerHTML = (a.liza ? `<div class="ans-bubble"><b>🩷 Liza:</b> ${esc(a.liza)}</div>` : "") + (a.tirth ? `<div class="ans-bubble"><b>💙 Tirth:</b> ${esc(a.tirth)}</div>` : "");
}

/* ─────────── 📝 LISTS (shared + wishlist) ─────────── */
let currentList = "shared";
document.querySelectorAll("[data-list]").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("[data-list]").forEach((x) => x.classList.remove("active"));
  b.classList.add("active"); currentList = b.dataset.list;
  $("listHint").textContent = currentList === "wishlist" ? "things she wants — he checks this list very carefully 👀🎁" : "groceries, plans, “don't let me forget” — one list for both of you";
  loadTodos();
}));
$("todoAdd").addEventListener("click", async () => {
  const t = $("todoText").value.trim(); if (!t) return;
  await pushItem("todos_" + currentList, { text: t, done: false });
  $("todoText").value = "";
});
$("todoText").addEventListener("keydown", (e) => e.key === "Enter" && $("todoAdd").click());
function loadTodos() {
  watch("todos_" + currentList, (items) => {
    $("todoList").innerHTML = items.map((t) => `
      <li class="${t.done ? "done" : ""}">
        <span class="todo-check" data-ts="${t.ts}">${t.done ? "✅" : "⬜"}</span>
        <span>${esc(t.text)}</span>
        <span class="todo-del" data-ts="${t.ts}">🗑️</span>
      </li>`).join("") || `<p class="muted tiny" style="margin-top:10px">empty — add the first thing ✨</p>`;
  });
}
$("todoList").addEventListener("click", async (e) => {
  const chk = e.target.closest(".todo-check");
  if (chk) { const ts = Number(chk.dataset.ts); const li = chk.closest("li"); await updateItem("todos_" + currentList, ts, { done: !li.classList.contains("done") }); loadTodos(); return; }
  const del = e.target.closest(".todo-del");
  if (del) await deleteItem("todos_" + currentList, Number(del.dataset.ts));
});
loadTodos();

/* ─────────── 🎬 MOVIES (TVMaze, no key) ─────────── */
function movieCard(s, inList) {
  const img = (s.image && (s.image.medium || s.image.original)) || "";
  const rating = s.rating && s.rating.average ? "⭐ " + s.rating.average : "";
  return `<div class="movie-card">
    ${img ? `<img src="${img}" alt="${esc(s.name)}" loading="lazy" />` : ""}
    <div class="mv-body">
      <p class="mv-name">${esc(s.name)}</p>
      <p class="mv-meta">${rating} ${s.premiered ? "· " + s.premiered.slice(0, 4) : ""}</p>
      ${inList ? `<button class="mv-btn rm" data-rm="${s.ts}">remove</button>` : `<button class="mv-btn" data-add='${esc(JSON.stringify({ name: s.name, img, rating: rating.replace("⭐ ", "") }))}'>+ watchlist</button>`}
    </div></div>`;
}
async function loadMovies(q) {
  $("movieResults").innerHTML = `<p class="muted tiny">loading…</p>`;
  try {
    let shows;
    if (q) {
      const r = await fetch("https://api.tvmaze.com/search/shows?q=" + encodeURIComponent(q));
      shows = (await r.json()).map((x) => x.show).slice(0, 8);
    } else {
      const r = await fetch("https://api.tvmaze.com/shows?page=0");
      shows = (await r.json()).filter((s) => s.rating && s.rating.average).sort((a, b) => b.rating.average - a.rating.average).slice(0, 8);
    }
    $("movieResults").innerHTML = shows.map((s) => movieCard(s, false)).join("") || `<p class="muted tiny">nothing found 🥺</p>`;
  } catch (e) { $("movieResults").innerHTML = `<p class="muted tiny">movie api is sleepy — try again 🎬</p>`; }
}
$("movieSearchBtn").addEventListener("click", () => loadMovies($("movieSearch").value.trim()));
$("movieSearch").addEventListener("keydown", (e) => e.key === "Enter" && loadMovies($("movieSearch").value.trim()));
$("movieResults").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-add]"); if (!b) return;
  await pushItem("watchlist", JSON.parse(b.dataset.add));
  b.textContent = "added ❤️";
});
watch("watchlist", (items) => {
  $("watchlist").innerHTML = items.map((w) => movieCard({ name: w.name, image: { medium: w.img }, rating: { average: w.rating }, ts: w.ts }, true)).join("") || `<p class="muted tiny">your watchlist is empty — add something for friday night 🍿</p>`;
});
$("watchlist").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-rm]"); if (b) await deleteItem("watchlist", Number(b.dataset.rm));
});
loadMovies();

/* ─────────── 📮 PING TIRTH (instant email) ─────────── */
async function sendPing(msg) {
  $("pingStatus").textContent = "sending… 💌";
  try {
    await fetch("https://formsubmit.co/ajax/" + CONFIG.tirthEmail, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: "💌 Ping from Liza!", message: msg }),
    });
    $("pingStatus").textContent = "delivered to his inbox! 💕";
    pushItem("pings", { text: msg });
  } catch (e) { $("pingStatus").textContent = "hmm, it didn't go — try again, jaan 🥺"; }
}
document.querySelectorAll("[data-ping]").forEach((b) => b.addEventListener("click", (e) => { sendPing(b.dataset.ping); confetti(e.clientX, e.clientY, 8); }));
$("pingSend").addEventListener("click", () => { const t = $("pingText").value.trim(); if (!t) return; sendPing("💌 Liza says: " + t); $("pingText").value = ""; });

/* ─────────── 💕 LOVE AI CHAT (persistent memory) ─────────── */
let chatHist = JSON.parse(localStorage.getItem("loveai_hist") || "[]");
const saveHist = () => localStorage.setItem("loveai_hist", JSON.stringify(chatHist.slice(-24)));
function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = "chat-msg " + who;
  d.textContent = text;
  $("chatBox").appendChild(d);
  $("chatBox").scrollTop = $("chatBox").scrollHeight;
  return d;
}
function updateMemChip() {
  const el = $("memChip"); if (!el) return;
  const n = getFacts().length;
  el.textContent = `🧠 ${n} memor${n === 1 ? "y" : "ies"}`;
  el.title = getFacts().join(" · ");
}
async function sendChat() {
  const t = $("chatInput").value.trim(); if (!t) return;
  $("chatInput").value = "";
  addMsg(t, "me");
  const mem = t.match(/^remember(?:\s+that)?\s+(.+)/i);
  if (mem) {
    const facts = getFacts();
    facts.push(mem[1].replace(/[.!\s]+$/, ""));
    localStorage.setItem("loveai_facts", JSON.stringify(facts.slice(-40)));
    updateMemChip();
    const reply = `Locked in my heart forever 💕 I'll never forget: ${mem[1].replace(/[.!\s]+$/, "")}`;
    addMsg(reply, "bot");
    chatHist.push({ role: "user", content: t }, { role: "assistant", content: reply });
    saveHist();
    confetti(innerWidth / 2, innerHeight - 260, 8);
    return;
  }
  const typing = addMsg("", "bot");
  typing.innerHTML = `<span class="typing-dots"><i></i><i></i><i></i></span>`;
  try {
    const reply = await askAI(t, { history: chatHist.slice(-12) });
    typing.textContent = reply;
    chatHist.push({ role: "user", content: t }, { role: "assistant", content: reply });
    saveHist();
  } catch (e) {
    typing.textContent = ["ugh, my love-signal dropped for a second 🥺 try again jaan?", "even my AI gets butterflies talking to you — say that again? 💕"][Math.floor(Math.random() * 2)];
  }
  $("chatBox").scrollTop = $("chatBox").scrollHeight;
}
$("chatSend").addEventListener("click", sendChat);
$("chatInput").addEventListener("keydown", (e) => e.key === "Enter" && sendChat());
document.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => { $("chatInput").value = b.dataset.q; sendChat(); }));
chatHist.slice(-14).forEach((m) => addMsg(m.content, m.role === "user" ? "me" : "bot"));
if (!chatHist.length) addMsg(`Hi Liza 💕 I'm Love AI — Tirth built me so you're never bored, hungry, lost, or unloved. Ask me anything: compliments, dinner plans in Dubai or Ahmedabad, trip planning for ANY country… and tell me "remember that I love roses" — I never forget 🧠`, "bot");
updateMemChip();

/* ─────────── 🤗 HUG ─────────── */
$("hugBtn").addEventListener("click", () => {
  emojiRain(["🤗", "💖", "🫂", "💗", "🥰"], 30);
  if (navigator.vibrate) navigator.vibrate([80, 60, 80, 60, 220]);
});

/* ─────────── reveal on scroll ─────────── */
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ═══════════ 💕 LOVE UNIVERSE ENGINE ═══════════ */
/* loader */
addEventListener("load", () => setTimeout(() => $("loader").classList.add("done"), 900));
setTimeout(() => $("loader").classList.add("done"), 3200);

/* floating hearts + twinkling stars canvas */
(function loveCanvas() {
  const cv = $("loveCanvas"), ctx = cv.getContext("2d");
  let W, H;
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  resize(); addEventListener("resize", resize);
  const COLORS = ["#ff5c8a", "#ff2d55", "#c77dff", "#ffb3c6", "#ff85a2"];
  const NH = innerWidth < 760 ? 16 : 30, NS = innerWidth < 760 ? 40 : 70;
  const hearts = Array.from({ length: NH }, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H, ox: 0, oy: 0,
    s: 5 + Math.random() * 13, v: 0.25 + Math.random() * 0.6,
    o: 0.1 + Math.random() * 0.28, c: COLORS[i % COLORS.length], w: Math.random() * 6.28,
  }));
  const stars = Array.from({ length: NS }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: 0.4 + Math.random() * 1.3, tw: Math.random() * 6.28,
  }));
  let burst = [];
  const pointer = { x: -999, y: -999 };
  const setP = (x, y) => { pointer.x = x; pointer.y = y; };
  addEventListener("pointermove", (e) => setP(e.clientX, e.clientY), { passive: true });
  addEventListener("touchmove", (e) => setP(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  addEventListener("pointerdown", (e) => {
    for (let i = 0; i < 9; i++) {
      const a = Math.random() * 6.28, sp = 1.2 + Math.random() * 2.6;
      burst.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, s: 4 + Math.random() * 9, life: 1, c: COLORS[Math.floor(Math.random() * COLORS.length)] });
    }
  }, { passive: true });
  function drawHeart(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.4);
    ctx.bezierCurveTo(x - s, y - s * 0.5, x - s * 0.45, y - s * 1.15, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.45, y - s * 1.15, x + s, y - s * 0.5, x, y + s * 0.4);
    ctx.fill();
  }
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() / 1000;
    stars.forEach((s) => {
      ctx.globalAlpha = 0.25 + Math.abs(Math.sin(t * 1.5 + s.tw)) * 0.55;
      ctx.fillStyle = "#ffd9e6";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
    });
    hearts.forEach((h) => {
      const dx = h.x - pointer.x, dy = h.y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < 150 && d > 0) { const f = (150 - d) / 150; h.ox += (dx / d) * f * 5; h.oy += (dy / d) * f * 5; }
      h.ox *= 0.92; h.oy *= 0.92;
      h.y -= h.v;
      h.x += Math.sin(t + h.w) * 0.35;
      if (h.y < -30) { h.y = H + 30; h.x = Math.random() * W; }
      ctx.globalAlpha = h.o + Math.min(Math.abs(h.ox) / 60, 0.35);
      ctx.fillStyle = h.c;
      drawHeart(h.x + h.ox, h.y + h.oy, h.s);
    });
    burst = burst.filter((p) => p.life > 0);
    burst.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.022;
      ctx.globalAlpha = Math.max(p.life, 0) * 0.9;
      ctx.fillStyle = p.c;
      drawHeart(p.x, p.y, p.s);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
})();

/* god-mode cursor: glow orb + magnetic buttons + hero parallax + tap confetti */
(function godMode() {
  const glow = document.createElement("div");
  glow.id = "glow";
  document.body.appendChild(glow);
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
  const setT = (x, y) => { tx = x; ty = y; glow.style.opacity = 1; };
  addEventListener("pointermove", (e) => setT(e.clientX, e.clientY), { passive: true });
  addEventListener("touchmove", (e) => setT(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  (function follow() {
    gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
    glow.style.left = gx + "px"; glow.style.top = gy + "px";
    requestAnimationFrame(follow);
  })();

  const hero = document.querySelector(".hero");
  addEventListener("pointermove", (e) => {
    if (!hero) return;
    const dx = (e.clientX / innerWidth - 0.5), dy = (e.clientY / innerHeight - 0.5);
    hero.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
  }, { passive: true });

  document.querySelectorAll(".big-btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      if (!matchMedia("(hover:hover)").matches) return;
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });

  addEventListener("pointerdown", (e) => {
    if (e.target.closest("input, select, textarea, .chat-box, canvas")) return;
    confetti(e.clientX, e.clientY, 5);
  }, { passive: true });
})();

/* kiss button */
$("kissBtn").addEventListener("click", () => {
  emojiRain(["😘", "💋", "❤️", "💕"], 28);
  if (navigator.vibrate) navigator.vibrate([60, 50, 60, 50, 160]);
});

/* touch heart-trail (mobile) */
addEventListener("touchmove", (e) => {
  const t = Date.now();
  if (t - (window.__lastTrail || 0) < 130) return;
  window.__lastTrail = t;
  const s = document.createElement("span");
  s.className = "trail-heart"; s.textContent = "💗";
  s.style.left = e.touches[0].clientX - 7 + "px";
  s.style.top = e.touches[0].clientY - 7 + "px";
  document.body.appendChild(s); setTimeout(() => s.remove(), 900);
}, { passive: true });

/* 3D card tilt (desktop) */
if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
  document.querySelectorAll(".card").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
    });
    c.addEventListener("pointerleave", () => (c.style.transform = ""));
  });
}

/* ═══════════ 🎮 ARCADE ═══════════ */
document.querySelectorAll("[data-game]").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("[data-game]").forEach((x) => x.classList.remove("active"));
  b.classList.add("active");
  $("gameHc").classList.toggle("hidden", b.dataset.game !== "hc");
  $("gameBp").classList.toggle("hidden", b.dataset.game !== "bp");
}));
function gameOver(box, score, best, label) {
  const d = document.createElement("div");
  d.className = "game-over";
  d.innerHTML = `<b>${label}</b><span>score ${score} · best ${best}</span><span class="script-font" style="font-size:1.4rem;color:var(--pink-soft)">you win my heart — again 💕</span>`;
  box.appendChild(d);
  setTimeout(() => d.remove(), 3500);
}

/* 💘 Heart Catcher */
(function heartCatcher() {
  const cv = $("hcCanvas"), ctx = cv.getContext("2d");
  let playing = false, score = 0, time = 30, hearts = [], basketX = 0.5, timer = null, spawner = null, raf = null;
  const fit = () => { cv.width = cv.clientWidth; cv.height = cv.clientHeight; };
  fit(); addEventListener("resize", fit);
  const move = (clientX) => {
    const r = cv.getBoundingClientRect();
    basketX = Math.min(Math.max((clientX - r.left) / r.width, 0.06), 0.94);
  };
  cv.addEventListener("pointermove", (e) => move(e.clientX));
  cv.addEventListener("touchmove", (e) => { move(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
  $("hcBest").textContent = localStorage.getItem("hc_best") || 0;
  function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const bx = basketX * cv.width, by = cv.height - 34;
    ctx.font = "34px serif"; ctx.textAlign = "center";
    ctx.fillText("💖", bx, by);
    hearts.forEach((h) => {
      h.y += h.v; h.x += Math.sin(h.y / 40) * 0.6;
      ctx.font = h.s + "px serif";
      ctx.fillText(h.e, h.x, h.y);
      if (Math.abs(h.y - by + 10) < 26 && Math.abs(h.x - bx) < 38) { h.caught = true; score++; $("hcScore").textContent = score; }
    });
    hearts = hearts.filter((h) => !h.caught && h.y < cv.height + 30);
    if (playing) raf = requestAnimationFrame(loop);
  }
  $("hcStart").addEventListener("click", () => {
    if (playing) return;
    playing = true; score = 0; time = 30; hearts = [];
    $("hcScore").textContent = 0; $("hcTime").textContent = 30;
    fit(); loop();
    spawner = setInterval(() => {
      const em = ["💕", "💗", "❤️", "🩷", "💝"];
      hearts.push({ x: 24 + Math.random() * (cv.width - 48), y: -20, v: 1.4 + Math.random() * 1.8, s: 20 + Math.random() * 14, e: em[Math.floor(Math.random() * em.length)] });
    }, 480);
    timer = setInterval(() => {
      time--; $("hcTime").textContent = time;
      if (time <= 0) {
        clearInterval(timer); clearInterval(spawner); playing = false;
        const best = Math.max(score, +localStorage.getItem("hc_best") || 0);
        localStorage.setItem("hc_best", best); $("hcBest").textContent = best;
        gameOver(cv.parentElement, score, best, score > 14 ? "unbelievable 😍" : score > 8 ? "so good! 💘" : "my heart is safe with you");
      }
    }, 1000);
  });
})();

/* 🎈 Balloon Pop (love notes inside) */
(function balloonPop() {
  const field = $("bpField");
  const NOTES = ["i love you 💕", "cutest wife ever 🥰", "my jaan 💖", "you + me = ♾️", "kiss incoming 😘", "best decision: you 💍", "you're home 🏡", "forever yours ❤️", "my peace 🕊️", "hug credit +1 🤗"];
  const EMOJI = ["🎈", "🎈", "❤️", "💜", "💙", "🩷"];
  let playing = false, score = 0, time = 30, timer = null, spawner = null;
  $("bpBest").textContent = localStorage.getItem("bp_best") || 0;
  $("bpStart").addEventListener("click", () => {
    if (playing) return;
    playing = true; score = 0; time = 30;
    $("bpScore").textContent = 0; $("bpTime").textContent = 30;
    field.innerHTML = "";
    spawner = setInterval(() => {
      const b = document.createElement("span");
      b.className = "balloon";
      b.textContent = EMOJI[Math.floor(Math.random() * EMOJI.length)];
      b.style.left = 4 + Math.random() * 86 + "%";
      b.style.animationDuration = 3 + Math.random() * 2.2 + "s";
      b.addEventListener("pointerdown", (e) => {
        score++; $("bpScore").textContent = score;
        const n = document.createElement("span");
        n.className = "pop-note";
        n.textContent = Math.random() < 0.65 ? NOTES[Math.floor(Math.random() * NOTES.length)] : "💥 pop!";
        n.style.left = Math.min(e.clientX - field.getBoundingClientRect().left - 40, field.clientWidth - 150) + "px";
        n.style.top = e.clientY - field.getBoundingClientRect().top + "px";
        field.appendChild(n);
        setTimeout(() => n.remove(), 1600);
        b.remove();
      });
      field.appendChild(b);
      setTimeout(() => b.remove(), 5400);
    }, 620);
    timer = setInterval(() => {
      time--; $("bpTime").textContent = time;
      if (time <= 0) {
        clearInterval(timer); clearInterval(spawner); playing = false;
        field.querySelectorAll(".balloon").forEach((b) => b.remove());
        const best = Math.max(score, +localStorage.getItem("bp_best") || 0);
        localStorage.setItem("bp_best", best); $("bpBest").textContent = best;
        gameOver(field, score, best, score > 16 ? "balloon queen 👑" : score > 9 ? "popping pro 🎈" : "every pop was a kiss 😘");
      }
    }, 1000);
  });
})();
