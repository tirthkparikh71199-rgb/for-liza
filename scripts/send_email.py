#!/usr/bin/env python3
"""💌 Email engine for Liza — water reminders + daily love letter emails."""
import os, sys, ssl, smtplib, json, datetime, urllib.request, urllib.parse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER = os.environ["GMAIL_USER"]
GMAIL_PASS = os.environ["GMAIL_APP_PASSWORD"]
TO = os.environ["WIFE_EMAIL"]
FORCE = os.environ.get("FORCE_SEND") == "1"
KV_PREFIX = os.environ.get("KV_PREFIX", "lizu3000-939c3594668bfb149f05a724")

def kv(key, val="__GET__"):
    """tiny shared state store so the hourly water email never double-sends
    (GitHub cron fires every 20 min and often runs late — this makes it exactly 1/hour)"""
    safe = "".join(ch if ch.isalnum() or ch in "_-" else "-" for ch in key)
    url = f"https://textdb.dev/api/data/{KV_PREFIX}-{safe}"
    try:
        if val == "__GET__":
            req = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
            with urllib.request.urlopen(req, timeout=10) as r:
                body = r.read().decode().strip()
            if not body:
                return None
            o = json.loads(body)
            return o.get("v") if isinstance(o, dict) and "v" in o else o
        req = urllib.request.Request(url, data=json.dumps({"v": val}).encode(),
                                     headers={"Content-Type": "application/json"}, method="POST")
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception as e:
        print("kv error (not fatal):", e)
        return None


WA_PHONE = os.environ.get("WHATSAPP_PHONE", "")     # e.g. 971501234567 (country code, no +)
WA_KEY = os.environ.get("WHATSAPP_APIKEY", "")      # from CallMeBot, one-time opt-in on her phone

def whatsapp(text):
    """free WhatsApp push via CallMeBot. Silently skips if the secrets aren't set."""
    if not (WA_PHONE and WA_KEY):
        print("📵 whatsapp secrets not set — email only")
        return False
    url = ("https://api.callmebot.com/whatsapp.php?phone=" + urllib.parse.quote(WA_PHONE)
           + "&apikey=" + urllib.parse.quote(WA_KEY) + "&text=" + urllib.parse.quote(text))
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            r.read()
        print("✅ whatsapp sent to", WA_PHONE)
        return True
    except Exception as e:
        print("whatsapp failed (email still sent):", e)
        return False

GULF_OFFSET = datetime.timedelta(hours=4)  # UTC+4 Gulf time
QUIET_START, QUIET_END = 23, 11            # no water emails 11 PM → 11 AM

WATER_MSGS = [
    ("💧 Water break, my love", "One glass for me? Pretty please 🥺 Your favorite person wants you healthy, glowing, and hydrated."),
    ("🥤 Sip sip, jaan!", "Hydration check! Your skin is already thanking you. Drink a glass and think of me 💕"),
    ("🌸 A tiny reminder from your husband", "Water time, cutie! One glass now = extra glow today. I love you, drink up 💧"),
    ("💦 Hydration station calling", "Liza! Water. Now. I'll know if you skip it (I won't, but pretend I will 😌💧)"),
    ("🧊 Cool water, warm love", "Grab a glass, my love. Somewhere out there a husband is smiling thinking of you drinking water like a good girl 😄💕"),
    ("💧 Drink water, stay cute", "Science says hydrated people are 100% more adorable. Okay maybe not science, but I say it. Drink up 💧"),
    ("🌊 Your hourly love-hydration alert", "Water break! Also: you're beautiful, you're doing great, and someone misses you 💙"),
    ("🚰 Psst… water o'clock", "One glass, jaan. For your health, your glow, and my peace of mind 🥰"),
    ("💧 Gentle nudge from Tirth", "Hydrate that beautiful body! I'll stop sending these when you finish the bottle 😤💕"),
    ("🍶 Water + love = this email", "Drink a glass, cutie. Then stretch a little. Then smile. All three are doctor's orders (I'm the doctor) 😎"),
    ("💦 Be honest… when did you last drink water?", "Exactly. Go. Now. Glass. Water. I love you 💧❤️"),
    ("🌷 Hourly reminder: you're loved (and thirsty)", "Water time, Liza! Your husband insists. Your body agrees. Your cup is waiting 💧"),
]

def her_hour():
    return (datetime.datetime.utcnow() + GULF_OFFSET).hour

def html_email(title, body, footer="— sent with 💕 by your husband's website"):
    return f"""<div style="font-family:Georgia,serif;max-width:480px;margin:auto;background:linear-gradient(160deg,#fff0f5,#f3ecff);border-radius:24px;padding:34px 28px;text-align:center">
  <div style="font-size:44px">💌</div>
  <h2 style="color:#ff4d8d;font-family:Georgia,serif">{title}</h2>
  <div style="color:#4a2b3a;font-size:17px;line-height:1.6">{body}</div>
  <p style="color:#9a7b8c;font-size:13px;margin-top:24px">{footer}</p>
</div>"""

