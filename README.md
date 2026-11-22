# Tampermonkey Search & Navigation Tweaks

A collection of lightweight UserScripts designed to customize search behavior and navigation interface elements.

## Scripts

### 1. Google to Yandex Search Button
Adds an absolute-positioned Yandex search button to the right of the Google search bar. Allows quick redirection of the active query to Yandex without modifying the layout or dimensions of the original search input.

* **Target:** `https://www.google.com/search*`, `https://www.google.ru/search*`
* **Features:** Dynamic element insertion, non-intrusive positioning, single-click query redirection.

### 2. YouTube Logo to Subscriptions
Redirects the primary YouTube header logo to point directly to the Subscriptions feed (`/feed/subscriptions`) instead of the default Home page.

* **Target:** `https://www.youtube.com/*`
* **Features:** Dynamic SPA element mutation observer, automatic link and title attribute update.

### 3. RuTracker Search for Kinopoisk and IMDb
Adds a “RuTracker” button to film and series pages on Kinopoisk and IMDb. The button searches RuTracker using the detected title and release year.

* **Target:** `https://www.kinopoisk.ru/*`, `https://kinopoisk.ru/*`, `https://www.imdb.com/*`, `https://imdb.com/*`
* **Features:** Automatic title and year detection, native-style Kinopoisk button placement, inline IMDb placement, dynamic SPA updates.

## Installation

1. Install a browser extension for running userscripts (e.g., [Tampermonkey](https://www.tampermonkey.net/)).
2. Create a new userscript in your extension dashboard.
3. Copy and paste the contents of the respective `.user.js` file.
4. Save and enable the script.

## License

MIT
