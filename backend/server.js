require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const db = require("./db");
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Never let browsers/CDNs cache API answers — otherwise admin edits can look
// "not updated" on the live site until the cache expires.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, max-age=0");
  next();
});

/* ---------- storage: MySQL (see db.js) ----------
   All content and uploaded images are stored in MySQL (DB_HOST / DB_USER /
   DB_PASSWORD / DB_NAME), so edits survive restarts and work on Vercel. */
const STORAGE_PERSISTENT = true;

// Uploaded images are served straight from MySQL. Names are unique, so they can be cached forever.
// (/api/_uploads/... is the same route, used by the Vercel rewrite in vercel.json.)
app.get(["/uploads/:name", "/api/_uploads/:name"], async (req, res) => {
  try {
    await db.ready();
    const row = await db.getUpload(path.basename(req.params.name));
    if (!row) return res.status(404).end();
    res.set("Content-Type", row.mime);
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    return res.end(row.data);
  } catch (e) {
    console.error("upload fetch failed:", e && e.message);
    return res.status(500).end();
  }
});

// Before every API request: load the latest content from MySQL.
// Before the response is sent: write whatever this request changed back to MySQL.
app.use("/api", async (req, res, next) => {
  try {
    await db.ready();
    // Public site reads may be up to 5 s old; admin calls and writes always read fresh data.
    const publicRead = req.method === "GET" && req.path.startsWith("/content/");
    await db.refresh(publicRead ? 5000 : 0);
  } catch (e) {
    console.error("database error:", e && e.message);
    return res.status(503).json({ success: false, message: "Database unavailable. Check the DB_* settings." });
  }
  const send = res.json.bind(res);
  res.json = (body) => {
    db.flush()
      .then(() => send(body))
      .catch((e) => {
        console.error("database save failed:", e && e.message);
        res.status(500);
        send({ success: false, message: "Could not save to the database." });
      });
    return res;
  };
  next();
});

/* ---------- admin auth ----------
   Password precedence: password changed from the admin panel (data/auth.json)
   > ADMIN_PASSWORD env var > default. The session token is derived from the
   current password, so changing the password signs out every old session. */
const ENV_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SECRET = process.env.ADMIN_SECRET || "renovate-max2max-secret";

