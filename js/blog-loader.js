/**
 * Blog listing: loads assets/data/blogs.json, sorts like content-sync, client-side pagination (?page=).
 */
(function () {
    'use strict';

    var PAGE_SIZE = 6;
    var MAX_PAGE = 99;
    var DATA_URL = '/assets/data/blogs.json';
    var DEFAULT_BLOG_IMAGE = '/images/blog-default.png';

    function sortBlogsByLatestSyncFirst(a, b) {
        var sa = new Date(b.synced_at || 0).getTime() - new Date(a.synced_at || 0).getTime();
        if (sa !== 0) return sa;
        var cu = new Date(b.cms_updated_at || 0).getTime() - new Date(a.cms_updated_at || 0).getTime();
        if (cu !== 0) return cu;
        var pd = new Date(b.published_date || 0).getTime() - new Date(a.published_date || 0).getTime();
        if (pd !== 0) return pd;
        return String(a.slug || '').localeCompare(String(b.slug || ''));
    }

    function clamp(n, lo, hi) {
        return Math.min(Math.max(n, lo), hi);
    }

    function escapeHtml(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** Compact numbered pager with ellipses (steps.md section 8). */
    function pageSequence(total, current) {
        if (total <= 7) {
            var a = [];
            for (var i = 1; i <= total; i++) a.push(i);
            return a;
        }
        var pages = new Set([1, total, current, current - 1, current + 1]);
        if (current <= 3) {
            pages.add(2);
            pages.add(3);
            pages.add(4);
        }
        if (current >= total - 2) {
            pages.add(total - 3);
            pages.add(total - 2);
            pages.add(total - 1);
        }
        var sorted = [];
        pages.forEach(function (p) {
            if (p >= 1 && p <= total) sorted.push(p);
        });
        sorted.sort(function (x, y) { return x - y; });
        var out = [];
        for (var j = 0; j < sorted.length; j++) {
            if (j > 0 && sorted[j] - sorted[j - 1] > 1) out.push('…');
            out.push(sorted[j]);
        }
        return out;
    }

    function renderGrid(gridEl, posts) {
        gridEl.innerHTML = '';
        if (!posts.length) {
            gridEl.innerHTML =
                '<p class="blog-empty">New guides are on the way. Check back soon, or browse <a href="/slots.html">slots</a>, <a href="/live-casino.html">live casino</a>, and <a href="/promotions.html">promotions</a> in the meantime.</p>';
            return;
        }
        posts.forEach(function (p) {
            var slug = escapeHtml(p.slug);
            var title = escapeHtml(p.title || slug);
            var excerpt = escapeHtml(p.excerpt || '');
            var cat = escapeHtml(p.category || '');
            var date = escapeHtml(p.published_date || '');
            var imgSrc = escapeHtml((p.featured_image || '').trim() || DEFAULT_BLOG_IMAGE);
            var card = document.createElement('article');
            card.className = 'blog-card';
            card.innerHTML =
                '<a class="blog-card__link" href="/blog/' + slug + '/">' +
                '<div class="blog-card__media">' +
                '<img class="blog-card__thumb" src="' + imgSrc + '" alt="' + title + '" loading="lazy" decoding="async">' +
                '</div>' +
                '<div class="blog-card__body">' +
                '<div class="blog-card__meta">' + cat + (cat && date ? ' · ' : '') + date + '</div>' +
                '<h2 class="blog-card__title">' + title + '</h2>' +
                '<p class="blog-card__excerpt">' + excerpt + '</p>' +
                '</div>' +
                '</a>';
            gridEl.appendChild(card);
        });
        window.dispatchEvent(new CustomEvent('future-ui:refresh'));
    }

    function renderPager(navEl, metaEl, totalPages, page) {
        navEl.innerHTML = '';
        metaEl.textContent = '';
        if (totalPages <= 1) {
            navEl.hidden = true;
            metaEl.hidden = true;
            return;
        }
        navEl.hidden = false;
        metaEl.hidden = false;

        function hrefFor(pg) {
            return pg === 1 ? '/blog/' : '/blog/?page=' + pg;
        }

        var prev = document.createElement('a');
        prev.className = 'blog-pagination__prev';
        prev.href = hrefFor(Math.max(1, page - 1));
        prev.textContent = 'Previous';
        if (page <= 1) {
            prev.classList.add('is-disabled');
            prev.removeAttribute('href');
            prev.setAttribute('aria-disabled', 'true');
        }
        navEl.appendChild(prev);

        var seq = pageSequence(totalPages, page);
        for (var i = 0; i < seq.length; i++) {
            var item = seq[i];
            if (item === '…') {
                var ell = document.createElement('span');
                ell.className = 'blog-pagination__ellipsis';
                ell.textContent = '…';
                ell.setAttribute('aria-hidden', 'true');
                navEl.appendChild(ell);
                continue;
            }
            var link = document.createElement('a');
            link.className = 'blog-pagination__num';
            link.href = hrefFor(item);
            link.textContent = String(item);
            if (item === page) {
                link.classList.add('is-current');
                link.setAttribute('aria-current', 'page');
            }
            navEl.appendChild(link);
        }

        var next = document.createElement('a');
        next.className = 'blog-pagination__next';
        next.href = hrefFor(Math.min(totalPages, page + 1));
        next.textContent = 'Next';
        if (page >= totalPages) {
            next.classList.add('is-disabled');
            next.removeAttribute('href');
            next.setAttribute('aria-disabled', 'true');
        }
        navEl.appendChild(next);

        metaEl.textContent = 'Page ' + page + ' of ' + totalPages;
    }

    function scrollToPosts() {
        var el = document.querySelector('.blog-posts-wrap');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateUrl(page, replace) {
        var url = page === 1 ? '/blog/' : '/blog/?page=' + page;
        if (replace) history.replaceState({ blogPage: page }, '', url);
        else history.pushState({ blogPage: page }, '', url);
    }

    function run() {
        var grid = document.getElementById('blog-posts-grid');
        var nav = document.getElementById('blog-pagination');
        var meta = document.getElementById('blog-pagination-meta');
        var truncated = document.getElementById('blog-pagination-truncated');
        if (!grid || !nav || !meta) return;

        var ctx = { capped: [], totalPages: 1, page: 1 };

        nav.addEventListener('click', function (e) {
            var a = e.target.closest('a');
            if (!a || !nav.contains(a)) return;
            if (a.classList.contains('is-disabled')) {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            var href = a.getAttribute('href') || '';
            var pg = 1;
            if (href.indexOf('page=') !== -1) {
                pg = parseInt(new URL(href, window.location.origin).searchParams.get('page') || '1', 10);
            }
            if (!pg || pg < 1) pg = 1;
            ctx.page = clamp(pg, 1, ctx.totalPages);
            updateUrl(ctx.page, false);
            var sliceNow = ctx.capped.slice((ctx.page - 1) * PAGE_SIZE, ctx.page * PAGE_SIZE);
            renderGrid(grid, sliceNow);
            renderPager(nav, meta, ctx.totalPages, ctx.page);
            scrollToPosts();
        });

        fetch(DATA_URL)
            .then(function (r) {
                if (!r.ok) throw new Error('blogs.json');
                return r.json();
            })
            .then(function (posts) {
                if (!Array.isArray(posts)) posts = [];
                posts.sort(sortBlogsByLatestSyncFirst);
                var maxListed = PAGE_SIZE * MAX_PAGE;
                var capped = posts.slice(0, maxListed);
                var totalPages = Math.max(1, Math.ceil(capped.length / PAGE_SIZE));
                var rawPage = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
                if (!rawPage || rawPage < 1) rawPage = 1;
                var page = clamp(rawPage, 1, totalPages);
                if (page !== rawPage) updateUrl(page, true);

                ctx.capped = capped;
                ctx.totalPages = totalPages;
                ctx.page = page;

                var slice = capped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
                grid.setAttribute('aria-busy', 'false');
                renderGrid(grid, slice);
                renderPager(nav, meta, totalPages, page);

                var overCap = posts.length > maxListed;
                if (truncated) {
                    if (overCap) {
                        truncated.hidden = false;
                        truncated.textContent =
                            'Showing the ' + maxListed + ' most recent posts on this page. Older articles are not listed here.';
                    } else {
                        truncated.hidden = true;
                    }
                }
            })
            .catch(function () {
                grid.innerHTML =
                    '<p class="blog-empty">We could not load the article list. Refresh the page in a moment, or continue from the <a href="/">home page</a>.</p>';
            });

        window.addEventListener('popstate', function () {
            location.reload();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
})();
