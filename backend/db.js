/**
 * MySQL storage for the CMS (replaces the old backend/data/*.json + backend/uploads files).
 *
 * Env vars:  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (default "defaultdb"), optional DB_CA
 *
 * Content (services, projects, quotes, settings, site-images, ...) is kept as one JSON document
 * per name in table `kv_store`. The server reads them from an in-memory copy that is refreshed
 * from MySQL at the start of every request, and every change is written to MySQL before the
 * response is sent - so it works on Vercel (many short-lived instances) and on a normal server.
 * Uploaded images live in table `uploads`.
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

let pool;
let readyPromise;
let cfg = { legacyDirs: [], uploadsDir: null, seed: null };

const store = new Map(); // name -> { version, value }
const pending = new Map(); // name -> { version, json }   (written locally, not yet in MySQL)
let lastRefresh = 0;
let refreshing = null;

function configure(options) {
  cfg = { ...cfg, ...options };
}

function caCert() {
  if (process.env.DB_CA) return process.env.DB_CA.replace(/\\n/g, "\n");
  return fs.readFileSync(path.join(__dirname, "ca.pem"), "utf8");
}

function getPool() {
  if (!pool) {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
      throw new Error("Database is not configured (set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).");
    }
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "defaultdb",
      ssl: { ca: caCert(), rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 3,
      maxIdle: 3,
      idleTimeout: 60000,
      connectTimeout: 10000,
      enableKeepAlive: true,
    });
  }
  return pool;
}
const q = (sql, params) => getPool().query(sql, params);

/* ---------- key/value documents ---------- */
async function refresh(maxAgeMs = 0) {
  if (maxAgeMs && Date.now() - lastRefresh < maxAgeMs) return;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const [rows] = await q("SELECT name, version FROM kv_store");
    const need = rows
      .filter((r) => !pending.has(r.name))
      .filter((r) => {
        const c = store.get(r.name);
        return !c || c.version !== Number(r.version);
      })
      .map((r) => r.name);
    if (need.length) {
      const [docs] = await q("SELECT name, version, data FROM kv_store WHERE name IN (?)", [need]);
      for (const d of docs) {
        if (pending.has(d.name)) continue;
        let value;
        try {
          value = JSON.parse(d.data);
        } catch {
          continue;
        }
        store.set(d.name, { version: Number(d.version), value });
      }
    }
    lastRefresh = Date.now();
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

const has = (name) => store.has(name);
function get(name) {
  const c = store.get(name);
  return c ? structuredClone(c.value) : undefined;
}
function set(name, value) {
  const version = Math.max(Date.now(), ((store.get(name) || {}).version || 0) + 1);
  const json = JSON.stringify(value);
  store.set(name, { version, value: JSON.parse(json) });
  pending.set(name, { version, json });
}

// Write everything changed during this request to MySQL.
async function flush() {
  if (!pending.size) return;
  const items = [...pending.entries()];
  await Promise.all(
    items.map(async ([name, { version, json }]) => {
      await q(
        `INSERT INTO kv_store (name, data, version) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data), version = VALUES(version)`,
        [name, json, version],
      );
      if (pending.get(name) && pending.get(name).version === version) pending.delete(name);
    }),
  );
}

/* ---------- uploads ---------- */
async function saveUpload({ name, mime, buf }) {
  await q("INSERT INTO uploads (name, mime, size, data) VALUES (?, ?, ?, ?)", [name, mime, buf.length, buf]);
}
async function getUpload(name) {
  const [rows] = await q("SELECT mime, data FROM uploads WHERE name = ?", [name]);
  return rows[0] || null;
}
async function listUploads() {
  const [rows] = await q("SELECT name, size, created_at FROM uploads ORDER BY created_at DESC, name DESC");
  return rows.map((r) => ({ name: r.name, size: Number(r.size), uploadedAt: r.created_at }));
}
async function deleteUpload(name) {
  const [r] = await q("DELETE FROM uploads WHERE name = ?", [name]);
  return r.affectedRows > 0;
}

/* ---------- first-run setup ---------- */
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif" };

async function importLegacy() {
  // Old file-based data (backend/db-seed, backend/data) -> MySQL. Later folders win.
  for (const dir of cfg.legacyDirs || []) {
    let files = [];
    try {
      files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    } catch {
      continue;
    }
    for (const f of files) {
      try {
        set(path.basename(f, ".json"), JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
      } catch {
        /* unreadable file - skip */
      }
    }
  }
  // Old uploaded images (backend/uploads) -> MySQL
  if (cfg.uploadsDir) {
    let files = [];
    try {
      files = fs.readdirSync(cfg.uploadsDir);
    } catch {
      files = [];
    }
    for (const f of files) {
      const mime = MIME[path.extname(f).toLowerCase()];
      if (!mime) continue;
      try {
        const buf = fs.readFileSync(path.join(cfg.uploadsDir, f));
        await q("INSERT IGNORE INTO uploads (name, mime, size, data) VALUES (?, ?, ?, ?)", [f, mime, buf.length, buf]);
      } catch {
        /* skip */
      }
    }
  }
}

async function setup() {
  await q(`CREATE TABLE IF NOT EXISTS kv_store (
    name       VARCHAR(100) NOT NULL PRIMARY KEY,
    data       LONGTEXT     NOT NULL,
    version    BIGINT       NOT NULL,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);
  await q(`CREATE TABLE IF NOT EXISTS uploads (
    name       VARCHAR(255) NOT NULL PRIMARY KEY,
    mime       VARCHAR(50)  NOT NULL,
    size       INT          NOT NULL,
    data       LONGBLOB     NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);

  // Only one server instance may do the first-run import/seed at a time.
  const conn = await getPool().getConnection();
  try {
    const [[lock]] = await conn.query("SELECT GET_LOCK('renovate_setup', 20) AS ok");
    if (!lock || Number(lock.ok) !== 1) throw new Error("Could not get the setup lock.");
    try {
      await refresh(0);
      if (!store.has("_meta")) {
        await importLegacy();
        set("_meta", { migratedAt: new Date().toISOString() });
      }
      if (cfg.seed) cfg.seed();
      await flush();
    } finally {
      await conn.query("SELECT RELEASE_LOCK('renovate_setup')").catch(() => {});
    }
  } finally {
    conn.release();
  }
}

function ready() {
  if (!readyPromise) {
    readyPromise = setup().catch((e) => {
      readyPromise = null;
      throw e;
    });
  }
  return readyPromise;
}

module.exports = { configure, ready, refresh, get, set, has, flush, saveUpload, getUpload, listUploads, deleteUpload };