function readAuth() {
  const a = db.get("auth"); // password set from the admin panel (stored in MySQL)
  return a && a.salt && a.hash ? a : null;
}
function hashPassword(pw, salt) {
  return crypto.scryptSync(String(pw), salt, 64).toString("hex");
}
function checkPassword(pw) {
  const auth = readAuth();
  if (auth && auth.salt && auth.hash) {
    const a = Buffer.from(hashPassword(pw, auth.salt), "hex");
    const b = Buffer.from(auth.hash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  return String(pw) === ENV_PASSWORD;
}
function currentToken() {
  const auth = readAuth();
  const basis = auth && auth.hash ? auth.hash : ENV_PASSWORD;
  return crypto.createHmac("sha256", SECRET).update(basis).digest("hex");
}
function usingDefaultPassword() {
  return !readAuth() && ENV_PASSWORD === "admin123";
}

const upload = multer({
  storage: multer.memoryStorage(), // kept in memory, then saved to MySQL
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files allowed"), ok);
  },
});

/* ---------- generic JSON collection helper (backed by MySQL via db.js) ---------- */
function readCol(name) {
  const v = db.get(name);
  return Array.isArray(v) ? v : [];
}
function writeCol(name, rows) {
  db.set(name, rows);
}
function readObj(name) {
  const v = db.get(name);
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}
function writeObj(name, obj) {
  db.set(name, obj);
}
function newId() {
  return Date.now().toString(36) + crypto.randomBytes(3).toString("hex");
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (token !== currentToken())
    return res.status(401).json({ success: false, message: "Unauthorized" });
  next();
}

function logActivity(action, meta = {}) {
  const rows = readCol("activity");
  rows.unshift({ id: newId(), action, ...meta, at: new Date().toISOString() });
  writeCol("activity", rows.slice(0, 200));
}

/* ---------- seed initial data on startup ---------- */
function seed() {
  // Seed testimonials if file doesn't exist
  if (!db.has("testimonials")) {
    writeCol("testimonials", [
      {
        id: "seed-t1",
        name: "Sarah Mitchell",
        designation: "Homeowner, Edmonton",
        image: "",
        text: "Renovate Max2Max transformed our bathroom completely. Gurdeep paid attention to every detail — the tile work is flawless and the finish is beautiful. Highly recommend.",
        rating: 5,
        published: true,
      },
      {
        id: "seed-t2",
        name: "David Chen",
        designation: "Homeowner, Edmonton",
        image: "",
        text: "We hired Gurdeep for our kitchen backsplash and flooring. The quality of work and professionalism was outstanding. He showed up on time, kept the space clean, and delivered exactly what he promised.",
        rating: 5,
        published: true,
      },
      {
        id: "seed-t3",
        name: "Jennifer Patel",
        designation: "Homeowner, Edmonton",
        image: "",
        text: "From the first conversation to the final walkthrough, the experience was excellent. Our custom shower looks better than we imagined. The mitered edges are a work of art.",
        rating: 5,
        published: true,
      },
      {
        id: "seed-t4",
        name: "Michael Thompson",
        designation: "Business Owner, Edmonton",
        image: "",
        text: "Gurdeep and his team handled our commercial space renovation with precision. The tile installation was clean, level, and finished on schedule. Will definitely work with them again.",
        rating: 5,
        published: true,
      },
      {
        id: "seed-t5",
        name: "Amanda Beaulieu",
        designation: "Homeowner, Edmonton",
        image: "",
        text: "The fireplace tile work exceeded our expectations. Gurdeep understood exactly what we wanted and executed it perfectly. True craftsmanship.",
        rating: 5,
        published: true,
      },
      {
        id: "seed-t6",
        name: "Rajinder Singh",
        designation: "Homeowner, Edmonton",
        image: "",
        text: "Excellent work on our bathroom renovation. The waterproofing was done properly and the tile layout is perfect. Very satisfied with the quality and attention to detail.",
        rating: 5,
        published: true,
      },
    ]);
  }
  // Seed services if file doesn't exist
  if (!db.has("services")) writeCol("services", []);
  if (!db.has("texts")) writeObj("texts", {});
  if (!db.has("projects")) writeCol("projects", []);
  if (!db.has("quotes")) writeCol("quotes", []);
  if (!db.has("activity")) writeCol("activity", []);
  if (!db.has("settings")) writeObj("settings", {});
  if (!db.has("seo")) writeObj("seo", {});
  if (!db.has("image-overrides"))
    writeObj("image-overrides", {});
  if (!db.has("image-extras")) writeObj("image-extras", {});
  if (!db.has("service-images")) writeObj("service-images", {});
  if (!db.has("site-images")) writeObj("site-images", {});

  // First run only: copy the 9 built-in services into the database so every
  // service can be edited (title, text, bullet points, order, show/hide) from
  // the admin. A flag in settings stops them coming back after you delete some.
  try {
    const settings = readObj("settings");
    const current = readCol("services");
    if (!settings.servicesSeeded && current.length === 0) {
      const seedServices = JSON.parse(
        fs.readFileSync(path.join(__dirname, "services-seed.json"), "utf8"),
      );
      const now = new Date().toISOString();
      writeCol(
        "services",
        seedServices.map((x) => ({ id: newId(), ...x, createdAt: now, updatedAt: now })),
      );
    }
    if (!settings.servicesSeeded) {
      writeObj("settings", { ...settings, servicesSeeded: true });
    }
  } catch {
    /* seed file missing — skip */
  }

  // Store every service menu page's images in the DB.
  // Each slug gets { hero, images, added, removed } — existing admin
  // added/removed overlays are preserved, only missing data is filled.
  try {
    const seedMap = JSON.parse(
      fs.readFileSync(path.join(__dirname, "service-pages-seed.json"), "utf8"),
    );
    const si = readObj("service-images");
    let changed = false;
    Object.entries(seedMap).forEach(([slug, s]) => {
      const cur = si[slug] || {};
      if (!Array.isArray(cur.images)) {
        si[slug] = {
          hero: cur.hero || s.hero || "",
          images: s.images || [],
          added: Array.isArray(cur.added) ? cur.added : [],
          removed: Array.isArray(cur.removed) ? cur.removed : [],
        };
        changed = true;
      } else if (!cur.hero && s.hero) {
        cur.hero = s.hero;
        changed = true;
      }
    });
    if (changed) writeObj("service-images", si);
  } catch {
    /* seed file missing — skip */
  }

  // Store every website section's images in the DB (hero bgs, card images,
  // intro images…). Existing admin edits are preserved — only missing
  // or empty section lists get filled from the seed.
  try {
    const seedMap = JSON.parse(
      fs.readFileSync(path.join(__dirname, "site-images-seed.json"), "utf8"),
    );
    const ti = readObj("site-images");
    let changed = false;
    Object.entries(seedMap).forEach(([key, list]) => {
      if (!Array.isArray(ti[key]) || ti[key].length === 0) {
        ti[key] = list;
        changed = true;
      }
    });
    if (changed) writeObj("site-images", ti);
  } catch {
    /* seed file missing — skip */
  }
}
db.configure({
  seed,
  legacyDirs: [path.join(__dirname, "db-seed"), process.env.DATA_DIR || path.join(__dirname, "data")],
  uploadsDir: process.env.UPLOADS_DIR || path.join(__dirname, "uploads"),
});

/* ---------- public ---------- */
app.get("/api", (req, res) => res.json({ message: "Renovate Max2Max API" }));

app.post("/api/quote", (req, res) => {
  const { name, phone, email, type, details } = req.body;
  if (!name || !phone)
    return res
      .status(400)
      .json({ success: false, message: "Name and phone are required" });
  const quotes = readCol("quotes");
  const quote = {
    id: newId(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(email || "").trim(),
    type: String(type || "").trim(),
    details: String(details || "").trim(),
    status: "new",
    notes: "",
    createdAt: new Date().toISOString(),
  };
  quotes.unshift(quote);
  writeCol("quotes", quotes);
  logActivity("enquiry_received", { ref: quote.id, label: quote.name });
  res.json({ success: true, message: "Quote request received" });
});

/* public read-only for site content (no auth) */
app.get("/api/content/image-overrides", (req, res) => {
  res.json({ success: true, data: readObj("image-overrides") });
});
app.get("/api/content/image-extras", (req, res) => {
  res.json({ success: true, data: readObj("image-extras") });
});
app.get("/api/content/service-images", (req, res) => {
  res.json({ success: true, data: readObj("service-images") });
});

app.get("/api/content/site-images", (req, res) => {
  res.json({ success: true, data: readObj("site-images") });
});
app.get("/api/content/texts", (req, res) => {
  res.json({ success: true, data: readObj("texts") });
});
app.get("/api/content/:collection", (req, res) => {
  const allowed = ["services", "projects", "testimonials", "settings", "seo"];
  if (!allowed.includes(req.params.collection))
    return res.status(404).json({ success: false });
  if (req.params.collection === "settings" || req.params.collection === "seo") {
    return res.json({ success: true, data: readObj(req.params.collection) });
  }
  let rows = readCol(req.params.collection).filter((r) => r.published);
  if (req.params.collection === "services")
    rows = rows.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json({ success: true, data: rows });
});

/* ---------- auth ---------- */
const loginAttempts = new Map(); // ip -> { count, until }
app.post("/api/admin/login", (req, res) => {
  const ip = req.ip || "unknown";
  const rec = loginAttempts.get(ip) || { count: 0, until: 0 };
  if (rec.until > Date.now()) {
    return res.status(429).json({
      success: false,
      message: "Too many wrong attempts. Please wait a few minutes and try again.",
    });
  }
  const { password } = req.body || {};
  if (password && checkPassword(password)) {
    loginAttempts.delete(ip);
    logActivity("admin_login");
    return res.json({ success: true, token: currentToken(), name: "Administrator" });
  }
  rec.count += 1;
  if (rec.count >= 8) {
    rec.count = 0;
    rec.until = Date.now() + 5 * 60 * 1000;
  }
  loginAttempts.set(ip, rec);
  res.status(401).json({ success: false, message: "Invalid password" });
});

app.post("/api/admin/change-password", requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!checkPassword(currentPassword || ""))
    return res
      .status(400)
      .json({ success: false, message: "Current password is not correct" });
  if (!newPassword || String(newPassword).length < 8)
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  const salt = crypto.randomBytes(16).toString("hex");
  writeObj("auth", { salt, hash: hashPassword(newPassword, salt), changedAt: new Date().toISOString() });
  logActivity("password_changed");
  res.json({ success: true, token: currentToken() });
});

