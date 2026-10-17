# Lala Bazar Mini IPL

A responsive static website for the Lala Bazar Mini IPL community cricket tournament.

## Features
- Mobile-first design with fixtures, teams, knockout bracket and tournament information.
- 10-team, single-elimination bracket: 2 play-in matches, 4 quarter-finals, 2 semi-finals and 1 final (9 matches total).
- Four-day sample schedule with match slots between 8:00 AM and 4:30 PM.
- Organiser panel for editing team names and entering scores.
- Bracket winners advance automatically after a non-tied score is entered.
- Data saves in the current browser with `localStorage` only. It is not a shared database and scores do not sync between visitors.
- No build step or external JavaScript dependency. Google Fonts are loaded from Google Fonts; local fallback fonts are provided.

## Run locally
Open `index.html` in a browser. For a local server, run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.

## Deploy with GitHub Pages
1. Create a public repository named `lala-bazar-mini-ipl` on GitHub.
2. Upload all files and folders from this bundle to the repository root (including `.github/workflows/deploy.yml`).
3. In the repository, open **Settings → Pages** and set the build/deployment source to **GitHub Actions** if prompted.
4. Open **Actions** and wait for the `Deploy static site to GitHub Pages` workflow to complete.
5. Your site will be available at `https://YOUR-GITHUB-USERNAME.github.io/lala-bazar-mini-ipl/`.

## Important before launch
The current dates, venue address, contact number and team names are intentionally not invented. Replace the sample Team A–J names with the confirmed names. The schedule is a suggested four-day layout; organisers should verify the venue timing, match duration, rest breaks, tie-break rules and fixtures before publishing it as official.
