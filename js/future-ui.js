(function () {
    'use strict';

    var SPOTLIGHT_SELECTORS = '.hero, .page-hero, .blog-index-masthead, .blog-article-hero, .hero-banner';
    var TILT_SELECTORS =
        '.game-card, .feature-card, .stat-card, .trust-card, .step-card, .live-cat-card, .cat-tile, .blog-card, .blog-related-card, .feature-card, .blog-sidebar-card, .listicle > li';
    var REVEAL_SELECTORS =
        '.game-card, .stat-card, .feature-card, .trust-card, .step-card, .live-cat-card, .cat-tile, .blog-card, .blog-related-card, .faq details, .listicle > li, .cta-strip, .promo-affiliate, .facts-table-wrap, .info-visual';
    var STAGGER_GRIDS =
        '.game-grid, .feature-grid, .trust-grid, .steps, .facts-stats, .live-cat-grid, .cat-grid, .blog-posts-grid, .blog-related-list, .listicle, .chip-row';

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function canHoverFine() {
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
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

    function markBound(el, key) {
        el.setAttribute('data-future-' + key, '1');
    }

    function isBound(el, key) {
        return el.getAttribute('data-future-' + key) === '1';
    }

    function initScrollProgress() {
        if (document.querySelector('.scroll-progress')) return;
        var bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.prepend(bar);
        document.body.classList.add('future-ui-ready');

        function update() {
            var doc = document.documentElement;
            var scrollTop = window.scrollY || doc.scrollTop || 0;
            var max = Math.max(doc.scrollHeight - window.innerHeight, 1);
            document.body.style.setProperty('--scroll-progress', String(Math.min(Math.max(scrollTop / max, 0), 1)));
        }

        window.addEventListener('scroll', throttle(update, 16), { passive: true });
        update();
    }

    function initHeaderScroll() {
        var header = document.querySelector('.site-header');
        if (!header || isBound(header, 'header')) return;
        markBound(header, 'header');

        function update() {
            var y = window.scrollY || document.documentElement.scrollTop || 0;
            header.classList.toggle('is-scrolled', y > 24);
        }

        window.addEventListener('scroll', throttle(update, 80), { passive: true });
        update();
    }

    function bindSpotlight(zone) {
        if (isBound(zone, 'spotlight')) return;
        markBound(zone, 'spotlight');
        zone.classList.add('spotlight-zone');

        if (!zone.querySelector('.hero__scanline')) {
            var scan = document.createElement('div');
            scan.className = 'hero__scanline';
            scan.setAttribute('aria-hidden', 'true');
            zone.insertBefore(scan, zone.firstChild);
        }

        zone.addEventListener('mousemove', function (e) {
            var r = zone.getBoundingClientRect();
            var x = ((e.clientX - r.left) / r.width) * 100;
            var y = ((e.clientY - r.top) / r.height) * 100;
            zone.style.setProperty('--spot-x', x.toFixed(1) + '%');
            zone.style.setProperty('--spot-y', y.toFixed(1) + '%');
        });
    }

    function initSpotlightZones() {
        if (prefersReducedMotion() || !canHoverFine()) return;
        document.querySelectorAll(SPOTLIGHT_SELECTORS).forEach(bindSpotlight);
    }

    function bindTilt(card) {
        if (isBound(card, 'tilt') || !canHoverFine() || prefersReducedMotion()) return;
        markBound(card, 'tilt');

        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - 0.5;
            var py = (e.clientY - r.top) / r.height - 0.5;
            var lift = card.classList.contains('cat-tile') ? 3 : 4;
            var tilt = card.classList.contains('cat-tile') ? 4 : 6;
            card.style.transform =
                'perspective(720px) rotateX(' +
                (-py * tilt).toFixed(2) +
                'deg) rotateY(' +
                (px * tilt).toFixed(2) +
                'deg) translateY(-' +
                lift +
                'px)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    }

    function initTiltCards() {
        if (prefersReducedMotion() || !canHoverFine()) return;
        document.querySelectorAll(TILT_SELECTORS).forEach(bindTilt);
    }

    function initStaggerReveal() {
        if (prefersReducedMotion()) return;
        document.querySelectorAll(STAGGER_GRIDS).forEach(function (grid) {
            if (isBound(grid, 'stagger')) return;
            markBound(grid, 'stagger');
            Array.prototype.forEach.call(grid.children, function (el, i) {
                el.style.transitionDelay = Math.min(i * 0.07, 0.49) + 's';
            });
        });
    }

    var revealObserver;

    function initRevealItems() {
        document.body.classList.add('js-future-ui');
        var nodes = document.querySelectorAll(REVEAL_SELECTORS);
        nodes.forEach(function (el) {
            if (!el.classList.contains('future-reveal')) {
                el.classList.add('future-reveal');
            }
        });

        if (prefersReducedMotion()) {
            document.querySelectorAll('.future-reveal').forEach(function (el) {
                el.classList.add('is-in');
            });
            return;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-in');
                            revealObserver.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
            );
        }

        document.querySelectorAll('.future-reveal:not(.is-in)').forEach(function (el) {
            if (!isBound(el, 'reveal-obs')) {
                markBound(el, 'reveal-obs');
                revealObserver.observe(el);
            }
        });
    }

    function parseStatTarget(text) {
        var raw = String(text || '').trim();
        var dataCount = raw;
        if (!raw) return null;
        var mPlus = raw.match(/^(\d+)\+$/);
        if (mPlus) return { end: parseInt(mPlus[1], 10), suffix: '+' };
        var mRange = raw.match(/^(\d+)[–-](\d+)\+?$/);
        if (mRange) return { end: parseInt(mRange[1], 10), suffix: '–' + mRange[2] + '+' };
        var mPlain = raw.match(/^(\d+)$/);
        if (mPlain) return { end: parseInt(mPlain[1], 10), suffix: '' };
        return null;
    }

    function animateStat(el, target, suffix, duration) {
        var start = 0;
        var startTime = null;

        function frame(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = Math.round(start + (target - start) * eased);
            el.textContent = val + suffix;
            if (p < 1) {
                window.requestAnimationFrame(frame);
            } else {
                el.classList.add('is-counted');
            }
        }

        window.requestAnimationFrame(frame);
    }

    function initStatCounters() {
        if (prefersReducedMotion()) return;

        document.querySelectorAll('.stat-card__value').forEach(function (el) {
            if (isBound(el, 'counter')) return;

            var target = null;
            var suffix = el.getAttribute('data-count-suffix') || '';

            if (el.hasAttribute('data-count')) {
                target = parseInt(el.getAttribute('data-count'), 10);
                suffix = el.getAttribute('data-count-suffix') || suffix;
            } else {
                var parsed = parseStatTarget(el.textContent);
                if (parsed) {
                    target = parsed.end;
                    suffix = parsed.suffix;
                }
            }

            if (target === null || isNaN(target)) {
                el.classList.add('stat-card__value--text');
                return;
            }

            markBound(el, 'counter');
            var finalSuffix = suffix;
            var observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            el.textContent = '0' + finalSuffix;
                            animateStat(el, target, finalSuffix, 1400);
                            observer.disconnect();
                        }
                    });
                },
                { threshold: 0.4 }
            );
            observer.observe(el.closest('.stat-card') || el);
        });
    }

    function bindMagnetic(btn) {
        if (isBound(btn, 'magnetic') || !canHoverFine() || prefersReducedMotion()) return;
        markBound(btn, 'magnetic');
        btn.classList.add('btn--magnetic');

        btn.addEventListener('mousemove', function (e) {
            var r = btn.getBoundingClientRect();
            var x = (e.clientX - r.left - r.width / 2) * 0.12;
            var y = (e.clientY - r.top - r.height / 2) * 0.12;
            btn.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.transform = '';
        });
    }

    function initMagneticButtons() {
        document
            .querySelectorAll('.btn--primary, .nav__link--cta, .mm__link--cta, .btn--gold')
            .forEach(bindMagnetic);
    }

    function initPageEnter() {
        document.body.classList.add('page-enter');
        window.setTimeout(function () {
            document.body.classList.add('page-enter--done');
        }, 650);
    }

    function initTableGlow() {
        document.querySelectorAll('.facts-table tbody tr').forEach(function (row) {
            if (!isBound(row, 'row')) {
                markBound(row, 'row');
                row.classList.add('facts-table__row--fx');
            }
        });
    }

    var ROLLING_HEADING_SELECTORS =
        '.hero__h1, .page-hero h1, .hero__title, .blog-index-masthead h1, .section__title, .info-visual__title, main .prose h2';

    var rollObserver;

    function decodeEntities(str) {
        var el = document.createElement('textarea');
        el.innerHTML = str;
        return el.value;
    }

    function getHeadingSource(el) {
        var hidden = el.querySelector('.visually-hidden');
        if (hidden && hidden.textContent.trim()) return hidden.textContent.trim();

        var typewriter = el.querySelector('[data-typewriter]');
        if (typewriter) {
            var raw = typewriter.getAttribute('data-typewriter');
            if (raw) return decodeEntities(raw).trim();
        }

        return el.textContent.replace(/\s+/g, ' ').trim();
    }

    function buildRollingHeading(el, text, mode) {
        el.textContent = '';
        el.classList.add('roll-text', mode === 'char' ? 'roll-text--chars' : 'roll-text--words');

        var units = mode === 'char' ? text.split('') : text.split(/\s+/).filter(Boolean);
        var delayIndex = 0;

        units.forEach(function (unit, idx) {
            if (mode === 'char' && unit === ' ') {
                el.appendChild(document.createTextNode(' '));
                return;
            }

            if (mode === 'words' && idx > 0) {
                el.appendChild(document.createTextNode(' '));
            }

            var wrap = document.createElement('span');
            wrap.className = 'roll-text__unit';
            wrap.style.setProperty('--i', String(delayIndex));
            delayIndex += 1;

            var slice = document.createElement('span');
            slice.className = 'roll-text__slice';
            slice.textContent = unit;
            wrap.appendChild(slice);
            el.appendChild(wrap);
        });
    }

    function playRollingHeading(el) {
        el.classList.add('is-in');
    }

    function bindRollingHeading(el) {
        if (isBound(el, 'roll')) return;

        var text = getHeadingSource(el);
        if (!text) return;

        markBound(el, 'roll');

        var mode =
            el.classList.contains('hero__h1') ||
            el.classList.contains('hero__title') ||
            el.closest('.page-hero') ||
            el.closest('.blog-index-masthead')
                ? 'char'
                : 'word';

        buildRollingHeading(el, text, mode);

        if (prefersReducedMotion()) {
            playRollingHeading(el);
            return;
        }

        var instant =
            el.classList.contains('hero__h1') ||
            el.closest('.page-hero') ||
            el.closest('.blog-index-masthead') ||
            el.classList.contains('hero__title');

        if (instant) {
            window.requestAnimationFrame(function () {
                playRollingHeading(el);
            });
            return;
        }

        if (!rollObserver) {
            rollObserver = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            playRollingHeading(entry.target);
                            rollObserver.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
            );
        }

        rollObserver.observe(el);
    }

    function initRollingHeadings() {
        document.querySelectorAll(ROLLING_HEADING_SELECTORS).forEach(bindRollingHeading);
    }

    function refreshDynamic() {
        initSpotlightZones();
        initTiltCards();
        initStaggerReveal();
        initRevealItems();
        initStatCounters();
        initMagneticButtons();
        initTableGlow();
        initRollingHeadings();
    }

    function run() {
        initPageEnter();
        initScrollProgress();
        initHeaderScroll();
        refreshDynamic();
    }

    window.addEventListener('future-ui:refresh', refreshDynamic);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
