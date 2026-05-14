# Pulse Check IQ — Employee Training Tracker (Dashboard)

This is the live dashboard that buyers connect to their own Google Sheet.

## Deploy to GitHub Pages (10 minutes)

1. **Create a new public repo** on GitHub. Name it something like `employee-training-tracker` (this becomes part of the URL).
2. **Upload** every file and folder from this directory:
   - `index.html`
   - `src/` (the whole folder)
   - `assets/` (the whole folder)
   - `README.md` (this file — optional but helpful)
3. **Enable Pages**: Repo → Settings → Pages → Source: "Deploy from a branch" → Branch: `main` → Folder: `/ (root)` → Save.
4. Wait ~1 minute. Your dashboard URL is now: `https://YOUR-USERNAME.github.io/employee-training-tracker/`

## Use a custom domain (optional, ~$12/year)

1. Buy a domain like `pulsecheckiq.com` on Cloudflare or Namecheap.
2. In your domain registrar, add a CNAME record pointing `trainalytic.com` → `YOUR-USERNAME.github.io`.
3. In your repo: Settings → Pages → Custom domain → enter `trainalytic.com` → Save → check "Enforce HTTPS" once Pages validates it.
4. Update the welcome PDF (`deliverables/welcome-pdf.html`) to use the new URL.

## File structure

```
index.html                 ← root, loads everything
src/
  styles.css               ← all design tokens and component styles
  icons.jsx                ← SVG icon set
  data.jsx                 ← sample data + config defaults
  sheet_api.jsx            ← talks to the buyer's Apps Script
  ui.jsx                   ← shared primitives (Button, Card, etc.)
  chrome.jsx               ← sidebar + topbar
  setup_wizard.jsx         ← 8-step setup
  pulse_check.jsx          ← seller branding components
  page_home.jsx            ← dashboard home
  page_trainees.jsx        ← trainees list + detail
  page_trainers.jsx        ← trainers roster
  page_daily_entry.jsx     ← daily evaluation form
  page_ai_summary.jsx      ← AI summary generator
  page_settings.jsx        ← settings tabs
  tour.jsx                 ← first-run product tour
  tweaks-panel.jsx         ← design-time tweaks (hidden from buyers)
  app.jsx                  ← root component + state + routing
assets/
  pulse-check-iq-logo.png     ← seller brand logo
```

## Updating the dashboard later

Any time you push a new version to this repo, every buyer gets it instantly on their next page load — no re-download. Make sure your changes are backwards-compatible with existing sheets (don't rename columns or tabs).

## Support

Buyer questions go to hello@pulsecheckiq.com (or whatever you set up).
