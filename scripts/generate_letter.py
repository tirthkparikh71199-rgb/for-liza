#!/usr/bin/env python3
"""✨ Generates today's AI love letter + poem for Liza → daily.json"""
import os, json, datetime, urllib.request

PROMPT = """Write today's love letter from Tirth to his wife Liza (married 23 Feb 2025, their life is split between Dubai and Ahmedabad).
Rules: 70-100 words, warm, playful, deeply in love, mention the date subtly or the season. Pet names: Liza, jaan, cutie. Never crude.
Then a 4-line cute rhyming poem.
Format EXACTLY:
LETTER:
<letter text>
POEM:
<4 lines>"""

FALLBACK = {
    "letter": "My dearest Liza, today the AI took a tiny day off, but my love didn't. You are my first thought every morning and my last every night. Drink water, smile lots, and know that I'm yours completely.",
    "poem": "Roses are red, the Gulf sky is blue,\nno matter the day, I'm thinking of you.\nThrough code and through circuits this much is true —\nforever and always, it's me and you.",
}

def groq(prompt, key):
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps({
            "model": "openai/gpt-oss-120b",
            "reasoning_effort": "low",
            "max_completion_tokens": 450,
            "messages": [{"role": "user", "content": prompt}],
        }).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (forfats-love/1.0)"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)["choices"][0]["message"]["content"]

def pollinations(prompt):
    url = "https://text.pollinations.ai/" + urllib.parse.quote(prompt)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (forfats-love/1.0)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode()

letter, poem = FALLBACK["letter"], FALLBACK["poem"]
try:
    raw = None
    key = os.environ.get("GROQ_API_KEY", "")
    if key:
        try: raw = groq(PROMPT, key)
        except Exception as e: print("groq failed:", e)
    if not raw:
        raw = pollinations(PROMPT)
    if "LETTER:" in raw and "POEM:" in raw:
        letter = raw.split("LETTER:")[1].split("POEM:")[0].strip()
        poem = raw.split("POEM:")[1].strip()
    elif raw:
        letter = raw.strip()[:600]
except Exception as e:
    print("all AI failed, using fallback:", e)

out = {"date": datetime.date.today().isoformat(), "letter": letter, "poem": poem}
with open("daily.json", "w") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print("✅ daily.json written for", out["date"])