/* ---------- system status (shown as a banner in the admin) ---------- */
app.get("/api/admin/system", requireAdmin, (req, res) => {
  res.json({
    success: true,
    system: {
      persistent: STORAGE_PERSISTENT,
      storage: "mysql",
      defaultPassword: usingDefaultPassword(),
      serverless: !!process.env.VERCEL,
      time: new Date().toISOString(),
    },
  });
});

/* ---------- page text (editable website wording) ---------- */
app.get("/api/admin/texts", requireAdmin, (req, res) => {
  res.json({ success: true, data: readObj("texts") });
});
app.put("/api/admin/texts", requireAdmin, (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const clean = {};
  Object.keys(body).forEach((k) => {
    if (typeof body[k] === "string" && body[k].trim() !== "") clean[k] = body[k];
  });
  writeObj("texts", clean);
  logActivity("page_text_updated");
  res.json({ success: true, data: clean });
});

/* ---------- stats ---------- */
app.get("/api/admin/stats", requireAdmin, (req, res) => {
  const quotes = readCol("quotes");
  const services = readCol("services");
  const projects = readCol("projects");
  const testimonials = readCol("testimonials");
  const now = Date.now();
  const day = 86400000;
  const byType = {};
  quotes.forEach((q) => {
    const t = q.type || "Other";
    byType[t] = (byType[t] || 0) + 1;
  });
  const last14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * day);
    const key = d.toISOString().slice(0, 10);
    const count = quotes.filter((q) => q.createdAt.slice(0, 10) === key).length;
    last14.push({ date: key, count });
  }
  res.json({
    success: true,
    stats: {
      total: quotes.length,
      new: quotes.filter((q) => q.status === "new").length,
      contacted: quotes.filter((q) => q.status === "contacted").length,
      done: quotes.filter((q) => q.status === "done").length,
      today: quotes.filter((q) => now - new Date(q.createdAt).getTime() < day)
        .length,
      week: quotes.filter(
        (q) => now - new Date(q.createdAt).getTime() < 7 * day,
      ).length,
      services: services.length,
      servicesPublished: services.filter((s) => s.published).length,
      projects: projects.length,
      projectsFeatured: projects.filter((p) => p.featured).length,
      testimonials: testimonials.length,
      byType,
      last14,
    },
  });
});

