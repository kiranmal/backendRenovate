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

/**
 * Fetch the settings object.
 */
export function useSettings() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/content/settings`);
        const json = await res.json();
        if (!cancelled && json.success) setData(json.data);
      } catch {
        /* settings are optional */
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return data;
}
