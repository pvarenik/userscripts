// ==UserScript==
// @name         YouTube Logo to Subscriptions
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Changes YouTube logo link to Subscriptions page
// @author       You
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    function changeLogoLink() {
        // Find the link matching the topbar logo structure
        const logoLink = document.querySelector('ytd-topbar-logo-renderer a#logo');
        if (logoLink) {
            const currentHref = logoLink.getAttribute('href');
            if (currentHref && currentHref !== '/feed/subscriptions') {
                logoLink.setAttribute('href', '/feed/subscriptions');
                logoLink.setAttribute('title', 'YouTube Subscriptions');
            }
        }
    }

    // YouTube is a Single Page Application (SPA), so elements are redrawn dynamically.
    // MutationObserver is the most reliable way to monitor page changes efficiently.
    const observer = new MutationObserver((mutations) => {
        changeLogoLink();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // Initial run
    changeLogoLink();
})();
