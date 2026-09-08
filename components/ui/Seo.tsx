import Head from 'expo-router/head';
import React from 'react';

const SITE_NAME = 'ThrillIQ';

interface SeoProps {
  title: string;
  description: string;
}

// Per-page <title>/meta description for the real public pages (marketing
// site + Discover/Places, which are also reachable logged-out). <Head> is
// already provider-wrapped by expo-router itself (qualified-entry.js) and
// is a safe no-op on native, so this needs no platform checks.
//
// This SPA is client-rendered only (app.json's web.output is "single", no
// SSR/SSG) — these tags help the browser tab title and JS-executing
// crawlers (e.g. Googlebot), but a non-JS crawler or a social link-unfurler
// still won't see them, since they never run the page's JavaScript. Real
// crawlability for those would need server-side rendering, which is a
// framework-level change, not something this component can fix.
export function Seo({ title, description }: SeoProps) {
  // No fixed production domain exists yet (same reason sitemap.xml is
  // deferred — see public/robots.txt), so this is computed from the real
  // runtime origin rather than a guessed/hardcoded one. Query string
  // dropped deliberately: canonical should point at the clean page, not a
  // particular filter/search state. undefined on native (no window) or
  // during a server render pass, where <Head> simply omits the tag.
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined;

  return (
    <Head>
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}
