# 🐾 StayClose — Smart Pet Hotel Monitoring Platform

> Real time CCTV, trusted care. Happy pets, worry-free pawrents.

StayClose is an animated, interactive web app for pet owners whose pets are staying at a pet hotel. Owners can watch live CCTV, read daily activity reports, manage pet profiles, book hotels and chat with caretakers.

Built with **plain HTML, CSS and JavaScript**. No framework and no build step.

## ▶️ Run it

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .            # or: python3 -m http.server 8000
```

**Demo login:** `gwen@stayclose.com` / `password123` (the login page has a "Fill in" button).
You can also create a new account. Sample pets and bookings are added to every new account so there is something to explore.

## 📄 Pages

| Page | File | Highlights |
|---|---|---|
| Intro | `index.html` | Splash with logo draw + paw steps, word-by-word hero, 3D-tilt live camera scene, click the pets for hearts, marquee, count-up stats |
| Sign up | `signup.html` | Dog mascot follows your cursor and covers its eyes while you type a password, strength meter, validation shake, confetti |
| Log in | `login.html` | Same mascot, demo fill, remember me |
| Forgot password | `forgot-password.html` | 4 steps: email → 4-digit code (auto-advance OTP inputs, paste support, resend timer) → new password → success |
| Dashboard | `dashboard.html` | Current booking with stay progress, My Pets + Quick View, Quick Actions (Live Camera, Activity Report, Find Hotel, Chat Support), My Bookings, notifications, simulated live update toasts |
| Live Monitoring | `live.html` | Simulated CCTV with 5 rooms, pets wander around, camera switching static effect, mute, talk-to-staff waveform, snapshot flash, record timer, fullscreen, live activity feed |
| Activity Report | `activity.html` | Per-pet tabs, day navigation, animated wellness ring, metrics, timeline, weekly bar chart, download report |
| My Bookings / Find Hotel | `bookings.html` | Booking list with animated tabs, booking details, cancel. **Book a Stay** flow: choose hotel → details (room type, promo codes `SPA20`, `STAYCLOSE10`, `PAWS15`) → payment (QRIS with countdown, card, bank VA, e-wallet) → confirmation |
| Pet Profiles | `pets.html` | Add / edit / delete pets with avatar & colour picker |
| Notifications | `notifications.html` | Filters, mark all read, hover-to-delete, emergency alert screen with radar animation and "Contact Hotel Now" |
| Chat Support | `chat.html` | Typing indicator, quick replies, auto-replies from caretaker |
| Settings | `settings.html` | Profile & avatar, notification toggles, light/dark theme, paw-trail and reduced-motion, change password, export data, reset demo DB, delete account |

## 🗄️ Database

- **`database/schema.sql`**: MySQL 8 / MariaDB schema with 13 tables (`users`, `pets`, `hotels`, `room_types`, `bookings`, `booking_pets`, `payments`, `cameras`, `activities`, `notifications`, `messages`, `user_settings`, `password_resets`) plus 2 views (`v_active_stays`, `v_daily_report`).
- **`database/seed.sql`**: matching sample data (the demo user, 3 pets, 6 hotels, 5 cameras, bookings, activities, notifications).

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p stayclose < database/seed.sql
```

The front end does not need a server. `js/db.js` keeps the same tables in the browser's `localStorage`, with a small query API (`DB.table('pets').insert(...)`, `DB.Q.bookings(userId)`, `DB.Auth.login(...)`). To connect a real backend, replace those calls with `fetch()` requests to your API.

> ⚠️ Auth in this demo runs in the browser (salted SHA-256 in localStorage) and the reset code is shown in a toast. Use server-side auth with bcrypt/argon2 and email delivery before going to production.

## 🎨 Design system

`css/style.css` holds the shared tokens from the StayClose design: cream background `#F5F0E8`, navy `#1A2B4A`, teal `#2D4A6B` / `#4A7FA5`, primary button `#5A82AB`, soft green / orange / purple / red tiles, 16px radius cards, 260px sidebar. A dark theme is included.

```
StayClose/
├── index.html, login.html, signup.html, forgot-password.html
├── dashboard.html, live.html, activity.html, bookings.html
├── pets.html, notifications.html, chat.html, settings.html
├── css/   style.css (design system) · landing.css · auth.css · pages.css
├── js/    icons.js (SVG sprite) · db.js (database) · app.js (shell, animations) · widgets.js
│   └── pages/  one script per page
└── database/  schema.sql · seed.sql
```

Pet and hotel pictures are drawn with emoji and CSS, so the project has no image files. To use real photos, swap `App.petPhoto()` / `App.hotelPhoto()` in `js/app.js` for `<img>` tags.
