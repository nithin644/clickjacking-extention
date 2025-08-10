# 🛡️ Clickjack Alert – Brave Browser Extension

**Clickjack Alert** is a lightweight security extension designed for cybersecurity researchers, penetration testers, and privacy-conscious users.  
It automatically detects whether a visited website is vulnerable to **Clickjacking** and displays a clear on-screen alert.

---

## 🚀 Features
- ✅ **Automatic Detection** – Checks every visited site for Clickjacking vulnerability.
- ⚠️ **Real-time Alerts** – Displays a black fullscreen overlay with a red message if the site is vulnerable.
- 🟢 **Safe Notification** – Displays a green message if the site is not vulnerable.
- 🔒 **Privacy First** – No tracking, no data collection.
- 🌐 **Works on Brave & Chromium-based browsers**.

---

## 📸 Screenshots

**Vulnerable Website Alert**  
![Clickjack Vulnerable](https://github.com/user-attachments/assets/fb894137-40c0-4313-889d-c8402c2303e3)  

**Safe Website Notification**  
![Clickjack Safe](https://github.com/user-attachments/assets/cf7c55dd-5b97-4e98-b402-386588945872)  

---

## 📖 What is Clickjacking?
Clickjacking is a web security vulnerability where a malicious site tricks users into clicking on something different from what they perceive, often by loading another site inside an invisible frame.

**Example Attack:**
- Attacker embeds a sensitive site inside an `<iframe>` with `opacity: 0`
- User thinks they are clicking a harmless button, but they are actually performing an action on the hidden site.

---

## 🛠️ Installation (Developer Mode)
1. Download or clone this repository:
   ```bash
   git clone https://github.com/nithin644/clickjacking-extention.git
Open Brave Browser and go to:

arduino
Copy
Edit
brave://extensions/
Enable Developer mode (top right).

Click Load unpacked and select the extension folder.

🧪 How it Works
The extension attempts to embed the current page in an <iframe> in a background check.

If the page loads successfully, it is flagged as vulnerable.

If the browser blocks the <iframe> with X-Frame-Options or Content-Security-Policy, it is flagged as safe.

