/**
 * Article page: recent posts + related posts from blogs.json (same sort as content-sync).
 */
(function () {
    'use strict';

    var DATA_URL = '/assets/data/blogs.json';
    var SIDEBAR_RECENT_LIMIT = 3;

    function sortBlogsByLatestSyncFirst(a, b) {
        var sa = new Date(b.synced_at || 0).getTime() - new Date(a.synced_at || 0).getTime();
        if (sa !== 0) return sa;
        var cu = new Date(b.cms_updated_at || 0).getTime() - new Date(a.cms_updated_at || 0).getTime();
        if (cu !== 0) return cu;
        var pd = new Date(b.published_date || 0).getTime() - new Date(a.published_date || 0).getTime();
        if (pd !== 0) return pd;
        return String(a.slug || '').localeCompare(String(b.slug || ''));
    }

    function escapeHtml(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function run() {
        var slug = document.body.getAttribute('data-blog-slug');
        var relatedRaw = document.body.getAttribute('data-related-slugs') || '';
        var sidebar = document.getElementById('sidebar-posts');
        var relatedSection = document.getElementById('related-posts');
        var relatedList = relatedSection ? relatedSection.querySelector('.blog-related-list') : null;
        var relatedPlaceholder = relatedSection ? relatedSection.querySelector('.blog-related-placeholder') : null;
        if (!slug || !sidebar) return;

        fetch(DATA_URL)
            .then(function (r) {
                if (!r.ok) throw new Error('blogs.json');
                return r.json();
            })
            .then(function (posts) {
                if (!Array.isArray(posts)) posts = [];
                posts.sort(sortBlogsByLatestSyncFirst);
                var bySlug = {};
                posts.forEach(function (p) {
                    if (p && p.slug) bySlug[p.slug] = p;
                });

                sidebar.innerHTML = '';
                var recent = posts.filter(function (p) {
                    return p.slug !== slug;
                }).slice(0, SIDEBAR_RECENT_LIMIT);
                if (!recent.length) {
                    sidebar.innerHTML = '<li class="blog-sidebar-placeholder">No other posts yet.</li>';
                } else {
                    recent.forEach(function (p) {
                        var title = escapeHtml(p.title || p.slug);
                        var li = document.createElement('li');
                        li.innerHTML =
                            '<a class="blog-sidebar-link" href="/blog/' +
                            encodeURIComponent(p.slug) +
                            '/">' +
                            '<span class="blog-sidebar-link__body">' +
                            '<span class="blog-sidebar-link__title">' +
                            title +
                            '</span>' +
                            '</span>' +
                            '</a>';
                        sidebar.appendChild(li);
                    });
                }

                var relatedSlugs = relatedRaw.split(',').map(function (s) {
                    return s.trim();
                }).filter(Boolean);
                var relatedPosts = relatedSlugs
                    .map(function (s) {
                        return bySlug[s];
                    })
                    .filter(Boolean)
                    .filter(function (p) {
                        return p.slug !== slug;
                    });

                if (relatedList && relatedPlaceholder) {
                    if (!relatedPosts.length) {
                        relatedPlaceholder.textContent = 'More guides are on the way.';
                        relatedPlaceholder.hidden = false;
                        relatedList.hidden = true;
                    } else {
                        relatedPlaceholder.hidden = true;
                        relatedList.hidden = false;
                        relatedList.innerHTML = '';
                        relatedPosts.forEach(function (p) {
                            var li = document.createElement('li');
                            li.innerHTML =
                                '<a class="blog-related-card" href="/blog/' +
                                encodeURIComponent(p.slug) +
                                '/">' +
                                '<span class="blog-related-card__title">' +
                                escapeHtml(p.title || p.slug) +
                                '</span>' +
                                '<span class="blog-related-card__excerpt">' +
                                escapeHtml(p.excerpt || '') +
                                '</span>' +
                                '</a>';
                            relatedList.appendChild(li);
                        });
                    }
                }
            })
            .catch(function () {
                sidebar.innerHTML =
                    '<li class="blog-sidebar-placeholder">Could not load recent posts.</li>';
            });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
})();
