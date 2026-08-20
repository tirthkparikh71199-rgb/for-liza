#!/usr/bin/env python3
"""💌 Email engine for Liza — water reminders + daily love letter emails."""
import os, sys, ssl, smtplib, json, datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER = os.environ["GMAIL_USER"]
GMAIL_PASS = os.environ["GMAIL_APP_PASSWORD"]
TO = os.environ["WIFE_EMAIL"]
FORCE = os.environ.get("FORCE_SEND") == "1"

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
  <p style="color:#4a2b3a;font-size:17px;line-height:1.6">{body}</p>
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

mode = sys.argv[1] if len(sys.argv) > 1 else "water"

if mode == "water":
    h = her_hour()
    if not FORCE and (h >= QUIET_START or h < QUIET_END):
        print(f"😴 quiet hours in Gulf time ({h}:00) — skipping"); sys.exit(0)
    doy = int(datetime.datetime.utcnow().strftime("%j"))
    title, body = WATER_MSGS[(doy * 24 + h) % len(WATER_MSGS)]
    send(title, html_email(title, body, "💧 reply with a 💧 emoji when done — he checks"))
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
    send("💌 your daily letter is here, Liza", html_email("A letter for my wife 💕", body, "read the full letter on your website 💻💕"))