/* ---------- quotes / enquiries ---------- */
app.get("/api/admin/quotes", requireAdmin, (req, res) => {
  res.json({ success: true, quotes: readCol("quotes") });
});

app.patch("/api/admin/quotes/:id", requireAdmin, (req, res) => {
  const quotes = readCol("quotes");
  const q = quotes.find((x) => x.id === req.params.id);
  if (!q) return res.status(404).json({ success: false, message: "Not found" });
  const { status, notes } = req.body;
  if (["new", "contacted", "done"].includes(status)) q.status = status;
  if (typeof notes === "string") q.notes = notes;
  writeCol("quotes", quotes);
  logActivity("enquiry_updated", {
    ref: q.id,
    label: q.name,
    status: q.status,
  });
  res.json({ success: true, quote: q });
});

app.delete("/api/admin/quotes/:id", requireAdmin, (req, res) => {
  const quotes = readCol("quotes");
  const q = quotes.find((x) => x.id === req.params.id);
  const filtered = quotes.filter((x) => x.id !== req.params.id);
  if (filtered.length === quotes.length)
    return res.status(404).json({ success: false, message: "Not found" });
  writeCol("quotes", filtered);
  logActivity("enquiry_deleted", {
    ref: req.params.id,
    label: q ? q.name : "",
  });
  res.json({ success: true });
});

