import { useEffect, useState } from 'react';
import API from '../config.js';

const API_ORIGIN = API.replace(/\/api$/, '');

/**
 * Resolve an image URL from the backend.
 * - Absolute URLs (https://…) are returned as-is.
 * - Paths starting with /uploads/ are prefixed with the backend origin.
 * - Other /images/... paths are served from the frontend public dir.
 */
export function imageUrl(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/uploads/')) return `${API_ORIGIN}${src}`;
  return src;
}

/**
 * Fetch a public content collection (services, projects, testimonials).
 * Returns { data, loading, error }.
 * On error, data stays null so the caller can fall back to static content.
 */
export function useContent(collection) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/content/${collection}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled && json.success) setData(json.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [collection]);

  return { data, loading, error };
}

/**
 * Fetch the site-images map — every website section's images stored in the
 * backend DB (keyed by section id, e.g. 'res-hero', 'ser-specialty').
 * Returns { get, list, loaded, data }:
 *   get(key, idx, fallback)  → src of one image, or fallback when missing
 *   list(key, fallbackArr)   → array of { src, label, text, href, cta } entries
 */
export function useSiteImages() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/content/site-images`);
        const json = await res.json();
        if (!cancelled && json.success) setData(json.data || {});
      } catch {
        /* backend down — fall back to static images */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const get = (key, idx = 0, fallback = '') => {
    const arr = data?.[key];
    return (Array.isArray(arr) && arr[idx] && arr[idx].src) ? arr[idx].src : fallback;
  };
  const list = (key, fallback = []) =>
    (Array.isArray(data?.[key]) && data[key].length) ? data[key] : fallback;

  return { get, list, loaded: data !== null, data };
}

import { SETTINGS_DEFAULTS, TEXT_DEFAULTS } from '../siteText.js';

/** Escape text before putting it into an HTML template string. */
export function esc(v = '') {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/** Escape + turn line breaks into <br> (for headlines). */
export function escBr(v = '') {
  return esc(v).replace(/\r?\n/g, '<br>');
}
/** Keep only digits and a leading + (for tel: and wa.me links). */
export function digits(v = '') {
  const d = String(v).replace(/[^\d+]/g, '');
  return d;
}

// One shared fetch per page load for settings / texts / seo (many components use them).
const shared = {};
function loadShared(name) {
  if (!shared[name]) {
    shared[name] = fetch(`${API}/content/${name}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => (j.success ? j.data || {} : {}))
      .catch(() => {});
  }
  return shared[name];
}

function useShared(name) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    loadShared(name).then((d) => { if (!cancelled) setData(d || {}); });
    return () => { cancelled = true; };
  }, [name]);
  return data;
}

/** Site settings merged over defaults — always returns a full object. */
export function useSettings() {
  const data = useShared('settings');
  const merged = { ...SETTINGS_DEFAULTS };
  if (data) Object.keys(SETTINGS_DEFAULTS).forEach((k) => { if (typeof data[k] === 'string' && data[k].trim()) merged[k] = data[k].trim(); });
  merged.tel = digits(merged.phone);
  return merged;
}

/** Page wording: t('home.hero.title') → admin override, else the built-in default. */
export function useTexts() {
  const data = useShared('texts');
  return (key, fallback) => {
    const v = data && data[key];
    if (typeof v === 'string' && v.trim()) return v;
    return fallback !== undefined ? fallback : TEXT_DEFAULTS[key] || '';
  };
}

/** SEO map { home:{title,description,...}, about:{...} } */
export function useSeo() {
  return useShared('seo');
}
