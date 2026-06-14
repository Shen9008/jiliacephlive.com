(function () {
    'use strict';

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function throttle(fn, waitMs) {
        var last = 0;
        return function () {
            var now = Date.now();
            if (now - last >= waitMs) {
                last = now;
                fn.apply(null, arguments);
            }
        };
    }

    function initScrollProgress() {
        var bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.prepend(bar);
        document.body.classList.add('future-ui-ready');

        function update() {
            var doc = document.documentElement;
            var scrollTop = window.scrollY || doc.scrollTop || 0;
            var max = Math.max(doc.scrollHeight - window.innerHeight, 1);
            var p = Math.min(Math.max(scrollTop / max, 0), 1);
            document.body.style.setProperty('--scroll-progress', String(p));
        }

        window.addEventListener('scroll', throttle(update, 16), { passive: true });
        update();
    }

    function initHeaderScroll() {
        var header = document.querySelector('.site-header');
        if (!header) return;

        function update() {
            var y = window.scrollY || document.documentElement.scrollTop || 0;
            header.classList.toggle('is-scrolled', y > 24);
        }

        window.addEventListener('scroll', throttle(update, 80), { passive: true });
        update();
    }

    function initHeroSpotlight() {
        if (prefersReducedMotion()) return;
        var hero = document.querySelector('.hero');
        if (!hero || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        hero.setAttribute('data-spotlight', 'true');

        var scan = document.createElement('div');
        scan.className = 'hero__scanline';
        scan.setAttribute('aria-hidden', 'true');
        hero.insertBefore(scan, hero.firstChild);

        hero.addEventListener('mousemove', function (e) {
            var r = hero.getBoundingClientRect();
            var x = ((e.clientX - r.left) / r.width) * 100;
            var y = ((e.clientY - r.top) / r.height) * 100;
            hero.style.setProperty('--spot-x', x.toFixed(1) + '%');
            hero.style.setProperty('--spot-y', y.toFixed(1) + '%');
        });
    }

    function initTiltCards() {
        if (prefersReducedMotion()) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        var cards = document.querySelectorAll('.game-card, .feature-card, .stat-card, .trust-card, .step-card');
        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - 0.5;
                var py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform =
                    'perspective(720px) rotateX(' + (-py * 6).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg) translateY(-4px)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    function initStaggerReveal() {
        if (prefersReducedMotion()) return;
        var grids = document.querySelectorAll('.game-grid, .feature-grid, .trust-grid, .steps, .facts-stats');
        grids.forEach(function (grid) {
            var items = grid.children;
            Array.prototype.forEach.call(items, function (el, i) {
                el.style.transitionDelay = Math.min(i * 0.06, 0.42) + 's';
            });
        });
    }

    function run() {
        initScrollProgress();
        initHeaderScroll();
        initHeroSpotlight();
        initTiltCards();
        initStaggerReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
