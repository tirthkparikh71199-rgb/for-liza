/* ═══════════ FOR FATS ❤️ — the whole brain ═══════════ */
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
  if (localStorage.getItem("fats_unlocked") === "1") { open(); }
  const tryUnlock = () => {
    const n = $("lockName").value.trim().toLowerCase();
    const p = $("lockPass").value.trim().toLowerCase();
    if (n === "bubie" && p === "paap") {
      localStorage.setItem("fats_unlocked", "1");
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
function watch(coll, cb) {
  if (db) {
    try { db.collection(coll).orderBy("ts", "desc").limit(60).onSnapshot((s) => cb(s.docs.map((d) => d.data())), () => cb(localArr(coll))); } catch (e) { cb(localArr(coll)); }
  } else cb(localArr(coll));
}

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
(function floaters() {
  const em = ["💗", "🌸", "💕", "✨", "🦋"];
  for (let i = 0; i < 9; i++) {
    const s = document.createElement("span");
    s.textContent = em[i % em.length];
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 1 + Math.random() * 1.4 + "rem";
    s.style.animationDuration = 14 + Math.random() * 16 + "s";
    s.style.animationDelay = -Math.random() * 20 + "s";
    $("heroHearts").appendChild(s);
  }
})();

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
  "DUBAI DATES: sunset at Kite Beach (free), Dubai Fountain show every 30 min in evenings (free), 1-2 AED abra ride across Dubai Creek at Deira, Miracle Garden (Nov-May), Global Village (seasonal, ~25 AED), Al Seef old-town walk, JBR beach walk, Marina dhow cruise dinner (~100-150 AED pp), desert safari with BBQ (~100-200 AED pp), Museum of the Future, Dubai Frame, Love Lake Al Qudra (heart-shaped, free), Hatta day trip, Al Fahidi lanes.",
  "CHEAP EATS DUBAI: Ravi Restaurant Satwa, Al Ustad Special Kabab, Bu Qtair fish, Karama cafeterias, Meena Bazaar street food, 1 AED karak chai, luqaimat at Global Village.",
  "FOOD DELIVERY UAE: Talabat (biggest, Pro = free delivery), Careem (Plus discounts), Deliveroo, Noon Food (often cheapest), Instashop (groceries). PRO TIP: check the SAME restaurant on Talabat vs Careem vs Noon Food before ordering — prices and coupons differ a lot.",
  "GROCERY UAE: Viva = cheapest, Carrefour app deals, Lulu online, Instashop delivers from any store.",
  "SHOPPING UAE: Noon vs Amazon.ae (always compare both), Shein/Namshi sales, Dragon Mart bargains, Deira Gold Souk (bargain hard), Dubai Shopping Festival Dec-Jan huge sales, Outlet Village.",
  "TRAVEL FROM DUBAI (easy visas for UAE residents): Georgia, Azerbaijan, Armenia, Uzbekistan, Maldives, Seychelles, Thailand, Bali, Sri Lanka, Kyrgyzstan. Keep passport + UAE visa valid 6 months. Cheaper flights Tue/Wed, use Skyscanner 'everywhere'. Best seasons: Georgia May-Oct, Maldives Nov-Apr, Bali Apr-Oct, Thailand Nov-Feb.",
  "TRAVEL TIPS: hotels with free cancellation, travel insurance, carry some USD, Airalo eSIM, keep Day 1 light (arrive + sunset + dinner), mix activity days with rest days, always plan one surprise romantic dinner.",
  "ROMANTIC IDEAS: breakfast in bed, handwritten note hidden in her bag, flowers just because, recreate first date, print + frame a photo, cook her favorite meal, stargazing drive, slow dance in the living room.",
];
function retrieve(q) {
  const words = q.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  return KB.map((c) => ({ c, s: words.reduce((n, w) => n + (c.toLowerCase().includes(w) ? 1 : 0), 0) }))
    .sort((a, b) => b.s - a.s).slice(0, 2).map((x) => x.c).join("\n");
}
async function askAI(userMsg, opts = {}) {
  const sys = CONFIG.aiContext + "\n\nHELPFUL FACTS (use naturally, never mention this list):\n" + retrieve(userMsg);
  const body = {
    model: CONFIG.groqModel,
    reasoning_effort: "low",
    temperature: 0.85,
    max_completion_tokens: opts.long ? 1200 : 320,
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
  { letter: "My dearest Fats, another day has begun and my first thought was you — as always. You make ordinary days feel like festivals and quiet evenings feel like home. I hope today is as soft and beautiful as your heart.", poem: "Morning light on your sleepy face,\nmy favorite view, my favorite place.\nAnother day, another chance to say —\nI love you more than yesterday." },
  { letter: "Jaan, if I could bottle the way you laugh, I'd be the richest man in Dubai. Thank you for choosing me every single day. I don't say it enough, but you are my greatest blessing.", poem: "Your laugh, my favorite song,\nwith you is where I belong.\nThrough every high and every low,\nit's you and me — that's all I know." },
  { letter: "Fats, somewhere between our first hello and this very moment, you became my whole world. Drink your water, eat well, and remember — someone is counting hours to see you.", poem: "The sun rose twice since I saw you last,\ntime without you moves so fast… said no one — it crawls!\nCome home soon, my heart, my muse,\nit's your smile I always choose." },
];
(async function letter() {
  const today = todayKey();
  $("letterDate").textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  try {
    const r = await fetch("daily.json?d=" + Date.now());
    if (r.ok) {
      const d = await r.json();
      if (d.date === today && d.letter) {
        $("letterBody").textContent = d.letter;
        $("letterPoem").textContent = d.poem || "";
        return;
      }
    }
  } catch (e) {}
  const f = FALLBACK_LETTERS[dayOfYear() % FALLBACK_LETTERS.length];
  $("letterBody").textContent = f.letter;
  $("letterPoem").textContent = f.poem;
})();

/* ─────────── 🔮 HOROSCOPE (AI, cached daily) ─────────── */
(async function horo() {
  const key = "horo_" + todayKey();
  const cached = localStorage.getItem(key);
  if (cached) { $("horoText").textContent = cached; return; }
  try {
    const t = await askAI(`Give my wife Fats (Capricorn, born 15 Jan) a sweet 2-3 sentence love-focused horoscope for today, ${new Date().toDateString()}. Warm, playful, hopeful — from the stars, with love.`);
    localStorage.setItem(key, t);
    $("horoText").textContent = t;
  } catch (e) {
    $("horoText").textContent = "The stars say a very handsome man is thinking about you right now, and he will for the rest of forever. Lucky you, Capricorn ♑💕";
  }
})();

/* ─────────── 🌤️ WEATHER + 💱 WORLD FX ─────────── */
(async function weather() {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${CONFIG.cityLat}&longitude=${CONFIG.cityLon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FDubai`);
    const d = await r.json();
    const w = d.current_weather;
    const codes = { 0: ["☀️", "clear & sunny"], 1: ["🌤️", "mostly sunny"], 2: ["⛅", "partly cloudy"], 3: ["☁️", "cloudy"], 45: ["🌫️", "foggy"], 48: ["🌫️", "foggy"], 51: ["🌦️", "light drizzle"], 61: ["🌧️", "rainy"], 80: ["🌦️", "showers"], 95: ["⛈️", "stormy"] };
    const [em, desc] = codes[w.weathercode] || ["🌈", "beautiful"];
    $("weatherNow").innerHTML = `<span class="w-emoji">${em}</span><div><span class="w-temp">${Math.round(w.temperature)}°C</span><p class="w-desc">${desc} · high ${Math.round(d.daily.temperature_2m_max[0])}° / low ${Math.round(d.daily.temperature_2m_min[0])}° · wind ${Math.round(w.windspeed)} km/h</p></div>`;
    const t = w.temperature;
    $("weatherTip").textContent = t >= 42 ? "🔥 jaan it's an oven outside — AC, iced coffee, stay cute indoors" :
      t >= 35 ? "☀️ hot one today — light clothes, sunscreen, extra water 💧" :
      t >= 25 ? "🌸 perfect weather — maybe an evening walk by the water?" :
      "🧥 rare cool day in Dubai — grab a light jacket, my love";
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
    const r = indexedDB.open("forFats", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }),
  async run(mode, fn) { const d = await this.open(); return new Promise((res) => { const tx = d.transaction("photos", mode); const out = fn(tx.objectStore("photos")); tx.oncomplete = () => res(out && out.result); }); },
  add: (p) => idb.run("readwrite", (s) => s.add(p)),
  all: () => idb.run("readonly", (s) => { const q = s.getAll(); return new Promise((r) => (q.onsuccess = () => r(q.result || []))); }),
  del: (id) => idb.run("readwrite", (s) => s.delete(id)),
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
  if (a) { if (a.fats) $("ansFats").value = a.fats; if (a.tirth) $("ansTirth").value = a.tirth; renderAnswers(a); }
})();
$("ansSave").addEventListener("click", async (e) => {
  const a = { fats: $("ansFats").value.trim(), tirth: $("ansTirth").value.trim(), ts: Date.now() };
  await store("answers", todayKey(), a);
  renderAnswers(a);
  confetti(e.clientX, e.clientY, 10);
});
function renderAnswers(a) {
  $("ansShow").innerHTML = (a.fats ? `<div class="ans-bubble"><b>🩷 Fats:</b> ${esc(a.fats)}</div>` : "") + (a.tirth ? `<div class="ans-bubble"><b>💙 Tirth:</b> ${esc(a.tirth)}</div>` : "");
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
function renderAllLists() { loadTodos(); }
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
      body: JSON.stringify({ _subject: "💌 Ping from Fats!", message: msg }),
    });
    $("pingStatus").textContent = "delivered to his inbox! 💕";
    pushItem("pings", { text: msg });
  } catch (e) { $("pingStatus").textContent = "hmm, it didn't go — try again, jaan 🥺"; }
}
document.querySelectorAll("[data-ping]").forEach((b) => b.addEventListener("click", (e) => { sendPing(b.dataset.ping); confetti(e.clientX, e.clientY, 8); }));
$("pingSend").addEventListener("click", () => { const t = $("pingText").value.trim(); if (!t) return; sendPing("💌 Fats says: " + t); $("pingText").value = ""; });

/* ─────────── 💕 LOVE AI CHAT ─────────── */
const chatHist = [];
function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = "chat-msg " + who;
  d.textContent = text;
  $("chatBox").appendChild(d);
  $("chatBox").scrollTop = $("chatBox").scrollHeight;
  return d;
}
async function sendChat() {
  const t = $("chatInput").value.trim(); if (!t) return;
  $("chatInput").value = "";
  addMsg(t, "me");
  const typing = addMsg("", "bot");
  typing.innerHTML = `<span class="typing-dots"><i></i><i></i><i></i></span>`;
  try {
    const reply = await askAI(t, { history: chatHist.slice(-8) });
    typing.textContent = reply;
    chatHist.push({ role: "user", content: t }, { role: "assistant", content: reply });
  } catch (e) {
    typing.textContent = ["ugh, my love-signal dropped for a second 🥺 try again jaan?", "even my AI gets butterflies talking to you — say that again? 💕"][Math.floor(Math.random() * 2)];
  }
  $("chatBox").scrollTop = $("chatBox").scrollHeight;
}
$("chatSend").addEventListener("click", sendChat);
$("chatInput").addEventListener("keydown", (e) => e.key === "Enter" && sendChat());
document.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => { $("chatInput").value = b.dataset.q; sendChat(); }));
addMsg(`Hi Fats 💕 I'm Love AI — Tirth built me so you're never bored, hungry, lost, or unloved. Ask me anything: compliments, dinner plans, Dubai deals, trip planning… I'm all yours.`, "bot");

/* ─────────── 🤗 HUG ─────────── */
$("hugBtn").addEventListener("click", () => {
  emojiRain(["🤗", "💖", "🫂", "💗", "🥰"], 30);
  if (navigator.vibrate) navigator.vibrate([80, 60, 80, 60, 220]);
});

/* ─────────── reveal on scroll ─────────── */
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
