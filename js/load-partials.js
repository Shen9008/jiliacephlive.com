/**
 * JiliAce PH Live — load header/footer; SVG sprite; active nav from body[data-page].
 */
(function () {
    'use strict';

    var base = '';

    function rewriteLinks(html) {
        return html;
    }

    function setActiveNav() {
        var page = document.body.getAttribute('data-page') || '';
        if (!page) return;
        document.querySelectorAll('.nav__link[data-nav="' + page + '"], .mm__link[data-nav="' + page + '"]').forEach(function (el) {
            el.classList.add('is-active');
            el.setAttribute('aria-current', 'page');
        });
    }

    function injectSvgSprite() {
        if (document.getElementById('svg-sprite')) return;
        var wrap = document.createElement('div');
        wrap.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" id="svg-sprite" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' +
            '<defs>' +
            '<symbol id="i-slots" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h2v4H8v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4z"/></symbol>' +
            '<symbol id="i-live" viewBox="0 0 24 24"><path fill="currentColor" d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></symbol>' +
            '<symbol id="i-gift" viewBox="0 0 24 24"><path fill="currentColor" d="M20 6h-2.18c.11-.31.18-.65.18-1a2 2 0 0 0-2-2c-1.66 0-3 1.34-3 3H9c0-1.66-1.34-3-3-3a2 2 0 0 0-2 2c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1H9V5h6zM4 8h16v3H4V8zm0 5h16v6H4v-6z"/></symbol>' +
            '<symbol id="i-shield" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></symbol>' +
            '<symbol id="i-mobile" viewBox="0 0 24 24"><path fill="currentColor" d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z"/></symbol>' +
            '<symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></symbol>' +
            '<symbol id="i-check" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></symbol>' +
            '<symbol id="i-home" viewBox="0 0 24 24"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></symbol>' +
            '<symbol id="i-menu" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></symbol>' +
            '<symbol id="i-close" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></symbol>' +
            '<symbol id="i-bolt" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></symbol>' +
            '<symbol id="i-chart" viewBox="0 0 24 24"><path fill="currentColor" d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.07-4-4L2 16.99z"/></symbol>' +
            '<symbol id="i-chat" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></symbol>' +
            '<symbol id="i-wallet" viewBox="0 0 24 24"><path fill="currentColor" d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h9V8h-9v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></symbol>' +
            '</defs></svg>';
        document.body.insertBefore(wrap.firstChild, document.body.firstChild);
    }

    function run() {
        injectSvgSprite();
        Promise.all([
            fetch(base + 'partials/header.html').then(function (r) { return r.text(); }),
            fetch(base + 'partials/footer.html').then(function (r) { return r.text(); }),
            fetch(base + 'partials/hero-banner.html').then(function (r) { return r.ok ? r.text() : ''; })
        ])
            .then(function (parts) {
                var h = rewriteLinks(parts[0]);
                var f = rewriteLinks(parts[1]);
                var bannerHtml = parts[2] ? rewriteLinks(parts[2]) : '';
                var ph = document.getElementById('partial-header');
                var pf = document.getElementById('partial-footer');
                var pb = document.getElementById('partial-hero-banner');
                if (ph) {
                    var t = document.createElement('div');
                    t.innerHTML = h;
                    var p = ph.parentNode;
                    while (t.firstChild) p.insertBefore(t.firstChild, ph);
                    ph.remove();
                }
                if (pf) pf.outerHTML = f;
                if (pb && bannerHtml) pb.outerHTML = bannerHtml;
                setActiveNav();
                var btn = document.querySelector('[data-mobile-toggle]');
                var panel = document.getElementById('mobile-menu');
                var use = btn && btn.querySelector('use');
                if (btn && panel) {
                    btn.addEventListener('click', function () {
                        var open = panel.classList.toggle('is-open');
                        panel.setAttribute('aria-hidden', open ? 'false' : 'true');
                        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
                        if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
                    });
                }
            })
            .catch(function () {
                setActiveNav();
            });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
})();
