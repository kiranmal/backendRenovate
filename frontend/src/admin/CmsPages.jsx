import { useEffect, useState } from "react";
import {
  useToast,
  useConfirm,
  Modal,
  Field,
  Input,
  Textarea,
  Skeleton,
  TableSkeleton,
  Empty,
  Badge,
  ImagePicker,
  useApi,
} from "./ui.jsx";
import { TEXT_FIELDS, TEXT_PAGES, SETTINGS_DEFAULTS } from "../siteText.js";

const JSON_HEADERS = { "Content-Type": "application/json" };

/* ============================================================
   SYSTEM BANNER — warns about things that stop edits going live
   ============================================================ */

export function SystemBanner() {
  const api = useApi();
  const [sys, setSys] = useState(null);
  useEffect(() => {
    api("/admin/system")
      .then((d) => d.success && setSys(d.system))
      .catch(() => {});
  }, []);
  if (!sys) return null;
  const warns = [];
  if (!sys.persistent || sys.serverless) {
    warns.push({
      tone: "danger",
      text: "Your server is saving changes to a TEMPORARY folder. Edits will disappear when the server restarts. Host the backend on a VPS / always-on Node server (see DEPLOY.md) so changes are permanent.",
    });
  }
  if (sys.defaultPassword) {
    warns.push({
      tone: "warn",
      text: "You are still using the default password (admin123). Please change it in Settings → Account.",
    });
  }
  if (!warns.length) return null;
  return (
    <div style={{ marginBottom: "1rem", display: "grid", gap: ".5rem" }}>
      {warns.map((w, i) => (
        <div
          key={i}
          style={{
            padding: ".7rem 1rem",
            borderRadius: 8,
            fontSize: ".85rem",
            background: w.tone === "danger" ? "#fdecec" : "var(--warn-soft)",
            color: w.tone === "danger" ? "#a32020" : "var(--warn)",
            border: "1px solid currentColor",
          }}
        >
          ⚠ {w.text}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   PAGE TEXT — edit headlines & paragraphs shown on the website
   ============================================================ */
export function PageText() {
  const api = useApi();
  const toast = useToast();
  const [saved, setSaved] = useState(null); // what the server has
  const [vals, setVals] = useState({});
  const [page, setPage] = useState(TEXT_PAGES[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/admin/texts")
      .then((d) => {
        setSaved(d.data || {});
        setVals(d.data || {});
      })
      .catch(() => setSaved({}));
  }, []);

  if (!saved)
    return (
      <div className="adm-panel">
        <div className="adm-panel-body">
          <Skeleton h={200} />
        </div>
      </div>
    );

  const fields = TEXT_FIELDS.filter((f) => f.page === page);
  const dirty = JSON.stringify(vals) !== JSON.stringify(saved);
  const changedOnPage = (p) =>
    TEXT_FIELDS.some(
      (f) => f.page === p && (vals[f.key] || "") !== (saved[f.key] || ""),
    );

  const save = async () => {
    setSaving(true);
    try {
      const d = await api("/admin/texts", {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(vals),
      });
      if (d.success) {
        setSaved(d.data);
        setVals(d.data);
        toast("Saved — the website is updated now", "success");
      } else toast("Could not save", "error");
    } catch {
      toast("Could not save", "error");
    }
    setSaving(false);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Page Text</h1>
          <p>
            Change the headlines and paragraphs on your website. Leave a box
            empty to use the original wording.
          </p>
        </div>
        <div className="adm-page-actions">
          <button
            className="adm-btn adm-btn-primary"
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : dirty ? "Save changes" : "All saved ✓"}
          </button>
        </div>
      </div>
      <div
        className="adm-tabs"
        style={{ marginBottom: "1.25rem", flexWrap: "wrap" }}
      >
        {TEXT_PAGES.map((p) => (
          <button
            key={p}
            className={page === p ? "active" : ""}
            onClick={() => setPage(p)}
          >
            {p}
            {changedOnPage(p) ? " •" : ""}
          </button>
        ))}
      </div>
      <div className="adm-panel">
        <div className="adm-panel-head">
          <h3>{page} page</h3>
          <a
            className="adm-muted"
            href={
              page === "Home"
                ? "/"
                : page === "Footer"
                  ? "/"
                  : `/${page.toLowerCase()}`
            }
            target="_blank"
            rel="noreferrer"
          >
            View page ↗
          </a>
        </div>
        <div className="adm-panel-body">
          {fields.map((f) => {
            const v = vals[f.key] ?? "";
            const set = (e) => setVals({ ...vals, [f.key]: e.target.value });
            return (
              <Field
                key={f.key}
                label={f.label}
                hint={
                  v ? (
                    <>
                      Customised ·{" "}
                      <a
                        href="#reset"
                        onClick={(e) => {
                          e.preventDefault();
                          const n = { ...vals };
                          delete n[f.key];
                          setVals(n);
                        }}
                      >
                        reset to original
                      </a>
                    </>
                  ) : (
                    f.hint
                  )
                }
              >
                {f.multiline ? (
                  <Textarea
                    rows={f.default.length > 120 ? 4 : 2}
                    value={v}
                    onChange={set}
                    placeholder={f.default}
                  />
                ) : (
                  <Input value={v} onChange={set} placeholder={f.default} />
                )}
              </Field>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SERVICES — one list, everything editable
   ============================================================ */
export function ServicesManager() {
  const api = useApi();
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () =>
    api("/admin/services")
      .then((d) =>
        setRows(
          d.success
            ? [...d.data].sort((a, b) => (a.order || 0) - (b.order || 0))
            : [],
        ),
      )
      .catch(() => setRows([]));
  useEffect(() => {
    load();
  }, []);

  const startNew = () =>
    setEditing({
      title: "",
      slug: "",
      summary: "",
      description: "",
      pointsText: "",
      image: "",
      published: true,
      order: (rows?.length || 0) + 1,
    });
  const startEdit = (s) =>
    setEditing({ ...s, pointsText: (s.points || []).join("\n") });

  const save = async () => {
    if (!editing.title.trim()) {
      toast("Please enter a service name", "error");
      return;
    }
    const { pointsText, id, ...rest } = editing;
    const payload = {
      ...rest,
      points: pointsText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    };
    const d = await api(id ? `/admin/services/${id}` : "/admin/services", {
      method: id ? "PUT" : "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
    if (d.success) {
      toast(
        id
          ? "Service updated — live on the website"
          : "Service added — live on the website",
        "success",
      );
      setEditing(null);
      load();
    } else toast("Could not save", "error");
  };
  const toggle = async (s) => {
    await api(`/admin/services/${s.id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({ published: !s.published }),
    });
    load();
  };
  const move = async (s, dir) => {
    const i = rows.findIndex((x) => x.id === s.id);
    const o = rows[i + dir];
    if (!o) return;
    await Promise.all([
      api(`/admin/services/${s.id}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({ order: i + 1 + dir }),
      }),
      api(`/admin/services/${o.id}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({ order: i + 1 }),
      }),
    ]);
    load();
  };
  const del = async (s) => {
    if (
      !(await confirm({
        title: "Delete service",
        message: `Delete "${s.title}"? It will disappear from the website.`,
        danger: true,
        confirmText: "Delete",
      }))
    )
      return;
    await api(`/admin/services/${s.id}`, { method: "DELETE" });
    toast("Service deleted", "success");
    load();
  };

  if (!rows)
    return (
      <div className="adm-panel">
        <TableSkeleton />
      </div>
    );

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Services</h1>
          <p>
            Everything on the Services page and each service's own page. Changes
            go live instantly.
          </p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={startNew}>
            + Add Service
          </button>
        </div>
      </div>
      <div className="adm-panel adm-panel-flush">
        {rows.length === 0 ? (
          <Empty
            icon="⚙"
            title="No services yet"
            sub='Click "Add Service" to create one.'
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Order</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th style={{ width: 200 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => (
                  <tr key={s.id}>
                    <td>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-ghost"
                        disabled={i === 0}
                        onClick={() => move(s, -1)}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-ghost"
                        disabled={i === rows.length - 1}
                        onClick={() => move(s, 1)}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </td>
                    <td>
                      <div className="adm-row-title">{s.title}</div>
                      <div className="adm-row-sub">{s.summary}</div>
                    </td>
                    <td>
                      <button
                        style={{
                          background: "none",
                          border: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => toggle(s)}
                        title="Click to show / hide"
                      >
                        <Badge status={s.published ? "published" : "draft"}>
                          {s.published ? "Visible" : "Hidden"}
                        </Badge>
                      </button>
                    </td>
                    <td>
                      <div className="adm-cell-actions">
                        <a
                          className="adm-btn adm-btn-sm"
                          href={`/services/${s.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View ↗
                        </a>
                        <button
                          className="adm-btn adm-btn-sm"
                          onClick={() => startEdit(s)}
                        >
                          Edit
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-ghost adm-btn-danger"
                          onClick={() => del(s)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="adm-muted" style={{ marginTop: ".75rem" }}>
        Photos for each service page are managed in <b>Service Images</b>.
      </p>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit Service" : "Add Service"}
        size="lg"
        footer={
          editing && (
            <>
              <button className="adm-btn" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="adm-btn adm-btn-primary" onClick={save}>
                Save
              </button>
            </>
          )
        }
      >
        {editing && (
          <>
            <Field label="Service name" required>
              <Input
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                placeholder="e.g. Bathroom Upgrades"
              />
            </Field>
            <Field
              label="Short summary"
              hint="Shown on the card in the Services list."
            >
              <Input
                value={editing.summary}
                onChange={(e) =>
                  setEditing({ ...editing, summary: e.target.value })
                }
              />
            </Field>
            <Field
              label="Description"
              hint="Shown at the top of the service's own page."
            >
              <Textarea
                rows={4}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </Field>
            <Field
              label="Bullet points"
              hint="One per line — shown as the checklist on the service page."
            >
              <Textarea
                rows={5}
                value={editing.pointsText}
                onChange={(e) =>
                  setEditing({ ...editing, pointsText: e.target.value })
                }
              />
            </Field>
            <ImagePicker
              value={editing.image}
              onChange={(v) => setEditing({ ...editing, image: v })}
              label="Card image (optional)"
            />
            {!editing.id && (
              <Field
                label="Web address (optional)"
                hint="Made from the name if left empty, e.g. /services/bathroom-upgrades"
              >
                <Input
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                />
              </Field>
            )}
            <label className="adm-checkbox">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) =>
                  setEditing({ ...editing, published: e.target.checked })
                }
              />{" "}
              Show on website
            </label>
          </>
        )}
      </Modal>
    </>
  );
}

/* ============================================================
   SETTINGS — contact details, social links, SEO, password
   ============================================================ */
const SEO_PAGES = [
  ["home", "Home"],
  ["about", "About"],
  ["services", "Services"],
  ["residential", "Residential"],
  ["philosophy", "Philosophy"],
  ["contact", "Contact"],
];

export function SettingsPage() {
  const [tab, setTab] = useState("contact");
  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Settings</h1>
          <p>
            Contact details, social links, Google search info and your password.
          </p>
        </div>
      </div>
      <div
        className="adm-tabs"
        style={{ marginBottom: "1.25rem", flexWrap: "wrap" }}
      >
        {[
          ["contact", "Contact & Social"],
          ["seo", "Google / SEO"],
          ["account", "Account"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "contact" && <ContactSettings />}
      {tab === "seo" && <SeoSettings />}
      {tab === "account" && <Account />}
    </>
  );
}

function ContactSettings() {
  const api = useApi();
  const toast = useToast();
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api("/admin/settings")
      .then((d) => setS(d.data || {}))
      .catch(() => setS({}));
  }, []);
  if (!s)
    return (
      <div className="adm-panel">
        <div className="adm-panel-body">
          <Skeleton h={200} />
        </div>
      </div>
    );
  const bind = (k) => ({
    value: s[k] ?? "",
    placeholder: SETTINGS_DEFAULTS[k] || "",
    onChange: (e) => setS({ ...s, [k]: e.target.value }),
  });
  const save = async () => {
    setSaving(true);
    try {
      const d = await api("/admin/settings", {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(s),
      });
      toast(
        d.success
          ? "Saved — header, footer and Contact page are updated"
          : "Could not save",
        d.success ? "success" : "error",
      );
    } catch {
      toast("Could not save", "error");
    }
    setSaving(false);
  };
  return (
    <>
      <div className="adm-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="adm-panel">
          <div className="adm-panel-head">
            <h3>Business & contact</h3>
          </div>
          <div className="adm-panel-body">
            <Field label="Business name">
              <Input {...bind("siteName")} />
            </Field>
            <Field
              label="Phone number"
              hint="Used for the Call buttons in the header, footer and Contact page."
            >
              <Input {...bind("phone")} />
            </Field>
            <Field label="Email">
              <Input {...bind("email")} />
            </Field>
            <Field label="Address / area">
              <Input {...bind("address")} />
            </Field>
            <Field label="Country">
              <Input {...bind("country")} />
            </Field>
            <Field label="Opening hours">
              <Input {...bind("hours")} />
            </Field>
          </div>
        </div>
        <div className="adm-panel">
          <div className="adm-panel-head">
            <h3>Social links</h3>
          </div>
          <div className="adm-panel-body">
            <Field
              label="Instagram link"
              hint="Leave empty to hide it from the footer."
            >
              <Input {...bind("instagram")} />
            </Field>
            <Field label="Facebook link">
              <Input {...bind("facebook")} />
            </Field>
            <Field label="Pinterest link">
              <Input {...bind("pinterest")} />
            </Field>
            <Field label="LinkedIn link">
              <Input {...bind("linkedin")} />
            </Field>
            <Field
              label="WhatsApp number"
              hint="Digits with country code, e.g. +14378698609"
            >
              <Input {...bind("whatsapp")} />
            </Field>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <button
          className="adm-btn adm-btn-primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </>
  );
}

function SeoSettings() {
  const api = useApi();
  const toast = useToast();
  const [seo, setSeo] = useState(null);
  const [page, setPage] = useState("home");
  useEffect(() => {
    api("/admin/seo")
      .then((d) => setSeo(d.data || {}))
      .catch(() => setSeo({}));
  }, []);
  if (!seo)
    return (
      <div className="adm-panel">
        <div className="adm-panel-body">
          <Skeleton h={200} />
        </div>
      </div>
    );
  const cur = seo[page] || {};
  const upd = (k, v) => setSeo({ ...seo, [page]: { ...cur, [k]: v } });
  const save = async () => {
    const d = await api("/admin/seo", {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(seo),
    });
    toast(
      d.success
        ? "Saved — Google info updated on the website"
        : "Could not save",
      d.success ? "success" : "error",
    );
  };
  return (
    <>
      <div
        className="adm-tabs"
        style={{ marginBottom: "1rem", flexWrap: "wrap" }}
      >
        {SEO_PAGES.map(([id, label]) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="adm-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="adm-panel">
          <div className="adm-panel-head">
            <h3>How this page appears on Google</h3>
          </div>
          <div className="adm-panel-body">
            <Field
              label="Page title"
              hint={`${(cur.title || "").length}/60 characters is ideal`}
            >
              <Input
                value={cur.title || ""}
                onChange={(e) => upd("title", e.target.value)}
                placeholder="Renovate Max2Max Inc. | Tile & Renovation Edmonton"
              />
            </Field>
            <Field
              label="Description"
              hint={`${(cur.description || "").length}/160 characters is ideal`}
            >
              <Textarea
                rows={3}
                value={cur.description || ""}
                onChange={(e) => upd("description", e.target.value)}
              />
            </Field>
            <Field label="Keywords (optional)">
              <Input
                value={cur.keywords || ""}
                onChange={(e) => upd("keywords", e.target.value)}
                placeholder="tile, bathroom, edmonton"
              />
            </Field>
            <ImagePicker
              value={cur.ogImage || ""}
              onChange={(v) => upd("ogImage", v)}
              label="Image shown when shared on WhatsApp / Facebook"
            />
            <button className="adm-btn adm-btn-primary" onClick={save}>
              Save
            </button>
          </div>
        </div>
        <div className="adm-panel">
          <div className="adm-panel-head">
            <h3>Preview</h3>
          </div>
          <div className="adm-panel-body">
            <div
              style={{
                fontFamily: "Arial",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "1rem",
                background: "#fff",
              }}
            >
              <div style={{ fontSize: ".78rem", color: "#202124" }}>
                {window.location.origin}
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  color: "#1a0dab",
                  marginTop: ".2rem",
                }}
              >
                {cur.title || "Renovate Max2Max Inc."}
              </div>
              <div
                style={{
                  fontSize: ".82rem",
                  color: "#4d5156",
                  marginTop: ".15rem",
                }}
              >
                {cur.description || "Your description will appear here."}
              </div>
            </div>
            <p className="adm-muted" style={{ marginTop: "1rem" }}>
              Google can take days or weeks to show new titles in search
              results.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Account() {
  const api = useApi();
  const toast = useToast();
  const [f, setF] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (f.newPassword.length < 8) {
      toast("New password must be at least 8 characters", "error");
      return;
    }
    if (f.newPassword !== f.confirm) {
      toast("The two new passwords do not match", "error");
      return;
    }
    setBusy(true);
    try {
      const d = await api("/admin/change-password", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          currentPassword: f.currentPassword,
          newPassword: f.newPassword,
        }),
      });
      if (d.success) {
        localStorage.setItem("admin_token", d.token);
        toast("Password changed", "success");
        setF({ currentPassword: "", newPassword: "", confirm: "" });
        setTimeout(() => window.location.reload(), 800);
      } else toast(d.message || "Could not change password", "error");
    } catch {
      toast("Could not change password", "error");
    }
    setBusy(false);
  };
  return (
    <div className="adm-panel" style={{ maxWidth: 520 }}>
      <div className="adm-panel-head">
        <h3>Change admin password</h3>
      </div>
      <div className="adm-panel-body">
        <Field label="Current password">
          <Input
            type="password"
            value={f.currentPassword}
            onChange={(e) => setF({ ...f, currentPassword: e.target.value })}
          />
        </Field>
        <Field label="New password" hint="At least 8 characters.">
          <Input
            type="password"
            value={f.newPassword}
            onChange={(e) => setF({ ...f, newPassword: e.target.value })}
          />
        </Field>
        <Field label="Repeat new password">
          <Input
            type="password"
            value={f.confirm}
            onChange={(e) => setF({ ...f, confirm: e.target.value })}
          />
        </Field>
        <button
          className="adm-btn adm-btn-primary"
          onClick={submit}
          disabled={busy}
        >
          {busy ? "Saving…" : "Change password"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   HELP — plain-language guide for the site owner
   ============================================================ */
export function Help({ go }) {
  const items = [
    [
      "Change a photo",
      "Website Images",
      "website-images",
      "Pick the page, click the picture, upload or choose a new one.",
    ],
    [
      "Change a headline or paragraph",
      "Page Text",
      "page-text",
      "Open the page, type new wording, press Save.",
    ],
    [
      "Change phone, email, hours or social links",
      "Settings",
      "settings",
      "Updates the header, footer and Contact page together.",
    ],
    [
      "Add / edit / hide a service",
      "Services",
      "services",
      "Edit the description and checklist, reorder, or hide it.",
    ],
    [
      "Add photos to a service page",
      "Service Images",
      "service-images",
      "Upload and arrange the gallery for each service.",
    ],
    [
      "Add past work",
      "Projects",
      "projects",
      "Add a project with a photo — it appears in Selected Work.",
    ],
    [
      "Add a customer review",
      "Testimonials",
      "testimonials",
      "Add or hide reviews shown on the site.",
    ],
    [
      "Read customer enquiries",
      "Enquiries",
      "enquiries",
      "Everything sent through the Contact form arrives here.",
    ],
  ];
  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Help</h1>
          <p>What do you want to do? Click a card to go there.</p>
        </div>
      </div>
      <div
        className="adm-media-grid"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}
      >
        {items.map(([q, where, id, how]) => (
          <button
            key={id}
            className="adm-media-card"
            style={{
              textAlign: "left",
              cursor: "pointer",
              padding: "1rem",
              background: "var(--surface)",
            }}
            onClick={() => go(id)}
          >
            <div style={{ fontWeight: 600, marginBottom: ".3rem" }}>{q}</div>
            <div className="adm-muted">{how}</div>
            <div
              style={{
                marginTop: ".6rem",
                fontSize: ".8rem",
                color: "var(--accent)",
              }}
            >
              Go to {where} →
            </div>
          </button>
        ))}
      </div>
      <div className="adm-panel" style={{ marginTop: "1.25rem" }}>
        <div className="adm-panel-head">
          <h3>If a change does not show on the website</h3>
        </div>
        <div
          className="adm-panel-body"
          style={{ fontSize: ".88rem", lineHeight: 1.7 }}
        >
          <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
            <li>
              Make sure you pressed <b>Save</b> and saw the green “Saved”
              message.
            </li>
            <li>
              Refresh the website with <b>Ctrl+Shift+R</b> (Windows) or{" "}
              <b>Cmd+Shift+R</b> (Mac).
            </li>
            <li>
              Check the Dashboard for a red/orange warning — it tells you if the
              server is not keeping your changes.
            </li>
            <li>
              Still stuck? Open the website in a private/incognito window to
              rule out your browser cache.
            </li>
          </ol>
        </div>
      </div>
    </>
  );
}
