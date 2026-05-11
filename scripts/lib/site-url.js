'use strict';

require('./load-env.js');

function siteBaseUrl() {
  return String(process.env.SITE_BASE_URL || 'https://jiliacephlive.com').replace(/\/+$/, '');
}

/** Path segment for blog, default `/blog`. No trailing slash. */
function blogPathPrefix() {
  const p = String(process.env.BLOG_BASE_PATH || '/blog').trim() || '/blog';
  return '/' + p.replace(/^\/+|\/+$/g, '');
}

function blogPostUrl(slug) {
  const slugClean = String(slug || '').replace(/^\/+|\/+$/g, '');
  return `${siteBaseUrl()}${blogPathPrefix()}/${slugClean}/`;
}

function blogIndexUrl() {
  return `${siteBaseUrl()}${blogPathPrefix()}/`;
}

module.exports = {
  siteBaseUrl,
  blogPathPrefix,
  blogPostUrl,
  blogIndexUrl,
};
