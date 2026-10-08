const host = typeof location !== 'undefined' ? location.hostname : 'localhost';
const auto =
  host === 'localhost' || host === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : host.endsWith('vercel.app')
      ? 'https://renovate-max2max-inc.onrender.com/api'
      : `${location.origin}/api`; // self-hosted — same domain serves frontend + API
const base = (import.meta.env.VITE_API_URL || auto).replace(/\/+$/, '');
const API = base.endsWith('/api') ? base : `${base}/api`;
export default API;
