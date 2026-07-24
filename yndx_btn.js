// ==UserScript==
// @name         Google to Yandex Search Button (Absolute Position)
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Adds a Yandex button on the right without changing the original search bar length
// @author       You
// @match        https://www.google.com/search*
// @match        https://www.google.ru/search*
// @grant        GM_openInTab
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function addYandexButton() {
        // Prevent duplicate creation
        if (document.getElementById('yandex-search-btn')) return;

        // 1. Find the input field
        const searchInput = document.querySelector('input[name="q"], textarea[name="q"]');
        if (!searchInput) return;

        // 2. Find the search form
        const searchForm = searchInput.closest('form[role="search"]') || searchInput.closest('form');
        if (!searchForm) return;

        // 3. Find the first div inside the form (capsule container)
        const searchCapsuleContainer = searchForm.querySelector('div');
        if (!searchCapsuleContainer) return;

        // Create the button
        const yaBtn = document.createElement('button');
        yaBtn.id = 'yandex-search-btn';
        yaBtn.type = 'button';
        yaBtn.innerText = 'Я';
        yaBtn.setAttribute('aria-label', 'Search in Yandex');

        // Styling: yellow circle, black letter, absolute positioning outside to the right
        yaBtn.style.cssText = `
            position: absolute !important;
            right: -58px !important; /* Move the button outside the right edge of the form */
            top: 50% !important;
            transform: translateY(-50%) !important; /* Center vertically */

            width: 44px !important;
            height: 44px !important;
            background-color: #ffcc00 !important;
            color: #000000 !important;
            border: none !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999 !important;
            padding: 0 !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;

            /* Font settings */
            font-family: Arial, sans-serif !important;
            font-size: 20px !important;
            font-weight: bold !important;

            transition: transform 0.1s, background-color 0.15s;
        `;

        // Hover and click effects
        yaBtn.onmouseover = () => yaBtn.style.backgroundColor = '#e6b800 !important';
        yaBtn.onmouseout = () => yaBtn.style.backgroundColor = '#ffcc00 !important';

        // Combine vertical centering with a slight shrink effect on click
        yaBtn.onmousedown = () => yaBtn.style.transform = 'translateY(-50%) scale(0.93)';
        yaBtn.onmouseup = () => yaBtn.style.transform = 'translateY(-50%) scale(1)';

        // Click logic
        yaBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const query = encodeURIComponent(searchInput.value);
            if (query) {
                GM_openInTab(`https://yandex.ru/search/?text=${query}`, { active: true, insert: true });
            }
        };

        // Ensure the form serves as the reference point for absolute button positioning
        searchForm.style.position = 'relative';

        // Append the button into the form (due to position: absolute it visually moves outside to the right)
        searchForm.appendChild(yaBtn);
    }

    // DOM Mutation Observer
    const observer = new MutationObserver(() => {
        addYandexButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial run
    addYandexButton();
})();