def send(subject, html):
    msg = MIMEMultipart("alternative")
    msg["Subject"], msg["From"], msg["To"] = subject, GMAIL_USER, TO
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ssl.create_default_context()) as s:
        s.login(GMAIL_USER, GMAIL_PASS)
        s.sendmail(GMAIL_USER, TO, msg.as_string())
    print(f"✅ sent '{subject}' to {TO}")


WELCOME_HTML = """
<div style="text-align:left">
<p style="font-size:19px;color:#ff4d8d;font-family:Georgia,serif;margin:0 0 6px">My Liza,</p>

<p>I built you something. It took me a lot of late nights — the same late nights you never
complained about, even when you waited alone with dinner going cold. I noticed. I always noticed.</p>

<p>You have carried me through days I did not deserve carrying. When work took my attention, you gave me
patience. When I got angry over things that were never your fault, you gave me softness instead of the
anger I had earned. I am sorry, jaan. Truly. Not the quick kind of sorry — the kind that has been
sitting in my chest for a while, waiting for the right way to say it. This is me saying it.</p>

<p>So I made a little corner of the internet that exists only for you. A love letter written fresh
every morning. Something to remind you to drink water. A place for your moods, your photos, your
lists, your dreams of every country we still have to see. And a small robot named
<b style="color:#ff4d8d">LIZU-3000</b>, who knows everything about you and never gets tired of talking
about how wonderful you are — the version of me that is always patient, always available, always yours.</p>

<p>You are not a part of my world, Liza. You <i>are</i> the world — everything else is just weather.</p>

<p style="margin-top:22px;text-align:center">
  <a href="{SITE}" style="background:linear-gradient(135deg,#ff2d78,#c77dff);color:#fff;text-decoration:none;
     padding:14px 30px;border-radius:999px;font-size:17px;font-weight:bold;display:inline-block;
     box-shadow:0 8px 24px rgba(255,45,120,0.4)">💕 Open your world</a>
</p>
<p style="font-size:13px;color:#9a7b8c;margin-top:14px">
  it's locked, so only you can get in 🔒<br>
  <b>name:</b> bubie &nbsp;·&nbsp; <b>secret word:</b> paap
</p>

<p style="margin-top:20px">Thank you for staying. Thank you for loving a man who codes too late and
apologises too slow. I'm going to keep getting better at this — at us.</p>

<p style="font-size:19px;color:#ff4d8d;font-family:Georgia,serif;margin-top:20px">
  Forever yours,<br>your husband ❤️</p>
</div>
"""

SITE = os.environ.get("SITE_URL", "https://tirthkparikh71199-rgb.github.io/for-liza/")

mode = sys.argv[1] if len(sys.argv) > 1 else "water"

if mode == "welcome":
    send("💌 I made something for you, Liza — open it 🥺",
         html_email("For my wife 💕", WELCOME_HTML.replace("{SITE}", SITE),
                    "made by your husband, on too many late nights 💻❤️"))
    whatsapp("Liza… I made something for you 🥺❤️ It's yours, and only yours: " + SITE
             + "\n(name: bubie · secret word: paap)")
    sys.exit(0)

if mode == "water":
    gulf = datetime.datetime.utcnow() + GULF_OFFSET
    h = gulf.hour
    if not FORCE and (h >= QUIET_START or h < QUIET_END):
        print(f"😴 quiet hours in Gulf time ({h}:00) — skipping"); sys.exit(0)
    slot = gulf.strftime("%Y-%m-%d-%H")
    if not FORCE and kv("state/lastWater") == slot:
        print(f"✅ already sent for {h}:00 Gulf — skipping duplicate"); sys.exit(0)
    doy = int(gulf.strftime("%j"))
    title, body = WATER_MSGS[(doy * 24 + h) % len(WATER_MSGS)]
    send(title, html_email(title, body, "💧 reply with a 💧 emoji when done — he checks"))
    whatsapp(f"{title}\n\n{body}")
    kv("state/lastWater", slot)
else:
    letter, poem = None, ""
    try:
        with open("daily.json") as f:
            d = json.load(f)
        if d.get("date") == datetime.date.today().isoformat():
            letter, poem = d.get("letter"), d.get("poem", "")
    except Exception:
        pass
    if not letter:
        letter = "Good morning, my beautiful Liza. Another day, another reason I thank my luck for you. Eat well, drink water, and save all your smiles for me ❤️"
    body = letter + (f"<br><br><i style='color:#b388ff'>{poem.replace(chr(10), '<br>')}</i>" if poem else "")
    send(f"💌 {datetime.date.today().strftime('%d %b')} — a fresh letter for Liza", html_email("A letter for my wife 💕", body, "read the full letter on your website 💻💕"))
    whatsapp("💌 Good morning jaan — today's letter is waiting for you:\n\n" + letter[:280] + ("…" if len(letter) > 280 else "") + "\n\n" + SITE)