/* ---------- generic collection CRUD (services, projects, testimonials) ---------- */
const COLLECTIONS = ["services", "projects", "testimonials"];

function makeRow(collection, body) {
  const id = newId();
  const now = new Date().toISOString();
  if (collection === "services") {
    const autoSlug = String(body.slug || body.title || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return {
      id,
      title: body.title || "",
      slug: autoSlug,
      summary: body.summary || "",
      description: body.description || "",
      image: body.image || "",
      icon: body.icon || "",
      points: Array.isArray(body.points) ? body.points : [],
      categories: Array.isArray(body.categories) ? body.categories : [],
      published: body.published !== false,
      order: body.order || 0,
      createdAt: now,
      updatedAt: now,
    };
  }
  if (collection === "projects") {
    return {
      id,
      title: body.title || "",
      category: body.category || "",
      location: body.location || "",
      description: body.description || "",
      image: body.image || "",
      gallery: body.gallery || [],
      featured: !!body.featured,
      published: body.published !== false,
      createdAt: now,
      updatedAt: now,
    };
  }
  return {
    id,
    name: body.name || "",
    designation: body.designation || "",
    image: body.image || "",
    text: body.text || "",
    rating: Math.min(5, Math.max(1, body.rating || 5)),
    published: body.published !== false,
    createdAt: now,
    updatedAt: now,
  };
}

COLLECTIONS.forEach((col) => {
  app.get(`/api/admin/${col}`, requireAdmin, (req, res) => {
    res.json({ success: true, data: readCol(col) });
  });
  app.post(`/api/admin/${col}`, requireAdmin, (req, res) => {
    const rows = readCol(col);
    const row = makeRow(col, req.body);
    rows.unshift(row);
    writeCol(col, rows);
    logActivity(`${col}_created`, {
      ref: row.id,
      label: row.title || row.name || "",
    });
    res.json({ success: true, data: row });
  });
  app.put(`/api/admin/${col}/:id`, requireAdmin, (req, res) => {
    const rows = readCol(col);
    const row = rows.find((r) => r.id === req.params.id);
    if (!row)
      return res.status(404).json({ success: false, message: "Not found" });
    Object.keys(req.body).forEach((k) => {
      if (k !== "id" && k !== "createdAt") row[k] = req.body[k];
    });
    row.updatedAt = new Date().toISOString();
    writeCol(col, rows);
    logActivity(`${col}_updated`, {
      ref: row.id,
      label: row.title || row.name || "",
    });
    res.json({ success: true, data: row });
  });
  app.delete(`/api/admin/${col}/:id`, requireAdmin, (req, res) => {
    const rows = readCol(col);
    const r = rows.find((x) => x.id === req.params.id);
    const filtered = rows.filter((x) => x.id !== req.params.id);
    if (filtered.length === rows.length)
      return res.status(404).json({ success: false, message: "Not found" });
    writeCol(col, filtered);
    logActivity(`${col}_deleted`, {
      ref: req.params.id,
      label: r ? r.title || r.name || "" : "",
    });
    res.json({ success: true });
  });
});

/* ---------- settings & seo (single objects) ---------- */
app.get("/api/admin/settings", requireAdmin, (req, res) => {
  res.json({ success: true, data: readObj("settings") });
});
app.put("/api/admin/settings", requireAdmin, (req, res) => {
  const cur = readObj("settings");
  const next = { ...cur, ...req.body, updatedAt: new Date().toISOString() };
  writeObj("settings", next);
  logActivity("settings_updated");
  res.json({ success: true, data: next });
});
app.get("/api/admin/seo", requireAdmin, (req, res) => {
  res.json({ success: true, data: readObj("seo") });
});
app.put("/api/admin/seo", requireAdmin, (req, res) => {
  const cur = readObj("seo");
  const next = { ...cur, ...req.body, updatedAt: new Date().toISOString() };
  writeObj("seo", next);
  logActivity("seo_updated");
  res.json({ success: true, data: next });
});

/* ---------- activity ---------- */
app.get("/api/admin/activity", requireAdmin, (req, res) => {
  res.json({ success: true, data: readCol("activity") });
});

/* ---------- images / media ---------- */
app.get("/api/admin/images", requireAdmin, async (req, res) => {
  try {
    const files = (await db.listUploads()).map((f) => ({
      name: f.name,
      url: `/uploads/${f.name}`,
      size: f.size,
      uploadedAt: f.uploadedAt,
    }));
    res.json({ success: true, images: files });
  } catch {
    res.json({ success: true, images: [] });
  }
});

app.post("/api/admin/images", requireAdmin, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const safe = path
        .basename(req.file.originalname, ext)
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase();
      const name = `${Date.now()}-${safe}${ext}`;
      await db.saveUpload({ name, mime: req.file.mimetype, buf: req.file.buffer });
      logActivity("image_uploaded", { ref: name });
      res.json({
        success: true,
        image: { name, url: `/uploads/${name}`, size: req.file.size },
      });
    } catch (e) {
      console.error("upload save failed:", e && e.message);
      res.status(500).json({ success: false, message: "Could not save the image to the database." });
    }
  });
});

