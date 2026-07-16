# Poker Tournament Registration Web App

A lightweight, serverless web application for managing poker tournament registrations, payments, and reminders. Designed to be reusable for future events with minimal configuration.

---

## Project layout

```
├── index.html              # Site entry (GitHub Pages)
├── css/style.css
├── js/
│   ├── config.js           # Per-event settings
│   └── script.js           # Registration UI logic
├── assets/
│   ├── images/             # Flyer / content images
│   └── icons/              # Favicons & PWA icons
├── apps-script/Code.gs     # Google Apps Script backend (paste into sheet)
├── site.webmanifest
└── README.md
```

---

## Features

- Online registration form (Name, Email, Phone)
- Two buy-in options:
  - $60 Registration
  - $80 Registration + Rebuy
- Optional referral field for discounts (manually reviewed)
- Immediate payment instruction screen after registration
- Countdown timer until registration closes
- Limited capacity with **live “Spots Remaining” counter**
- Automatic payment reminder emails for unpaid registrations
- Admin-controlled payment confirmation via Google Sheets

---

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Google Apps Script (Web App)
- **Database:** Google Sheets
- **Email:** Google Apps Script MailApp
- **Hosting:** GitHub Pages (free)

---

