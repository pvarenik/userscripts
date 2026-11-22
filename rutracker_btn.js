// ==UserScript==
// @name         Поиск на RuTracker (Кинопоиск и IMDb)
// @namespace    https://rutracker.org/
// @version      1.4
// @description  Добавляет кнопку RuTracker в ряд кнопок ("Буду смотреть", "Меню действий") на Кинопоиске и после названия фильма на IMDb
// @author       User
// @match        https://www.kinopoisk.ru/*
// @match        https://kinopoisk.ru/*
// @match        https://www.imdb.com/*
// @match        https://imdb.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const BUTTON_ID = 'rutracker-search-btn';
    const WRAPPER_ID = 'rutracker-kp-button-wrapper';
    const STYLE_ID = 'rutracker-search-btn-style';

    function injectStyles() {
        const style = document.getElementById(STYLE_ID) || document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${BUTTON_ID}.imdb-inline-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-left: 12px;
                padding: 5px 11px;
                font-size: 13px;
                font-weight: 600;
                line-height: 1.2;
                white-space: nowrap;
                flex-shrink: 0;
                color: #ffffff;
                background-color: #0b66c3;
                border: 1px solid rgba(255, 255, 255, 0.18);
                border-radius: 6px;
                text-decoration: none;
                vertical-align: middle;
                cursor: pointer;
                transition: background-color 0.15s ease, transform 0.1s ease;
                z-index: 10;
            }
            #${BUTTON_ID}.imdb-inline-btn:hover {
                background-color: #084f99;
                color: #ffffff;
            }
            #${BUTTON_ID}.kp-action-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                white-space: nowrap;
                text-decoration: none;
                cursor: pointer;
                box-sizing: border-box;
                transition: opacity 0.15s ease, transform 0.1s ease;
            }
            #${BUTTON_ID}.kp-action-link:hover {
                opacity: 0.9;
            }
            #${BUTTON_ID}:active {
                transform: scale(0.98);
            }
        `;
        if (!style.parentNode) {
            document.head.appendChild(style);
        }
    }

    function buildRutrackerUrl(query) {
        return `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent((query || '').trim())}`;
    }

    function createSearchButton(query) {
        const link = document.createElement('a');
        link.id = BUTTON_ID;
        link.href = buildRutrackerUrl(query);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = `Искать на RuTracker: ${query}`;
        link.textContent = 'RuTracker';
        return link;
    }

    function cleanTitle(raw) {
        return (raw || '')
            .replace(/\s*\(?\b(19\d{2}|20\d{2})\b.*?—\s*Кинопоиск.*$/i, '')
            .replace(/\s*—\s*Кинопоиск.*$/i, '')
            .replace(/\s*\|\s*Кинопоиск.*$/i, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function extractKinopoiskTitleAndYear() {
        const heading =
            document.querySelector('h1[data-tid="75209b8"]') ||
            document.querySelector('[class*="title"] h1') ||
            document.querySelector('h1');

        let title = '';
        if (heading) {
            const clone = heading.cloneNode(true);
            clone.querySelectorAll('span[class*="age"], button, svg, [class*="badge"], [class*="rating"]').forEach((el) => el.remove());
            title = cleanTitle(clone.textContent);
        }

        if (!title) {
            const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
            title = cleanTitle(ogTitle);
        }

        if (!title) {
            title = cleanTitle(document.title);
        }

        let year = '';
        const yearMatchFromTitle = title.match(/\((\d{4})\)\s*$/);
        if (yearMatchFromTitle) {
            year = yearMatchFromTitle[1];
        } else {
            const yearLink =
                document.querySelector('a[href*="/lists/m_act%5Byear%5D"]') ||
                document.querySelector('[class*="year"] a, [class*="year"] span');
            const yearMatch = yearLink?.textContent?.match(/\b(19\d{2}|20\d{2})\b/);
            if (yearMatch) {
                year = yearMatch[1];
            } else {
                const docTitleYear = document.title.match(/\((\d{4})\)/);
                if (docTitleYear) {
                    year = docTitleYear[1];
                }
            }
        }

        const query = title
            ? (year && !title.includes(`(${year})`) ? `${title} (${year})` : title)
            : '';

        return query;
    }

    function elementMatchesAny(el, keywords) {
        if (!el) return false;
        const ownText = [
            el.getAttribute('aria-label'),
            el.getAttribute('title'),
            el.textContent
        ]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

        if (keywords.some((kw) => ownText.includes(kw))) {
            return true;
        }

        return Array.from(el.querySelectorAll('[aria-label], [title]')).some((child) => {
            const childText = [child.getAttribute('aria-label'), child.getAttribute('title')]
                .filter(Boolean)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();
            return keywords.some((kw) => childText.includes(kw));
        });
    }

    function findKinopoiskActionRow() {
        const buttonsContainer =
            document.querySelector('.styles_buttonsContainer__Kcrch') ||
            document.querySelector('[class*="buttonsContainer"]') ||
            document.body;

        const slotWrappers = Array.from(buttonsContainer.querySelectorAll('.styles_button__bW_ew, [class*="styles_button__"]'));
        let watchSlot = null;
        let menuSlot = null;
        let watchBtn = null;
        let menuBtn = null;

        for (const slot of slotWrappers) {
            const btn = slot.querySelector('button, [role="button"], a') || slot;
            if (!watchBtn && elementMatchesAny(btn, ['буду смотреть', 'watchlist'])) {
                watchBtn = btn;
                watchSlot = slot;
            }
            if (!menuBtn && elementMatchesAny(btn, ['меню действий', 'more actions'])) {
                menuBtn = btn;
                menuSlot = slot;
            }
        }

        if (!watchBtn || !menuBtn) {
            const fallbackButtons = Array.from(buttonsContainer.querySelectorAll('button, [role="button"]'));
            if (!watchBtn) {
                watchBtn = fallbackButtons.find((el) => elementMatchesAny(el, ['буду смотреть', 'watchlist'])) || null;
                watchSlot = watchBtn?.closest('[class*="styles_button__"]') || watchBtn?.parentElement || null;
            }
            if (!menuBtn) {
                menuBtn = fallbackButtons.find((el) => elementMatchesAny(el, ['меню действий', 'more actions'])) || null;
                menuSlot = menuBtn?.closest('[class*="styles_button__"]') || menuBtn?.parentElement || null;
            }
        }

        return {
            buttonsContainer,
            watchSlot,
            menuSlot,
            watchBtn,
            menuBtn
        };
    }

    function applyKinopoiskClassesAndStyle(link, refBtn) {
        link.removeAttribute('style');
        link.className = 'kp-action-link';

        if (refBtn && refBtn.className) {
            const kpClasses = refBtn.className
                .split(/\s+/)
                .filter((cls) => cls && !cls.includes('onlyIcon') && !cls.includes('withIconLeft'));
            link.classList.add(...kpClasses);
        }

        if (refBtn) {
            const cs = window.getComputedStyle(refBtn);
            link.style.height = cs.height;
            link.style.minHeight = cs.minHeight;
            link.style.backgroundColor = cs.backgroundColor;
            link.style.color = cs.color;
            link.style.borderRadius = cs.borderRadius;
            link.style.borderWidth = cs.borderWidth;
            link.style.borderStyle = cs.borderStyle;
            link.style.borderColor = cs.borderColor;
            link.style.fontFamily = cs.fontFamily;
            link.style.fontSize = cs.fontSize;
            link.style.fontWeight = cs.fontWeight;
            link.style.lineHeight = cs.lineHeight;
            link.style.paddingLeft = '20px';
            link.style.paddingRight = '20px';
            link.style.width = 'auto';
        }
    }

    function getKinopoiskTarget() {
        if (!/^\/(film|series)\/\d+/.test(window.location.pathname)) {
            return null;
        }

        const row = findKinopoiskActionRow();
        if (!row.watchBtn && !row.menuBtn) {
            return null;
        }

        const query = extractKinopoiskTitleAndYear();
        return { query, isKinopoisk: true, row };
    }

    function getImdbTarget() {
        if (!/^\/title\/tt\d+/.test(window.location.pathname)) {
            return null;
        }

        const heading =
            document.querySelector('[data-testid="hero__primary-text"]') ||
            document.querySelector('h1[data-testid="hero-title-block__title"]') ||
            document.querySelector('h1');

        if (!heading) return null;

        const title = (heading.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title) return null;

        let year = '';
        const heroSection = heading.closest('section') || document;
        const yearCandidates = heroSection.querySelectorAll('a[href*="releaseinfo"], ul li a, ul li span');
        for (const el of yearCandidates) {
            const text = (el.textContent || '').trim();
            const match = text.match(/^(19\d{2}|20\d{2})$/);
            if (match) {
                year = match[1];
                break;
            }
        }

        const query = year && !title.includes(`(${year})`)
            ? `${title} (${year})`
            : title;

        return { anchorEl: heading, query, isKinopoisk: false };
    }

    function placeButton(target, btn) {
        if (target.isKinopoisk) {
            const { buttonsContainer, menuSlot, watchSlot, menuBtn, watchBtn } = target.row;
            const refSlot = menuSlot || watchSlot;
            const refBtn = menuBtn || watchBtn;

            let wrapper = document.getElementById(WRAPPER_ID);
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.id = WRAPPER_ID;
            }

            wrapper.className = refSlot?.className || 'styles_button__bW_ew';

            applyKinopoiskClassesAndStyle(btn, refBtn);

            if (btn.parentElement !== wrapper) {
                wrapper.appendChild(btn);
            }

            if (refSlot && refSlot.parentElement) {
                if (refSlot.nextElementSibling !== wrapper) {
                    refSlot.insertAdjacentElement('afterend', wrapper);
                }
            } else if (buttonsContainer && wrapper.parentElement !== buttonsContainer) {
                buttonsContainer.appendChild(wrapper);
            }
        } else {
            const oldWrapper = document.getElementById(WRAPPER_ID);
            if (oldWrapper) oldWrapper.remove();

            btn.removeAttribute('style');
            btn.className = 'imdb-inline-btn';
            if (btn.previousElementSibling !== target.anchorEl) {
                target.anchorEl.insertAdjacentElement('afterend', btn);
            }
        }
    }

    function updateButton() {
        injectStyles();

        const host = window.location.hostname;
        const target = host.includes('kinopoisk.ru')
            ? getKinopoiskTarget()
            : host.includes('imdb.com')
                ? getImdbTarget()
                : null;

        const existingBtn = document.getElementById(BUTTON_ID);

        if (!target) {
            if (existingBtn) existingBtn.remove();
            const oldWrapper = document.getElementById(WRAPPER_ID);
            if (oldWrapper) oldWrapper.remove();
            return;
        }

        const newHref = buildRutrackerUrl(target.query);
        const btn = existingBtn || createSearchButton(target.query);
        btn.href = newHref;
        btn.title = target.query ? `Искать на RuTracker: ${target.query}` : 'Искать на RuTracker';

        placeButton(target, btn);
    }

    let debounceTimer = null;
    const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateButton, 150);
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

    window.addEventListener('popstate', updateButton);
    updateButton();
})();