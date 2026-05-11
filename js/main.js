(function () {
    'use strict';

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function initAnchorLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            var id = a.getAttribute('href');
            if (!id || id === '#') return;
            a.addEventListener('click', function (e) {
                var t = document.querySelector(id);
                if (t) {
                    e.preventDefault();
                    t.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
                }
            });
        });
    }

    function finalizeTypewriter(el) {
        el.classList.add('is-done');
        var t = el.textContent;
        if (/\bone\b/.test(t)) {
            el.innerHTML = t.replace(/\bone\b/, '<em>one</em>');
        }
    }

    function initTypewriter() {
        document.querySelectorAll('[data-typewriter]').forEach(function (el) {
            var raw = el.getAttribute('data-typewriter');
            if (!raw) return;
            var full = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            if (prefersReducedMotion()) {
                el.textContent = full;
                finalizeTypewriter(el);
                return;
            }
            el.textContent = '';
            el.setAttribute('aria-busy', 'true');
            var i = 0;
            var delay = 28;
            var startAfter = 380;

            function tick() {
                i += 1;
                if (i <= full.length) {
                    el.textContent = full.slice(0, i);
                    window.setTimeout(tick, delay);
                } else {
                    el.removeAttribute('aria-busy');
                    finalizeTypewriter(el);
                }
            }

            window.setTimeout(tick, startAfter);
        });
    }

    function initScrollReveal() {
        var sections = document.querySelectorAll('main section.section');
        sections.forEach(function (s) {
            s.classList.add('fade-reveal');
        });
        if (prefersReducedMotion()) {
            sections.forEach(function (s) {
                s.classList.add('is-visible');
            });
            return;
        }

        var vh = window.innerHeight || document.documentElement.clientHeight;
        sections.forEach(function (s) {
            var r = s.getBoundingClientRect();
            if (r.top < vh * 0.94 && r.bottom > vh * 0.06) {
                s.classList.add('is-visible');
            }
        });

        document.body.classList.add('js-motion');

        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { rootMargin: '0px 0px -7% 0px', threshold: 0.06 }
        );

        sections.forEach(function (s) {
            io.observe(s);
        });
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

    function initScrollToTop() {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scroll-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.setAttribute('aria-hidden', 'true');
        btn.innerHTML =
            '<svg class="scroll-top__icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
            'd="M12 17V8m0 0l-4.25 4.25M12 8l4.25 4.25"/></svg>';
        document.body.appendChild(btn);

        var thresholdPx = 320;

        function updateVisibility() {
            var y = window.scrollY || document.documentElement.scrollTop || 0;
            var show = y > thresholdPx;
            btn.classList.toggle('is-visible', show);
            btn.setAttribute('aria-hidden', show ? 'false' : 'true');
        }

        window.addEventListener('scroll', throttle(updateVisibility, 120), { passive: true });
        updateVisibility();

        btn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            });
        });
    }

    function run() {
        initAnchorLinks();
        initTypewriter();
        initScrollReveal();
        initScrollToTop();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
})();