app.delete("/api/admin/images/:name", requireAdmin, async (req, res) => {
  try {
    const name = path.basename(req.params.name);
    if (!(await db.deleteUpload(name)))
      return res.status(404).json({ success: false, message: "Not found" });
    logActivity("image_deleted", { ref: name });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Could not delete the image." });
  }
});

/* ---------- image overrides (admin write) ---------- */
app.get("/api/admin/image-overrides", requireAdmin, (req, res) => {
  res.json({ success: true, data: readObj("image-overrides") });
});
app.put("/api/admin/image-overrides", requireAdmin, (req, res) => {
  const cur = readObj("image-overrides");
  const next = { ...cur, ...req.body, updatedAt: new Date().toISOString() };
  writeObj("image-overrides", next);
  logActivity("image_override_updated");
  res.json({ success: true, data: next });
});
app.delete("/api/admin/image-overrides/:key", requireAdmin, (req, res) => {
  const overrides = readObj("image-overrides");
  const key = decodeURIComponent(req.params.key);
  if (!(key in overrides))
    return res.status(404).json({ success: false, message: "Not found" });
  delete overrides[key];
  writeObj("image-overrides", overrides);
  logActivity("image_override_removed", { ref: key });
  res.json({ success: true });
});

/* ---------- image extras — admin adds NEW images to a section ---------- */
app.get("/api/admin/image-extras", requireAdmin, (req, res) => {
  res.json({ success: true, data: readObj("image-extras") });
});
app.put("/api/admin/image-extras", requireAdmin, (req, res) => {
  const next = { ...(req.body || {}) };
  writeObj("image-extras", next);
  logActivity("image_extras_updated");
  res.json({ success: true, data: next });
});

/* ---------- service page images — admin add/remove per service ---------- */
app.get("/api/admin/service-images", requireAdmin, (req, res) => {
  res.json({ success: true, data: readObj("service-images") });
});
app.put("/api/admin/service-images", requireAdmin, (req, res) => {
  const next = { ...(req.body || {}) };
  writeObj("service-images", next);
  logActivity("service_images_updated");
  res.json({ success: true, data: next });
});

/* ---------- site images — per page/section image lists ---------- */
app.get("/api/admin/site-images", requireAdmin, (req, res) => {
  res.json({ success: true, data: readObj("site-images") });
});
app.put("/api/admin/site-images", requireAdmin, (req, res) => {
  const next = { ...(req.body || {}) };
  writeObj("site-images", next);
  logActivity("site_images_updated");
  res.json({ success: true, data: next });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
    console.log("Storage: MySQL " + (process.env.DB_HOST || "(DB_HOST not set)") + " / " + (process.env.DB_NAME || "defaultdb"));
  });
}
module.exports = app;
