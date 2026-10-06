import { useEffect, useState, useCallback, useRef } from 'react';
import API from '../config.js';
import './admin.css';
import { ToastProvider, ConfirmProvider, useToast, useConfirm, Modal, Badge, Field, Input, Textarea, Select, Skeleton, TableSkeleton, Empty, Pagination, ImagePicker, useApi, timeAgo, fmtSize } from './ui.jsx';
import { IMAGE_USAGE, EXTERNAL_IMAGES, getUsage, isUsed } from './imageUsage.js';
import { WEBSITE_IMAGE_MAP, getAllMappedImages, findUsages } from './websiteImageMap.js';
import { FRONTEND_SERVICES, FRONTEND_PROJECTS, FRONTEND_GALLERY, FRONTEND_TESTIMONIALS, mergeServices, mergeProjects, mergeTestimonials, getAllGalleryImages, getGalleryByCategory, getGalleryByPage } from './frontendData.js';
import { SERVICES as SERVICE_PAGES } from '../data/servicesData.js';

window.__ADM_API__ = API;
const API_ORIGIN = API.replace(/\/api$/, '');

/* ============================================================
   LOGIN
   ============================================================ */
function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) { localStorage.setItem('admin_token', data.token); onLogin(); }
      else setErr(data.message || 'Invalid password');
    } catch { setErr('Could not connect. Backend may be waking up — retry in 30s.'); }
    setLoading(false);
  };
  return (
    <div className="adm adm-login-bg">
      <form className="adm-login-card" onSubmit={submit}>
        <img src="/images/logo.png" alt="" className="adm-login-logo" />
        <h1>Admin Panel</h1>
        <p>Sign in to manage your website</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoFocus />
        <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        {err && <div className="adm-login-err">{err}</div>}
        <a href="/" className="adm-login-back">← Back to website</a>
      </form>
    </div>
  );
}

/* ============================================================
   LAYOUT (sidebar + header)
   ============================================================ */
const NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  ]},
  { group: 'Content', items: [
    { id: 'website-images', label: 'Website Images', icon: '▦' },
    { id: 'service-images', label: 'Service Images', icon: '▤' },
    { id: 'services', label: 'Services', icon: '⚙' },
    { id: 'projects', label: 'Projects', icon: '▣' },
    { id: 'testimonials', label: 'Testimonials', icon: '✦' },
    { id: 'gallery', label: 'Gallery', icon: '▦' },
  ]},
  { group: 'Engagement', items: [
    { id: 'enquiries', label: 'Enquiries', icon: '✉' },
    { id: 'activity', label: 'Activity Logs', icon: '⏱' },
  ]},
  { group: 'System', items: [
    { id: 'settings', label: 'Settings', icon: '⚙' },
    { id: 'users', label: 'Users', icon: '☻' },
  ]},
];

function Layout({ view, setView, collapsed, setCollapsed, onLogout, children }) {
  const [drawer, setDrawer] = useState(false);
  const counts = window.__ADM_COUNTS__ || {};
  const current = NAV.flatMap((g) => g.items).find((i) => i.id === view);
  return (
    <div className="adm">
      <aside className={`adm-sidebar ${collapsed ? 'collapsed' : ''} ${drawer ? 'open' : ''}`}>
        <div className="adm-side-head">
          <img src="/images/logo.png" alt="" className="adm-side-logo" />
          <span className="adm-side-name">Renovate Max2Max</span>
        </div>
        <nav className="adm-side-nav">
          {NAV.map((g) => (
            <div key={g.group}>
              <div className="adm-side-group">{g.group}</div>
              {g.items.map((it) => (
                <button key={it.id} className={`adm-side-item ${view === it.id ? 'active' : ''}`}
                  onClick={() => { setView(it.id); setDrawer(false); }} title={it.label}>
                  <span className="adm-side-ico">{it.icon}</span>
                  <span className="adm-side-label">{it.label}</span>
                  {counts[it.id] > 0 && <span className="adm-side-badge">{counts[it.id]}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" className="adm-side-link"><span className="adm-side-ico">↗</span><span>View Website</span></a>
          <button className="adm-side-link" onClick={onLogout}><span className="adm-side-ico">⏻</span><span>Logout</span></button>
        </div>
      </aside>
      {drawer && <div className="adm-overlay" onClick={() => setDrawer(false)} />}
      <div className="adm-main">
        <header className="adm-header">
          <button className="adm-toggle" onClick={() => setCollapsed(!collapsed)}>☰</button>
          <button className="adm-burger" onClick={() => setDrawer(true)}>☰</button>
          <div className="adm-crumb">Admin <span>›</span> <b>{current?.label}</b></div>
          <div className="adm-header-spacer" />
          <div className="adm-header-actions">
            <a href="/" className="adm-icon-btn" title="View website" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>↗</a>
            <div className="adm-avatar" title="Administrator">A</div>
          </div>
        </header>
        <div className="adm-content adm-fade" key={view}>{children}</div>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard({ go }) {
  const api = useApi();
  const [stats, setStats] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [s, q, a] = await Promise.all([api('/admin/stats'), api('/admin/quotes'), api('/admin/activity')]);
        if (s.success) setStats(s.stats);
        if (q.success) setQuotes(q.quotes.slice(0, 6));
        if (a.success) setActivity(a.data.slice(0, 8));
      } catch {}
      setLoading(false);
    })();
  }, []);
  if (loading) return <DashSkeleton />;
  if (!stats) return <Empty icon="⚠" title="Could not load dashboard" sub="Check that the backend is running." />;
  const maxBar = Math.max(1, ...stats.last14.map((d) => d.count));
  return (
    <>
      <div className="adm-page-head">
        <div><h1>Dashboard</h1><p>Overview of your website activity</p></div>
      </div>
      <div className="adm-stats">
        <StatCard ico="✉" tone="accent" num={stats.total} label="Total Enquiries" />
        <StatCard ico="●" tone="warn" num={stats.new} label="New Enquiries" />
        <StatCard ico="⚙" tone="blue" num={FRONTEND_SERVICES.length + stats.services} label="Services" sub={`${FRONTEND_SERVICES.length} frontend + ${stats.services} database`} />
        <StatCard ico="▣" tone="dark" num={FRONTEND_PROJECTS.length + stats.projects} label="Projects" sub={`${FRONTEND_PROJECTS.length} frontend + ${stats.projects} database`} />
      </div>
      <div className="adm-grid-2">
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>Enquiries · Last 14 days</h3><span className="adm-muted">{stats.week} this week</span></div>
          <div className="adm-panel-body">
            <div className="adm-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '.4rem', height: 200 }}>
              {stats.last14.map((d) => (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem' }}>
                  <div title={`${d.date}: ${d.count}`} style={{ width: '100%', maxWidth: 28, height: `${(d.count / maxBar) * 160 + 4}px`, background: d.count ? 'var(--accent)' : 'var(--border)', borderRadius: '4px 4px 0 0', transition: 'height .3s' }} />
                  <span style={{ fontSize: '.62rem', color: 'var(--muted)' }}>{d.date.slice(8, 10)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>Recent Enquiries</h3><button className="adm-link" onClick={() => go('enquiries')}>View all →</button></div>
          <div className="adm-panel-body" style={{ padding: 0 }}>
            {quotes.length === 0 ? <Empty icon="✉" title="No enquiries yet" /> : quotes.map((q) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <Badge status={q.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '.87rem' }}>{q.name}</div>
                  <div className="adm-muted" style={{ fontSize: '.78rem' }}>{q.type || 'General'} · {q.phone}</div>
                </div>
                <span className="adm-muted" style={{ fontSize: '.76rem' }}>{timeAgo(q.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="adm-grid-2" style={{ marginTop: '1rem' }}>
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>By Project Type</h3></div>
          <div className="adm-panel-body">
            {Object.keys(stats.byType).length === 0 ? <Empty icon="▦" title="No data yet" /> :
              Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([t, c]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.4rem 0' }}>
                  <span style={{ width: 120, fontSize: '.82rem', color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>
                  <div style={{ flex: 1, height: 7, background: 'var(--surface-2)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${(c / Math.max(...Object.values(stats.byType))) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 5 }} />
                  </div>
                  <span style={{ fontSize: '.8rem', fontWeight: 600, width: 24, textAlign: 'right' }}>{c}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>Recent Activity</h3></div>
          <div className="adm-panel-body" style={{ padding: 0 }}>
            {activity.length === 0 ? <Empty icon="⏱" title="No activity yet" /> : activity.map((a) => (
              <div key={a.id} className="adm-act" style={{ padding: '.65rem 1.25rem' }}>
                <div className="adm-act-ico">{actIcon(a.action)}</div>
                <div className="adm-act-body">
                  <div className="adm-act-title">{actLabel(a.action)}{a.label ? ` · ${a.label}` : ''}</div>
                  <div className="adm-act-meta">{timeAgo(a.at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
function StatCard({ ico, tone, num, label, sub }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat-top"><div className={`adm-stat-ico ${tone}`}>{ico}</div></div>
      <div className="adm-stat-num">{num}</div>
      <div className="adm-stat-lbl">{label}</div>
      {sub && <div className="adm-stat-delta">{sub}</div>}
    </div>
  );
}
function DashSkeleton() {
  return (
    <>
      <div className="adm-stats">{Array.from({ length: 4 }).map((_, i) => (
        <div className="adm-stat" key={i}><Skeleton h={36} w={36} r={8} /><div style={{ marginTop: '.75rem' }}><Skeleton h={28} w={60} /><Skeleton h={12} w={90} style={{ marginTop: '.4rem' }} /></div></div>
      ))}</div>
      <div className="adm-grid-2">{Array.from({ length: 2 }).map((_, i) => (
        <div className="adm-panel" key={i}><div className="adm-panel-head"><Skeleton h={18} w={140} /></div><div className="adm-panel-body"><Skeleton h={180} /></div></div>
      ))}</div>
    </>
  );
}
function actIcon(a) { if (a.startsWith('enquiry')) return '✉'; if (a.startsWith('image')) return '☵'; if (a.startsWith('admin')) return '☻'; if (a.includes('settings') || a.includes('seo')) return '⚙'; return '✦'; }
function actLabel(a) { return a.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }

/* ============================================================
   ENQUIRIES
   ============================================================ */
function Enquiries() {
  const api = useApi();
  const toast = useToast();
  const confirm = useConfirm();
  const [quotes, setQuotes] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    const data = await api('/admin/quotes');
    if (data.success) setQuotes(data.quotes);
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    await api(`/admin/quotes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    toast(`Marked as ${status}`, 'success');
    load(); if (detail) setDetail({ ...detail, status });
  };
  const saveNotes = async () => {
    await api(`/admin/quotes/${detail.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) });
    toast('Notes saved', 'success'); load();
  };
  const del = async (id) => {
    if (!await confirm({ title: 'Delete enquiry', message: 'This permanently removes the enquiry.', danger: true, confirmText: 'Delete' })) return;
    await api(`/admin/quotes/${id}`, { method: 'DELETE' });
    toast('Enquiry deleted', 'success'); setDetail(null); load();
  };

  if (!quotes) return <div className="adm-panel"><TableSkeleton /></div>;
  const filtered = quotes.filter((q) => (filter === 'all' || q.status === filter) && (!search.trim() || [q.name, q.phone, q.email, q.type, q.details].join(' ').toLowerCase().includes(search.toLowerCase())));

  return (
    <>
      <div className="adm-page-head"><div><h1>Enquiries</h1><p>Manage contact form submissions</p></div></div>
      <div className="adm-toolbar">
        <div className="adm-search">
          <span className="adm-search-ico">⌕</span>
          <input placeholder="Search name, phone, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="adm-tabs">
          {['all', 'new', 'contacted', 'done'].map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div className="adm-panel adm-panel-flush">
        {filtered.length === 0 ? <Empty icon="✉" title="No enquiries found" sub="New submissions from the contact form will appear here." /> : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Name</th><th>Service</th><th>Phone</th><th>Status</th><th>Received</th><th></th></tr></thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => { setDetail(q); setNotes(q.notes || ''); }}>
                    <td><div className="adm-row-title">{q.name}</div><div className="adm-row-sub">{q.email || '—'}</div></td>
                    <td><span className="adm-chip">{q.type || 'General'}</span></td>
                    <td>{q.phone}</td>
                    <td><Badge status={q.status} /></td>
                    <td className="adm-muted">{timeAgo(q.createdAt)}</td>
                    <td><div className="adm-cell-actions"><button className="adm-btn adm-btn-sm" onClick={(e) => { e.stopPropagation(); setDetail(q); setNotes(q.notes || ''); }}>View</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Enquiry Details" size="lg"
        footer={detail && (<>
          <button className="adm-btn adm-btn-danger" onClick={() => del(detail.id)}>Delete</button>
          <button className="adm-btn" onClick={() => setDetail(null)}>Close</button>
        </>)}>
        {detail && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
              <Badge status={detail.status} />
              <span className="adm-muted">{new Date(detail.createdAt).toLocaleString()}</span>
            </div>
            <div className="adm-field-row">
              <Field label="Name"><Input value={detail.name} readOnly /></Field>
              <Field label="Phone"><Input value={detail.phone} readOnly /></Field>
            </div>
            <div className="adm-field-row">
              <Field label="Email"><Input value={detail.email || '—'} readOnly /></Field>
              <Field label="Service"><Input value={detail.type || 'General'} readOnly /></Field>
            </div>
            <Field label="Project Details"><Textarea value={detail.details || '—'} readOnly /></Field>
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem' }}>
              {detail.status !== 'new' && <button className="adm-btn adm-btn-sm" onClick={() => setStatus(detail.id, 'new')}>Mark New</button>}
              {detail.status !== 'contacted' && <button className="adm-btn adm-btn-sm" onClick={() => setStatus(detail.id, 'contacted')}>Mark Contacted</button>}
              {detail.status !== 'done' && <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => setStatus(detail.id, 'done')}>Mark Done</button>}
            </div>
            <Field label="Internal Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add private notes about this enquiry…" /></Field>
            <button className="adm-btn adm-btn-sm" onClick={saveNotes}>Save Notes</button>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ============================================================
   GENERIC CRUD (Services, Projects, Testimonials)
   ============================================================ */
function CrudPage({ collection, singular, title, desc, columns, renderForm, seedForm, icon }) {
  const api = useApi();
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const data = await api(`/admin/${collection}`);
    if (data.success) setRows(data.data);
  }, [api, collection]);
  useEffect(() => { load(); }, [load]);

  const save = async (body) => {
    if (isNew) {
      const data = await api(`/admin/${collection}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (data.success) toast(`${singular} created`, 'success');
    } else {
      const data = await api(`/admin/${collection}/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (data.success) toast(`${singular} updated`, 'success');
    }
    setEditing(null); load();
  };
  const remove = async (id) => {
    if (!await confirm({ title: `Delete ${singular}`, message: `This permanently deletes this ${singular.toLowerCase()}.`, danger: true, confirmText: 'Delete' })) return;
    await api(`/admin/${collection}/${id}`, { method: 'DELETE' });
    toast(`${singular} deleted`, 'success'); load();
  };
  const toggle = async (row, key) => {
    await api(`/admin/${collection}/${row.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: !row[key] }) });
    load();
  };

  if (!rows) return <div className="adm-panel"><TableSkeleton /></div>;
  const filtered = rows.filter((r) => !search.trim() || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="adm-page-head">
        <div><h1>{title}</h1><p>{desc}</p></div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => { setEditing(seedForm()); setIsNew(true); }}>+ Add {singular}</button>
        </div>
      </div>
      <div className="adm-toolbar">
        <div className="adm-search">
          <span className="adm-search-ico">⌕</span>
          <input placeholder={`Search ${title.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="adm-panel adm-panel-flush">
        {filtered.length === 0 ? <Empty icon={icon} title={`No ${title.toLowerCase()} yet`} sub={`Click "Add ${singular}" to create one.`} /> : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>{columns.map((c) => <th key={c.key} style={c.w ? { width: c.w } : {}}>{c.label}</th>)}<th style={{ width: 120 }}></th></tr></thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    {columns.map((c) => <td key={c.key}>{c.render ? c.render(row, { toggle, Badge }) : row[c.key] || '—'}</td>)}
                    <td><div className="adm-cell-actions">
                      <button className="adm-btn adm-btn-sm" onClick={() => { setEditing(row); setIsNew(false); }}>Edit</button>
                      <button className="adm-btn adm-btn-sm adm-btn-ghost adm-btn-danger" onClick={() => remove(row.id)}>🗑</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? `Add ${singular}` : `Edit ${singular}`} size="lg"
        footer={editing && (<><button className="adm-btn" onClick={() => setEditing(null)}>Cancel</button><button className="adm-btn adm-btn-primary" onClick={() => save(editing)}>Save</button></>)}>
        {editing && renderForm(editing, setEditing)}
      </Modal>
    </>
  );
}

/* ---------- Services (frontend + backend merged, CRUD on database) ---------- */
function Services() {
  const api = useApi();
  const toast = useToast();
  const confirm = useConfirm();
  const [backendServices, setBackendServices] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => {
    api('/admin/services').then((d) => { if (d.success) setBackendServices(d.data); else setBackendServices([]); });
  };
  useEffect(load, []);

  const allServices = backendServices ? mergeServices(backendServices) : null;

  const startCreate = () => setEditing({
    title: '', slug: '', summary: '', description: '', image: '', icon: '', published: true, order: 0, source: 'database',
  });
  const startEdit = (s) => setEditing({ ...s });
  const cancelEdit = () => setEditing(null);

  const save = async () => {
    if (!editing.title?.trim()) { toast('Title is required', 'error'); return; }
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/admin/services/${editing.id}` : '/admin/services';
    const payload = { ...editing };
    if (payload.id) delete payload.id;
    await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setEditing(null); toast(editing.id ? 'Service updated' : 'Service created', 'success'); load();
  };

  const del = async (s) => {
    const ok = await confirm({ title: 'Delete service', message: `Are you sure you want to delete "${s.title}"?` });
    if (!ok) return;
    await api(`/admin/services/${s.id}`, { method: 'DELETE' });
    toast('Service deleted', 'success'); load();
  };

  const dbServices = allServices ? allServices.filter((s) => s.source === 'database') : [];

  if (!allServices) return <div className="adm-panel"><TableSkeleton /></div>;

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Services</h1><p>Services displayed on your website ({allServices.length} total)</p></div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={startCreate}>+ Add Service</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span className="adm-chip"><strong>{FRONTEND_SERVICES.length}</strong>&nbsp;from frontend</span>
        <span className="adm-chip"><strong>{dbServices.length}</strong>&nbsp;from database</span>
      </div>

      {/* Database services — editable */}
      {dbServices.length > 0 && (
        <div className="adm-panel" style={{ marginBottom: '1rem' }}>
          <div className="adm-panel-head"><h3>Database Services</h3><span className="adm-muted">{dbServices.length} editable</span></div>
          <div className="adm-panel-body">
            <div className="adm-media-grid">
              {dbServices.map((s) => (
                <div key={s.id} className="adm-media-card">
                  <div className="adm-media-img">
                    {s.image ? <img src={s.image} alt={s.title} loading="lazy" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>⚙</div>}
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '.62rem', fontWeight: 600, padding: '.15rem .4rem', borderRadius: 4, background: 'var(--info-soft)', color: 'var(--info)' }}>Database</span>
                  </div>
                  <div className="adm-media-info">
                    <div className="adm-media-name">{s.title}</div>
                    <div className="adm-media-meta">{s.summary}</div>
                  </div>
                  <div className="adm-media-actions">
                    <button onClick={() => setDetail(s)}>View</button>
                    <button onClick={() => startEdit(s)}>Edit</button>
                    <button className="danger" onClick={() => del(s)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Frontend services — read-only table */}
      <div className="adm-panel">
        <div className="adm-panel-head"><h3>Frontend Services</h3><span className="adm-muted">{FRONTEND_SERVICES.length} hardcoded in website</span></div>
        <div className="adm-panel-body">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th></th><th>Service</th><th>Used On</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {allServices.filter((s) => s.source === 'frontend').map((s) => (
                  <tr key={s.id}>
                    <td>{s.image ? <img src={s.image} className="adm-thumb" alt="" /> : <div className="adm-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>⚙</div>}</td>
                    <td>
                      <div className="adm-row-title">{s.title}</div>
                      <div className="adm-row-sub">{s.summary}</div>
                    </td>
                    <td>{s.pages ? s.pages.join(', ') : '—'}</td>
                    <td><Badge status="published">Active</Badge></td>
                    <td><div className="adm-cell-actions">
                      <button className="adm-btn adm-btn-sm" onClick={() => setDetail(s)}>View</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title || 'Service'} size="lg"
        footer={<button className="adm-btn" onClick={() => setDetail(null)}>Close</button>}>
        {detail && (
          <div>
            {detail.image && <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: '1.25rem' }}><img src={detail.image} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} /></div>}
            <div className="adm-field-row">
              <Field label="Service Name"><Input value={detail.title} readOnly /></Field>
              <Field label="Source"><Input value={detail.source === 'frontend' ? 'Frontend (static)' : 'Database'} readOnly /></Field>
            </div>
            <Field label="Summary"><Input value={detail.summary} readOnly /></Field>
            <Field label="Description"><Textarea value={detail.description} readOnly /></Field>
            <Field label="Used On Pages">
              {detail.pages ? (
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                  {detail.pages.map((p) => <span key={p} className="adm-badge published dot">{p}</span>)}
                </div>
              ) : <span className="adm-muted">—</span>}
            </Field>
            {detail.source === 'frontend' && (
              <div style={{ padding: '.5rem .75rem', background: 'var(--warn-soft)', borderRadius: 7, fontSize: '.82rem', color: 'var(--warn)', marginTop: '.5rem' }}>
                ⚠ This service is hardcoded in the frontend. To edit it, modify the frontend source code.
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit modal */}
      <Modal open={!!editing} onClose={cancelEdit} title={editing?.id ? 'Edit Service' : 'Add Service'} size="lg"
        footer={editing && (
          <>
            <button className="adm-btn" onClick={cancelEdit}>Cancel</button>
            <button className="adm-btn adm-btn-primary" onClick={save}>{editing.id ? 'Update' : 'Create'}</button>
          </>
        )}>
        {editing && (
          <div>
            <Field label="Service Title" required><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Bathroom Renovation" /></Field>
            <Field label="Summary"><Input value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} placeholder="Short one-line description" /></Field>
            <Field label="Description"><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Full description of the service" /></Field>
            <ImagePicker value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} label="Service Image" />
            <div className="adm-field-row">
              <Field label="Icon (emoji or text)"><Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="🛁" /></Field>
              <Field label="Display Order"><Input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: +e.target.value })} /></Field>
            </div>
            <label className="adm-checkbox"><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ---------- Projects (frontend + backend merged, CRUD on database) ---------- */
function Projects() {
  const api = useApi();
  const toast = useToast();
  const [backendProjects, setBackendProjects] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null); // { ...row } or null
  const confirm = useConfirm();

  const load = () => {
    api('/admin/projects').then((d) => { if (d.success) setBackendProjects(d.data); else setBackendProjects([]); });
  };
  useEffect(load, []);

  const allProjects = backendProjects ? mergeProjects(backendProjects) : null;

  const startCreate = () => setEditing({
    title: '', category: '', location: '', description: '', image: '', gallery: [],
    featured: false, published: true, source: 'database', page: 'Projects', section: 'Backend Project',
  });
  const startEdit = (p) => setEditing({ ...p });
  const cancelEdit = () => setEditing(null);

  const save = async () => {
    if (!editing.title?.trim()) { toast('Title is required', 'error'); return; }
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/admin/projects/${editing.id}` : '/admin/projects';
    const payload = { ...editing };
    if (payload.id) delete payload.id;
    await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setEditing(null); toast(editing.id ? 'Project updated' : 'Project created', 'success'); load();
  };

  const del = async (p) => {
    const ok = await confirm({ title: 'Delete project', message: `Are you sure you want to delete "${p.title}"? This cannot be undone.` });
    if (!ok) return;
    await api(`/admin/projects/${p.id}`, { method: 'DELETE' });
    toast('Project deleted', 'success'); load();
  };

  const dbProjects = allProjects ? allProjects.filter((p) => p.source === 'database') : [];

  if (!allProjects) return <div className="adm-panel"><TableSkeleton /></div>;

  // Group frontend projects by category
  const feByCategory = {};
  FRONTEND_PROJECTS.forEach((p) => {
    const cat = p.category || 'Other';
    if (!feByCategory[cat]) feByCategory[cat] = [];
    feByCategory[cat].push(p);
  });

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Projects</h1><p>Portfolio and selected work ({allProjects.length} total)</p></div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={startCreate}>+ Add Project</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span className="adm-chip"><strong>{FRONTEND_PROJECTS.length}</strong>&nbsp;from frontend</span>
        <span className="adm-chip"><strong>{dbProjects.length}</strong>&nbsp;from database</span>
      </div>

      {/* Database projects — editable */}
      {dbProjects.length > 0 && (
        <div className="adm-panel" style={{ marginBottom: '1rem' }}>
          <div className="adm-panel-head"><h3>Database Projects</h3><span className="adm-muted">{dbProjects.length} editable</span></div>
          <div className="adm-panel-body">
            <div className="adm-media-grid">
              {dbProjects.map((p) => (
                <div key={p.id} className="adm-media-card">
                  <div className="adm-media-img">
                    {p.image ? <img src={p.image} alt={p.title} loading="lazy" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>▣</div>}
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '.62rem', fontWeight: 600, padding: '.15rem .4rem', borderRadius: 4, background: 'var(--info-soft)', color: 'var(--info)' }}>Database</span>
                  </div>
                  <div className="adm-media-info">
                    <div className="adm-media-name">{p.title}</div>
                    <div className="adm-media-meta">{p.category}{p.location ? ` · ${p.location}` : ''}</div>
                  </div>
                  <div className="adm-media-actions">
                    <button onClick={() => setDetail(p)}>View</button>
                    <button onClick={() => startEdit(p)}>Edit</button>
                    <button className="danger" onClick={() => del(p)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Frontend projects — read-only, grouped by category */}
      {Object.entries(feByCategory).map(([cat, projects]) => (
        <div key={cat} className="adm-panel" style={{ marginBottom: '1rem' }}>
          <div className="adm-panel-head"><h3>{cat}</h3><span className="adm-muted">{projects.length} frontend projects (read-only)</span></div>
          <div className="adm-panel-body">
            <div className="adm-media-grid">
              {projects.map((p) => (
                <div key={p.id} className="adm-media-card" onClick={() => setDetail(p)} style={{ cursor: 'pointer' }}>
                  <div className="adm-media-img">
                    {p.image ? <img src={p.image} alt={p.title} loading="lazy" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>▣</div>}
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '.62rem', fontWeight: 600, padding: '.15rem .4rem', borderRadius: 4, background: 'var(--accent-soft)', color: 'var(--accent)' }}>Frontend</span>
                  </div>
                  <div className="adm-media-info">
                    <div className="adm-media-name">{p.title}</div>
                    <div className="adm-media-meta">{p.page} → {p.section}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* View detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title || 'Project'} size="lg"
        footer={<>
          <button className="adm-btn" onClick={() => setDetail(null)}>Close</button>
          {detail?.source === 'database' && (
            <button className="adm-btn adm-btn-primary" onClick={() => { setEditing({ ...detail }); setDetail(null); }}>Edit</button>
          )}
        </>}>
        {detail && (
          <div>
            {detail.image && <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: '1.25rem' }}><img src={detail.image} alt="" style={{ width: '100%', maxHeight: 350, objectFit: 'cover' }} /></div>}
            {detail.gallery && detail.gallery.length > 0 && (
              <Field label="Gallery">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                  {detail.gallery.map((g, i) => (
                    <img key={i} src={g} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }} />
                  ))}
                </div>
              </Field>
            )}
            <div className="adm-field-row">
              <Field label="Project Name"><Input value={detail.title} readOnly /></Field>
              <Field label="Category"><Input value={detail.category || '—'} readOnly /></Field>
            </div>
            <div className="adm-field-row">
              <Field label="Page"><Input value={detail.page || '—'} readOnly /></Field>
              <Field label="Section"><Input value={detail.section || '—'} readOnly /></Field>
            </div>
            <Field label="Description"><Textarea value={detail.description || '—'} readOnly /></Field>
            <div className="adm-field-row">
              <Field label="Source"><Input value={detail.source === 'frontend' ? 'Frontend (static)' : 'Database'} readOnly /></Field>
              <Field label="Status"><Input value={detail.published ? 'Active' : 'Draft'} readOnly /></Field>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit modal */}
      <Modal open={!!editing} onClose={cancelEdit} title={editing?.id ? 'Edit Project' : 'Add Project'} size="lg"
        footer={editing && (
          <>
            <button className="adm-btn" onClick={cancelEdit}>Cancel</button>
            <button className="adm-btn adm-btn-primary" onClick={save}>{editing.id ? 'Update' : 'Create'}</button>
          </>
        )}>
        {editing && (
          <div>
            <div className="adm-field-row">
              <Field label="Project Title" required><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Modern Bathroom Remodel" /></Field>
              <Field label="Category"><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Bathroom" /></Field>
            </div>
            <div className="adm-field-row">
              <Field label="Location"><Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Edmonton, AB" /></Field>
              <Field label="Featured"><Select value={editing.featured ? '1' : '0'} onChange={(e) => setEditing({ ...editing, featured: e.target.value === '1' })}><option value="0">No</option><option value="1">Yes</option></Select></Field>
            </div>
            <Field label="Description"><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
            <ImagePicker value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} label="Cover Image" />
            {/* Gallery — additional images */}
            <Field label="Gallery Images">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.5rem' }}>
                {(editing.gallery || []).map((g, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)' }}>
                    <img src={g} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, gallery: (editing.gallery || []).filter((_, j) => j !== i) })}
                      style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '.7rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <Input
                  placeholder="Image path or URL"
                  id="gallery-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = e.target.value.trim();
                      if (v) {
                        setEditing({ ...editing, gallery: [...(editing.gallery || []), v] });
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  onClick={() => {
                    const inp = document.getElementById('gallery-input');
                    const v = inp?.value?.trim();
                    if (v) {
                      setEditing({ ...editing, gallery: [...(editing.gallery || []), v] });
                      inp.value = '';
                    }
                  }}
                >Add</button>
              </div>
              <p className="adm-muted" style={{ marginTop: '.25rem' }}>Add image paths (e.g. /images/photo.jpg) or URLs. Press Enter or click Add.</p>
            </Field>
            <label className="adm-checkbox"><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>
          </div>
        )}
      </Modal>

    </>
  );
}

/* ---------- Testimonials (honest empty state) ---------- */
function Testimonials() {
  return (
    <>
      <div className="adm-page-head">
        <div><h1>Testimonials</h1><p>Customer reviews displayed on your website</p></div>
      </div>
      <div className="adm-panel">
        <div className="adm-panel-body">
          <Empty icon="✦" title="No testimonials on the website yet" sub="The frontend has a testimonials section on the Home page, but no testimonials are currently stored. Add testimonials using the form below — they will appear on the website immediately." />
          <div className="adm-divider" />
          <CrudPage collection="testimonials" singular="Testimonial" title="" desc="" icon="✦"
            seedForm={() => ({ name: '', designation: '', image: '', text: '', rating: 5, published: true })}
            columns={[
              { key: 'image', label: '', w: 60, render: (r) => r.image ? <img src={r.image} className="adm-thumb" alt="" /> : <div className="adm-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>☻</div> },
              { key: 'name', label: 'Customer', render: (r) => (<><div className="adm-row-title">{r.name || 'Untitled'}</div><div className="adm-row-sub">{r.designation}</div></>) },
              { key: 'rating', label: 'Rating', render: (r) => <span style={{ color: 'var(--accent)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span> },
              { key: 'published', label: 'Status', render: (r) => <Badge status={r.published ? 'published' : 'draft'}>{r.published ? 'Published' : 'Draft'}</Badge> },
              { key: 'createdAt', label: 'Created', render: (r) => <span className="adm-muted">{timeAgo(r.createdAt)}</span> },
            ]}
            renderForm={(row, set) => (
              <>
                <div className="adm-field-row">
                  <Field label="Customer Name" required><Input value={row.name} onChange={(e) => set({ ...row, name: e.target.value })} /></Field>
                  <Field label="Designation"><Input value={row.designation} onChange={(e) => set({ ...row, designation: e.target.value })} placeholder="Homeowner, Edmonton" /></Field>
                </div>
                <Field label="Testimonial" required><Textarea value={row.text} onChange={(e) => set({ ...row, text: e.target.value })} /></Field>
                <div className="adm-field-row">
                  <Field label="Rating (1-5)"><Select value={row.rating} onChange={(e) => set({ ...row, rating: +e.target.value })}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}</Select></Field>
                  <Field label="Published"><Select value={row.published ? '1' : '0'} onChange={(e) => set({ ...row, published: e.target.value === '1' })}><option value="1">Yes</option><option value="0">No</option></Select></Field>
                </div>
                <ImagePicker value={row.image} onChange={(v) => set({ ...row, image: v })} label="Profile Image" />
              </>
            )}
          />
        </div>
      </div>
    </>
  );
}

/* ============================================================
   WEBSITE IMAGES — page → section → image explorer
   ============================================================ */
function WebsiteImages() {
  const api = useApi();
  const toast = useToast();
  const confirm = useConfirm();
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [extras, setExtras] = useState({});
  const [preview, setPreview] = useState(null);
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replaceUrl, setReplaceUrl] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ src: '', label: '', text: '' });
  const uploadRef = useRef(null);
  const addUploadRef = useRef(null);
  const API = (window.__ADM_API__ || '').replace(/\/api$/, '');
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    api('/admin/image-overrides').then((d) => { if (d.success) setOverrides(d.data || {}); });
    api('/admin/image-extras').then((d) => { if (d.success) setExtras(d.data || {}); });
  }, []);

  const saveOverride = async (key, url) => {
    const next = { ...overrides, [key]: url };
    await api('/admin/image-overrides', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    setOverrides(next); toast('Image replaced — live on website', 'success');
  };
  const removeOverride = async (key) => {
    const next = { ...overrides }; delete next[key];
    await api('/admin/image-overrides', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    setOverrides(next); toast('Reverted to original', 'success');
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    setUploading(true);
    const fd = new FormData(); fd.append('image', file);
    try {
      const res = await fetch(`${window.__ADM_API__}/admin/images`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.success) return `${API}${data.image.url}`;
      toast('Upload failed', 'error');
    } catch { toast('Upload failed', 'error'); }
    setUploading(false);
    return null;
  };

  const sectionKey = (page, section) => `${page.page}|${section.id}`;
  const sectionExtras = selectedPage && selectedSection ? (extras[sectionKey(selectedPage, selectedSection)]?.items || []) : [];

  const addExtra = async () => {
    if (!addForm.src.trim()) return;
    const key = sectionKey(selectedPage, selectedSection);
    const anchor = selectedSection.images.find((i) => i.src)?.src || '';
    const cur = extras[key] || { anchor, items: [] };
    const next = { ...extras, [key]: { anchor, items: [...cur.items, { src: addForm.src.trim(), label: addForm.label.trim(), text: addForm.text.trim() }] } };
    await api('/admin/image-extras', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    setExtras(next); setAddOpen(false); setAddForm({ src: '', label: '', text: '' });
    toast('Image added — live on website', 'success');
  };
  const removeExtra = async (idx) => {
    if (!await confirm({ title: 'Remove added image', message: 'This removes the extra image from the website section.', danger: true, confirmText: 'Remove' })) return;
    const key = sectionKey(selectedPage, selectedSection);
    const cur = extras[key];
    const next = { ...extras, [key]: { ...cur, items: cur.items.filter((_, i) => i !== idx) } };
    await api('/admin/image-extras', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    setExtras(next); toast('Extra image removed', 'success');
  };

  // Filter pages by search
  const filteredPages = WEBSITE_IMAGE_MAP.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.page.toLowerCase().includes(q) || p.sections.some((s) => s.name.toLowerCase().includes(q) || s.images.some((i) => (i.src || '').toLowerCase().includes(q) || (i.label || '').toLowerCase().includes(q)));
  });

  const totalImages = getAllMappedImages().length;
  const overriddenCount = Object.keys(overrides).length;

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Website Images</h1><p>See exactly where every image is used on your website</p></div>
        <div className="adm-page-actions">
          <span className="adm-chip">{totalImages} images mapped</span>
          <span className="adm-chip">{overriddenCount} replaced</span>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <span className="adm-search-ico">⌕</span>
          <input placeholder="Search pages, sections, images…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {(selectedPage || selectedSection) && (
          <button className="adm-btn adm-btn-sm" onClick={() => { setSelectedPage(null); setSelectedSection(null); }}>← All pages</button>
        )}
      </div>

      {/* Breadcrumb */}
      {(selectedPage || selectedSection) && (
        <div style={{ marginBottom: '1rem', fontSize: '.85rem', color: 'var(--muted)' }}>
          <button className="adm-link" onClick={() => { setSelectedPage(null); setSelectedSection(null); }}>Website Images</button>
          {selectedPage && <> › <button className="adm-link" onClick={() => setSelectedSection(null)}>{selectedPage.page}</button></>}
          {selectedSection && <> › <b style={{ color: 'var(--text)' }}>{selectedSection.name}</b></>}
        </div>
      )}

      {/* LEVEL 1: Page list */}
      {!selectedPage && (
        <div className="adm-grid-2">
          {filteredPages.map((page) => {
            const imgCount = page.sections.reduce((n, s) => n + s.images.filter((i) => i.src).length, 0);
            return (
              <div key={page.page} className="adm-panel" style={{ cursor: 'pointer' }} onClick={() => { setSelectedPage(page); setSelectedSection(null); }}>
                <div className="adm-panel-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: 'var(--accent)' }}>▦</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{page.page}</div>
                    <div className="adm-muted">{page.sections.length} sections · {imgCount} images</div>
                  </div>
                  <span style={{ color: 'var(--muted)' }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEVEL 2: Section list within a page */}
      {selectedPage && !selectedSection && (
        <div className="adm-grid-2">
          {selectedPage.sections.map((section) => {
            const imgs = section.images.filter((i) => i.src);
            return (
              <div key={section.id} className="adm-panel" style={{ cursor: 'pointer' }} onClick={() => setSelectedSection(section)}>
                <div className="adm-panel-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                    <span className="adm-badge published dot">{section.type}</span>
                    <div style={{ fontWeight: 600, flex: 1 }}>{section.name}</div>
                    <span className="adm-muted">{imgs.length} img{imgs.length !== 1 ? 's' : ''}</span>
                  </div>
                  {imgs.length > 0 ? (
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                      {imgs.slice(0, 5).map((img, i) => (
                        <div key={i} style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                          <img src={overrides[img.src] || img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                          {overrides[img.src] && <span style={{ position: 'absolute', bottom: 2, right: 2, fontSize: '.5rem', background: 'var(--accent)', color: '#fff', padding: '1px 3px', borderRadius: 3 }}>R</span>}
                        </div>
                      ))}
                      {imgs.length > 5 && <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '.8rem' }}>+{imgs.length - 5}</div>}
                    </div>
                  ) : (
                    <div className="adm-muted" style={{ fontSize: '.82rem' }}>Dynamic from backend (no static images)</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEVEL 3: Images within a section */}
      {selectedPage && selectedSection && (
        <div className="adm-panel">
          <div className="adm-panel-head">
            <h3>{selectedSection.name}</h3>
            <span className="adm-muted">{selectedPage.page} · {selectedSection.type}</span>
            <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => { setAddForm({ src: '', label: '', text: '' }); setAddOpen(true); }}>+ Add Image</button>
          </div>
          <div className="adm-panel-body">
            {selectedSection.images.filter((i) => i.src).length === 0 && sectionExtras.length === 0 ? (
              <Empty icon="▦" title="No static images" sub="This section uses dynamic images from the backend." />
            ) : (
              <div className="adm-media-grid">
                {selectedSection.images.filter((i) => i.src).map((img, i) => {
                  const displaySrc = overrides[img.src] || img.src;
                  const isOverridden = !!overrides[img.src];
                  return (
                    <div key={i} className="adm-media-card">
                      <div className="adm-media-img" style={{ cursor: 'pointer' }} onClick={() => setPreview({ ...img, displaySrc, isOverridden, page: selectedPage.page, section: selectedSection.name })}>
                        <img src={displaySrc} alt={img.label} loading="lazy" onError={(e) => { e.target.style.opacity = .3; }} />
                        {isOverridden && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: '.62rem', fontWeight: 600, padding: '.15rem .4rem', borderRadius: 4, background: 'var(--accent)', color: '#fff' }}>Replaced</span>}
                      </div>
                      <div className="adm-media-info">
                        <div className="adm-media-name">{img.label}</div>
                        <div className="adm-media-meta">Position {img.position} · {img.source}</div>
                      </div>
                      <div className="adm-media-actions">
                        <button onClick={() => setPreview({ ...img, displaySrc, isOverridden, page: selectedPage.page, section: selectedSection.name })}>Details</button>
                        <button onClick={() => { setReplaceTarget(img); setReplaceUrl(overrides[img.src] || ''); }}>Replace</button>
                        {isOverridden && <button className="danger" onClick={() => removeOverride(img.src)}>Revert</button>}
                      </div>
                    </div>
                  );
                })}
                {/* Extra images added by admin */}
                {sectionExtras.map((item, i) => (
                  <div key={`ex-${i}`} className="adm-media-card">
                    <div className="adm-media-img" style={{ cursor: 'pointer' }} onClick={() => setPreview({ src: item.src, displaySrc: item.src, label: item.label || 'Added image', position: '-', source: 'admin', refType: 'img', isOverridden: false, page: selectedPage.page, section: selectedSection.name })}>
                      <img src={item.src} alt={item.label} loading="lazy" onError={(e) => { e.target.style.opacity = .3; }} />
                      <span style={{ position: 'absolute', top: 6, right: 6, fontSize: '.62rem', fontWeight: 600, padding: '.15rem .4rem', borderRadius: 4, background: 'var(--ok)', color: '#fff' }}>Added</span>
                    </div>
                    <div className="adm-media-info">
                      <div className="adm-media-name">{item.label || 'Added image'}</div>
                      <div className="adm-media-meta">Extra · admin</div>
                    </div>
                    <div className="adm-media-actions">
                      <button className="danger" onClick={() => removeExtra(i)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.label || 'Image'} size="lg"
        footer={preview && (
          <>
            <button className="adm-btn" onClick={() => { navigator.clipboard.writeText(preview.displaySrc); toast('URL copied', 'success'); }}>Copy URL</button>
            <a className="adm-btn" href={preview.displaySrc} target="_blank" rel="noreferrer">Open Original</a>
            <button className="adm-btn" onClick={() => setPreview(null)}>Close</button>
          </>
        )}>
        {preview && (
          <div>
            <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: '1.25rem', background: 'var(--surface-2)' }}>
              <img src={preview.displaySrc} alt={preview.label} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block' }} />
            </div>
            <div className="adm-field-row">
              <Field label="Page"><Input value={preview.page} readOnly /></Field>
              <Field label="Section"><Input value={preview.section} readOnly /></Field>
            </div>
            <div className="adm-field-row">
              <Field label="Position"><Input value={`Image ${preview.position}`} readOnly /></Field>
              <Field label="Source"><Input value={preview.source} readOnly /></Field>
            </div>
            <Field label="Original Path"><Input value={preview.src} readOnly /></Field>
            {preview.isOverridden && <Field label="Current (Overridden)"><Input value={preview.displaySrc} readOnly /></Field>}
            <Field label="Reference Type">
              <span className="adm-chip">{preview.refType === 'img' ? '<img> tag' : preview.refType === 'css' ? 'CSS background' : preview.refType === 'css-inline' ? 'Inline style' : preview.refType === 'api' ? 'API response' : 'Unknown'}</span>
            </Field>
            {preview.isOverridden && (
              <div style={{ padding: '.5rem .75rem', background: 'var(--accent-soft)', borderRadius: 7, fontSize: '.82rem', color: 'var(--accent)', marginTop: '.5rem' }}>
                ✓ This image has been replaced. The website now shows the replacement. Click "Revert" to restore the original.
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Replace modal */}
      <Modal open={!!replaceTarget} onClose={() => setReplaceTarget(null)} title="Replace Image"
        footer={replaceTarget && (
          <>
            <button className="adm-btn" onClick={() => setReplaceTarget(null)}>Cancel</button>
            <button className="adm-btn adm-btn-primary" onClick={() => { saveOverride(replaceTarget.src, replaceUrl); setReplaceTarget(null); }} disabled={!replaceUrl.trim()}>Save Replacement</button>
          </>
        )}>
        {replaceTarget && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1 }}>
                <div className="adm-muted" style={{ fontSize: '.78rem', marginBottom: '.4rem' }}>Current (Original)</div>
                <div style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--surface-2)' }}>
                  <img src={replaceTarget.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="adm-muted" style={{ fontSize: '.72rem', marginTop: '.3rem' }}>{replaceTarget.src}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="adm-muted" style={{ fontSize: '.78rem', marginBottom: '.4rem' }}>New (Replacement)</div>
                <div style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--surface-2)' }}>
                  {replaceUrl ? <img src={replaceUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.opacity = .3; }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>No URL set</div>}
                </div>
              </div>
            </div>
            <Field label="Replacement Image URL" hint="Upload a new image from your computer, or paste a URL from Media Library (Copy URL button) or any public image URL.">
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <Input value={replaceUrl} onChange={(e) => setReplaceUrl(e.target.value)} placeholder="https://… or /uploads/…" style={{ flex: 1 }} />
                <button type="button" className="adm-btn" onClick={() => uploadRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </Field>
            <input ref={uploadRef} type="file" accept="image/*" hidden onChange={async (e) => { const u = await uploadFile(e.target.files[0]); if (u) { setReplaceUrl(u); toast('Uploaded', 'success'); } e.target.value = ''; }} />
            <div style={{ padding: '.5rem .75rem', background: 'var(--warn-soft)', borderRadius: 7, fontSize: '.82rem', color: 'var(--warn)' }}>
              ⚠ The original file is not modified. You can revert anytime.
            </div>
          </div>
        )}
      </Modal>

      {/* Add Image modal — appends a new card to the section on the live site */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Image to Section"
        footer={addOpen && (
          <>
            <button className="adm-btn" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="adm-btn adm-btn-primary" onClick={addExtra} disabled={!addForm.src.trim()}>Add to Website</button>
          </>
        )}>
        {addOpen && (
          <div>
            <div style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--surface-2)', marginBottom: '1rem', maxWidth: 320 }}>
              {addForm.src ? <img src={addForm.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.opacity = .3; }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>No image</div>}
            </div>
            <Field label="Image" required hint="Upload from your computer or paste an image URL.">
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <Input value={addForm.src} onChange={(e) => setAddForm({ ...addForm, src: e.target.value })} placeholder="https://… or /uploads/…" style={{ flex: 1 }} />
                <button type="button" className="adm-btn" onClick={() => addUploadRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </Field>
            <input ref={addUploadRef} type="file" accept="image/*" hidden onChange={async (e) => { const u = await uploadFile(e.target.files[0]); if (u) { setAddForm((f) => ({ ...f, src: u })); toast('Uploaded', 'success'); } e.target.value = ''; }} />
            <Field label="Title" hint="Optional — replaces the card heading on the website.">
              <Input value={addForm.label} onChange={(e) => setAddForm({ ...addForm, label: e.target.value })} placeholder="e.g. Fireplace Tile" />
            </Field>
            <Field label="Description" hint="Optional — replaces the card text on the website.">
              <Textarea rows={2} value={addForm.text} onChange={(e) => setAddForm({ ...addForm, text: e.target.value })} placeholder="Short description shown under the title" />
            </Field>
            <div style={{ padding: '.5rem .75rem', background: 'var(--accent-soft)', borderRadius: 7, fontSize: '.82rem', color: 'var(--accent)' }}>
              ✓ The new image card appears at the end of this section on the live website.
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ============================================================
   GALLERY (uses projects as source — featured projects)
   ============================================================ */
function Gallery({ go }) {
  const api = useApi();
  const [backendProjects, setBackendProjects] = useState(null);
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState(null);

  useEffect(() => { api('/admin/projects').then((d) => setBackendProjects(d.success ? d.data : [])); }, []);
  const gallery = backendProjects ? getAllGalleryImages(backendProjects) : null;
  if (!gallery) return <div className="adm-panel"><TableSkeleton /></div>;

  const categories = [...new Set(gallery.map((g) => g.category))];
  const filtered = filter === 'all' ? gallery : gallery.filter((g) => g.category === filter);

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Gallery</h1><p>All images used across the website ({gallery.length} images)</p></div>
        <button className="adm-btn" onClick={() => go('projects')}>Manage Projects →</button>
      </div>

      <div className="adm-toolbar">
        <div className="adm-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({gallery.length})</button>
          {categories.map((cat) => (
            <button key={cat} className={filter === cat ? 'active' : ''} onClick={() => setFilter(cat)}>{cat} ({gallery.filter((g) => g.category === cat).length})</button>
          ))}
        </div>
      </div>

      <div className="adm-panel">
        <div className="adm-panel-body">
          <div className="adm-media-grid">
            {filtered.map((img) => (
              <div key={img.id} className="adm-media-card" onClick={() => setPreview(img)} style={{ cursor: 'pointer' }}>
                <div className="adm-media-img">
                  <img src={img.image} alt={img.title} loading="lazy" onError={(e) => { e.target.style.opacity = .3; }} />
                </div>
                <div className="adm-media-info">
                  <div className="adm-media-name">{img.title}</div>
                  <div className="adm-media-meta">{img.page} → {img.section}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title || 'Image'}
        footer={<button className="adm-btn" onClick={() => setPreview(null)}>Close</button>}>
        {preview && (
          <div>
            <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: '1.25rem' }}><img src={preview.image} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }} /></div>
            <div className="adm-field-row">
              <Field label="Title"><Input value={preview.title} readOnly /></Field>
              <Field label="Category"><Input value={preview.category} readOnly /></Field>
            </div>
            <div className="adm-field-row">
              <Field label="Page"><Input value={preview.page} readOnly /></Field>
              <Field label="Section"><Input value={preview.section} readOnly /></Field>
            </div>
            <Field label="Image Path"><Input value={preview.image} readOnly /></Field>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ============================================================
   MEDIA LIBRARY
   ============================================================ */
/* ============================================================
   MEDIA LIBRARY (static + uploaded + external)
   ============================================================ */
function Media() {
  const api = useApi();
  const toast = useToast();
  const confirm = useConfirm();
  const [uploaded, setUploaded] = useState(null);
  const [staticImages, setStaticImages] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [usageFilter, setUsageFilter] = useState('all');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    const data = await api('/admin/images');
    if (data.success) setUploaded(data.images);
  }, [api]);
  useEffect(() => {
    load();
    fetch('/images-manifest.json').then((r) => r.json()).then(setStaticImages).catch(() => setStaticImages([]));
  }, [load]);

  const upload = async (files) => {
    if (!files || !files.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData(); fd.append('image', file);
      await api('/admin/images', { method: 'POST', body: fd });
    }
    setUploading(false); toast('Upload complete', 'success'); load();
  };

  const delUploaded = async (name) => {
    if (!await confirm({ title: 'Delete uploaded image', message: 'This permanently deletes the image from the server.', danger: true, confirmText: 'Delete' })) return;
    await api(`/admin/images/${name}`, { method: 'DELETE' });
    toast('Image deleted', 'success'); load();
  };

  const copyUrl = (url) => { navigator.clipboard.writeText(url); toast('URL copied', 'success'); };

  // Build unified image list
  const allImages = [];
  if (staticImages) staticImages.forEach((img) => {
    const usage = getUsage(img.name);
    allImages.push({
      key: `static:${img.name}`,
      name: img.name,
      url: img.path,
      size: img.size,
      source: 'static',
      sourceLabel: 'Static Asset',
      usage,
      used: usage.length > 0,
      deletable: false,
    });
  });
  if (uploaded) uploaded.forEach((img) => {
    allImages.push({
      key: `uploaded:${img.name}`,
      name: img.name,
      url: `${API_ORIGIN}${img.url}`,
      size: img.size,
      source: 'uploaded',
      sourceLabel: 'Uploaded',
      uploadedAt: img.uploadedAt,
      usage: [],
      used: false,
      deletable: true,
    });
  });
  EXTERNAL_IMAGES.forEach((ext, i) => {
    allImages.push({
      key: `external:${i}`,
      name: ext.url.split('/').pop().split('?')[0] || 'external',
      url: ext.url,
      size: null,
      source: 'external',
      sourceLabel: 'External (Unsplash)',
      usage: [{ page: ext.page, section: ext.section, type: ext.type }],
      used: true,
      deletable: false,
    });
  });

  // Apply filters
  const filtered = allImages.filter((img) => {
    if (sourceFilter !== 'all' && img.source !== sourceFilter) return false;
    if (usageFilter === 'used' && !img.used) return false;
    if (usageFilter === 'unused' && img.used) return false;
    if (search.trim() && !img.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: allImages.length,
    static: allImages.filter((i) => i.source === 'static').length,
    uploaded: allImages.filter((i) => i.source === 'uploaded').length,
    external: allImages.filter((i) => i.source === 'external').length,
    used: allImages.filter((i) => i.used).length,
    unused: allImages.filter((i) => !i.used).length,
  };

  const loading = !uploaded || !staticImages;

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Media Library</h1><p>All website images — static assets, uploads, and external</p></div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => fileRef.current?.click()}>+ Upload</button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span className="adm-chip"><strong>{counts.all}</strong>&nbsp;total</span>
        <span className="adm-chip">Static: {counts.static}</span>
        <span className="adm-chip">Uploaded: {counts.uploaded}</span>
        <span className="adm-chip">External: {counts.external}</span>
        <span className="adm-chip">Used: {counts.used}</span>
        <span className="adm-chip">Unused: {counts.unused}</span>
      </div>

      {/* Upload zone */}
      <div className={`adm-dropzone ${drag ? 'over' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }} onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
        <div className="adm-drop-ico">⬆</div>
        <p>{uploading ? 'Uploading…' : 'Click or drag images to upload'}</p>
        <span>JPG, PNG, WebP · max 15MB</span>
      </div>

      {/* Filters */}
      <div className="adm-toolbar">
        <div className="adm-search">
          <span className="adm-search-ico">⌕</span>
          <input placeholder="Search by filename…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="adm-tabs">
          {[['all', 'All'], ['static', 'Static'], ['uploaded', 'Uploaded'], ['external', 'External']].map(([v, l]) => (
            <button key={v} className={sourceFilter === v ? 'active' : ''} onClick={() => setSourceFilter(v)}>{l}</button>
          ))}
        </div>
        <div className="adm-tabs">
          {[['all', 'All'], ['used', 'Used'], ['unused', 'Unused']].map(([v, l]) => (
            <button key={v} className={usageFilter === v ? 'active' : ''} onClick={() => setUsageFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="adm-panel">
        <div className="adm-panel-body">
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={180} r={10} />)}
            </div>
          ) : filtered.length === 0 ? (
            <Empty icon="☵" title="No images found" sub="Try adjusting your filters." />
          ) : (
            <div className="adm-media-grid">
              {filtered.map((img) => (
                <div key={img.key} className="adm-media-card" onClick={() => setPreview(img)} style={{ cursor: 'pointer' }}>
                  <div className="adm-media-img">
                    <img src={img.url} alt={img.name} loading="lazy" onError={(e) => { e.target.style.opacity = .3; e.target.style.background = 'var(--surface-2)'; }} />
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '.62rem', fontWeight: 600, padding: '.15rem .4rem', borderRadius: 4, background: img.source === 'static' ? 'var(--accent-soft)' : img.source === 'uploaded' ? 'var(--info-soft)' : '#f4f4f5', color: img.source === 'static' ? 'var(--accent)' : img.source === 'uploaded' ? 'var(--info)' : 'var(--muted)' }}>{img.sourceLabel}</span>
                    {img.used && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: '.62rem', fontWeight: 600, padding: '.15rem .4rem', borderRadius: 4, background: 'var(--success-soft)', color: 'var(--success)' }}>Used</span>}
                  </div>
                  <div className="adm-media-info">
                    <div className="adm-media-name" title={img.name}>{img.name}</div>
                    <div className="adm-media-meta">
                      {img.size ? fmtSize(img.size) : '—'} · {img.usage.length} usage{img.usage.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name || 'Image'} size="lg"
        footer={preview && (
          <>
            <button className="adm-btn" onClick={() => copyUrl(preview.url)}>Copy URL</button>
            <a className="adm-btn" href={preview.url} target="_blank" rel="noreferrer">Open Original</a>
            {preview.deletable && <button className="adm-btn adm-btn-danger" onClick={() => { delUploaded(preview.name); setPreview(null); }}>Delete</button>}
            <button className="adm-btn" onClick={() => setPreview(null)}>Close</button>
          </>
        )}>
        {preview && (
          <div>
            <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: '1.25rem', background: 'var(--surface-2)' }}>
              <img src={preview.url} alt={preview.name} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block' }} />
            </div>
            <div className="adm-field-row">
              <Field label="File Name"><Input value={preview.name} readOnly /></Field>
              <Field label="Source"><Input value={preview.sourceLabel} readOnly /></Field>
            </div>
            <div className="adm-field-row">
              <Field label="URL"><Input value={preview.url} readOnly /></Field>
              <Field label="File Size"><Input value={preview.size ? fmtSize(preview.size) : 'External'} readOnly /></Field>
            </div>
            <Field label="Usage Locations">
              {preview.usage.length === 0 ? (
                <div className="adm-muted" style={{ padding: '.5rem 0' }}>This image is not currently referenced by any frontend page. It may be unused or reserved for future use.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  {preview.usage.map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .75rem', background: 'var(--surface-2)', borderRadius: 7, fontSize: '.85rem' }}>
                      <span className="adm-badge published dot">{u.page}</span>
                      <span style={{ color: 'var(--text-2)' }}>{u.section}</span>
                      <span className="adm-chip" style={{ marginLeft: 'auto' }}>{u.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </Field>
            {!preview.deletable && preview.source === 'static' && (
              <div className="adm-muted" style={{ fontSize: '.82rem', padding: '.5rem .75rem', background: 'var(--warn-soft)', borderRadius: 7, marginTop: '.5rem' }}>
                ⚠ Static assets cannot be deleted from the admin panel — they are part of the codebase. Remove the file from <code>public/images/</code> and redeploy to delete.
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

/* ============================================================
   SEO
   ============================================================ */
function SEO() {
  const api = useApi();
  const toast = useToast();
  const [seo, setSeo] = useState(null);
  const [page, setPage] = useState('home');
  useEffect(() => { api('/admin/seo').then((d) => setSeo(d.data || {})); }, []);
  if (!seo) return <div className="adm-panel"><div className="adm-panel-body"><Skeleton h={200} /></div></div>;
  const pages = ['home', 'about', 'services', 'residential', 'philosophy', 'contact'];
  const cur = seo[page] || {};
  const save = async () => {
    const next = { ...seo, [page]: cur };
    await api('/admin/seo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    setSeo(next); toast('SEO saved', 'success');
  };
  return (
    <>
      <div className="adm-page-head"><div><h1>SEO</h1><p>Manage meta tags for each page</p></div></div>
      <div className="adm-tabs" style={{ marginBottom: '1.25rem' }}>
        {pages.map((p) => <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)} style={{ textTransform: 'capitalize' }}>{p}</button>)}
      </div>
      <div className="adm-grid-2">
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>Meta Information</h3></div>
          <div className="adm-panel-body">
            <Field label="Meta Title"><Input value={cur.title || ''} onChange={(e) => setSeo({ ...seo, [page]: { ...cur, title: e.target.value } })} placeholder="Renovate Max2Max Inc." /></Field>
            <Field label="Meta Description"><Textarea value={cur.description || ''} onChange={(e) => setSeo({ ...seo, [page]: { ...cur, description: e.target.value } })} placeholder="Professional renovation services in Edmonton…" /></Field>
            <Field label="Keywords"><Input value={cur.keywords || ''} onChange={(e) => setSeo({ ...seo, [page]: { ...cur, keywords: e.target.value } })} placeholder="renovation, tile, edmonton" /></Field>
            <Field label="OG Image URL"><Input value={cur.ogImage || ''} onChange={(e) => setSeo({ ...seo, [page]: { ...cur, ogImage: e.target.value } })} placeholder="/images/logo.png" /></Field>
            <button className="adm-btn adm-btn-primary" onClick={save}>Save SEO</button>
          </div>
        </div>
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>Search Preview</h3></div>
          <div className="adm-panel-body">
            <div style={{ fontFamily: 'Arial', border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', background: '#fff' }}>
              <div style={{ fontSize: '.78rem', color: '#202124' }}>https://renovate-max-2-max-inc.vercel.app</div>
              <div style={{ fontSize: '1.1rem', color: '#1a0dab', marginTop: '.2rem' }}>{cur.title || 'Renovate Max2Max Inc.'}</div>
              <div style={{ fontSize: '.82rem', color: '#4d5156', marginTop: '.15rem' }}>{cur.description || 'Professional tile installation, bathroom upgrades, custom showers, waterproofing, kitchen backsplashes, flooring and renovation services in Edmonton, Alberta.'}</div>
            </div>
            <p className="adm-muted" style={{ marginTop: '1rem' }}>This is approximately how your page appears in Google search results.</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SETTINGS
   ============================================================ */
function Settings() {
  const api = useApi();
  const toast = useToast();
  const [s, setS] = useState(null);
  useEffect(() => { api('/admin/settings').then((d) => setS(d.data || {})); }, []);
  if (!s) return <div className="adm-panel"><div className="adm-panel-body"><Skeleton h={200} /></div></div>;
  const save = async () => { await api('/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); toast('Settings saved', 'success'); };
  return (
    <>
      <div className="adm-page-head"><div><h1>Settings</h1><p>Manage your website configuration</p></div>
        <button className="adm-btn adm-btn-primary" onClick={save}>Save Changes</button></div>
      <div className="adm-grid-2">
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>General</h3></div>
          <div className="adm-panel-body">
            <Field label="Website Name"><Input value={s.siteName || ''} onChange={(e) => setS({ ...s, siteName: e.target.value })} /></Field>
            <Field label="Tagline"><Input value={s.tagline || ''} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></Field>
            <Field label="Logo URL"><Input value={s.logo || ''} onChange={(e) => setS({ ...s, logo: e.target.value })} placeholder="/images/logo.png" /></Field>
          </div>
        </div>
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>Contact</h3></div>
          <div className="adm-panel-body">
            <Field label="Phone"><Input value={s.phone || ''} onChange={(e) => setS({ ...s, phone: e.target.value })} placeholder="437-869-8609" /></Field>
            <Field label="Email"><Input value={s.email || ''} onChange={(e) => setS({ ...s, email: e.target.value })} placeholder="Renovatemax2max@gmail.com" /></Field>
            <Field label="Address"><Input value={s.address || ''} onChange={(e) => setS({ ...s, address: e.target.value })} placeholder="Edmonton, Alberta" /></Field>
          </div>
        </div>
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>Social</h3></div>
          <div className="adm-panel-body">
            <Field label="Instagram"><Input value={s.instagram || ''} onChange={(e) => setS({ ...s, instagram: e.target.value })} /></Field>
            <Field label="Facebook"><Input value={s.facebook || ''} onChange={(e) => setS({ ...s, facebook: e.target.value })} /></Field>
            <Field label="WhatsApp"><Input value={s.whatsapp || ''} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} /></Field>
          </div>
        </div>
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>Security</h3></div>
          <div className="adm-panel-body">
            <p className="adm-muted">Admin password is managed via the <code>ADMIN_PASSWORD</code> environment variable on your hosting provider (Render). Change it there to update login credentials.</p>
            <div className="adm-divider" />
            <Field label="Current Session"><Input value="Active · single-admin" readOnly /></Field>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   ACTIVITY LOGS
   ============================================================ */
function Activity() {
  const api = useApi();
  const [logs, setLogs] = useState(null);
  useEffect(() => { api('/admin/activity').then((d) => d.success && setLogs(d.data)); }, []);
  if (!logs) return <div className="adm-panel"><TableSkeleton /></div>;
  return (
    <>
      <div className="adm-page-head"><div><h1>Activity Logs</h1><p>Recent admin actions</p></div></div>
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 0 }}>
          {logs.length === 0 ? <Empty icon="⏱" title="No activity yet" /> : logs.map((a) => (
            <div key={a.id} className="adm-act" style={{ padding: '.85rem 1.25rem' }}>
              <div className="adm-act-ico">{actIcon(a.action)}</div>
              <div className="adm-act-body">
                <div className="adm-act-title">{actLabel(a.action)}{a.label ? ` · ${a.label}` : ''}</div>
                <div className="adm-act-meta">{new Date(a.at).toLocaleString()} · {timeAgo(a.at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   USERS (single-admin — shows profile)
   ============================================================ */
function Users() {
  return (
    <>
      <div className="adm-page-head"><div><h1>Users</h1><p>Admin account management</p></div></div>
      <div className="adm-panel">
        <div className="adm-panel-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="adm-avatar" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>A</div>
            <div><div style={{ fontWeight: 600, fontSize: '1rem' }}>Administrator</div><div className="adm-muted">Super Admin · Single-admin mode</div></div>
          </div>
          <div className="adm-divider" />
          <p className="adm-muted">This deployment uses single-admin authentication. To enable multiple users with roles (Super Admin, Admin, Editor), the backend would need user accounts, JWT sessions, and a permissions system. That's available as a future upgrade.</p>
          <div className="adm-divider" />
          <Field label="Role"><Input value="Super Admin (full access)" readOnly /></Field>
          <Field label="Last Login"><Input value={new Date().toLocaleString()} readOnly /></Field>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SERVICE PAGE IMAGES — add/remove gallery images per service page
   ============================================================ */
function ServiceImages() {
  const api = useApi();
  const toast = useToast();
  const confirm = useConfirm();
  const [selected, setSelected] = useState(null);
  const [managed, setManaged] = useState({});
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [projects, setProjects] = useState([]);
  const uploadRef = useRef(null);
  const API = (window.__ADM_API__ || '').replace(/\/api$/, '');
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    api('/admin/service-images').then((d) => { if (d.success) setManaged(d.data || {}); });
    api('/admin/projects').then((d) => { if (d.success) setProjects(d.data || []); });
  }, []);

  const persist = async (next) => {
    await api('/admin/service-images', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    setManaged(next);
  };

  const getGallery = (svc) => {
    const m = managed[svc.slug] || { added: [], removed: [] };
    const removed = new Set(m.removed || []);
    const base = Array.isArray(m.images) ? m.images : svc.images;
    const apiImgs = projects.filter((p) => svc.categories.some((c) => (p.category || '').toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes((p.category || '').toLowerCase()))).map((p) => p.image).filter(Boolean);
    return {
      hero: m.hero || svc.hero,
      images: [...new Set([...apiImgs, ...base, ...(m.added || [])])].filter((i) => !removed.has(i)),
      removed: m.removed || [],
      addedCount: (m.added || []).length,
    };
  };

  const setHero = async (src) => {
    if (!selected) return;
    const m = managed[selected.slug] || { added: [], removed: [] };
    await persist({ ...managed, [selected.slug]: { ...m, hero: src } });
    toast('Hero image updated', 'success');
  };

  const addImage = async (src) => {
    if (!src || !selected) return;
    const m = managed[selected.slug] || { added: [], removed: [] };
    // If it was previously removed, un-remove instead
    const removed = (m.removed || []).filter((r) => r !== src);
    const added = [...(m.added || []), src].filter((v, i, a) => a.indexOf(v) === i);
    await persist({ ...managed, [selected.slug]: { added, removed } });
    toast('Image added to service page', 'success');
  };

  const removeImage = async (src) => {
    if (!selected) return;
    if (!await confirm({ title: 'Remove image', message: 'This hides the image from the service page gallery.', danger: true, confirmText: 'Remove' })) return;
    const m = managed[selected.slug] || { added: [], removed: [] };
    const added = (m.added || []).filter((a) => a !== src);
    const removed = [...new Set([...(m.removed || []), src])];
    await persist({ ...managed, [selected.slug]: { added, removed } });
    toast('Image removed from service page', 'success');
  };

  const restoreImage = async (src) => {
    const m = managed[selected.slug] || { added: [], removed: [] };
    const removed = (m.removed || []).filter((r) => r !== src);
    await persist({ ...managed, [selected.slug]: { ...m, removed } });
    toast('Image restored', 'success');
  };

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('image', file);
    try {
      const res = await fetch(`${window.__ADM_API__}/admin/images`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.success) { await addImage(`${API}${data.image.url}`); setAddOpen(false); setAddUrl(''); }
      else toast('Upload failed', 'error');
    } catch { toast('Upload failed', 'error'); }
    setUploading(false);
  };

  const filtered = SERVICE_PAGES.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Service Page Images</h1><p>Manage the photo gallery on each service detail page</p></div>
        <div className="adm-page-actions"><span className="adm-chip">{SERVICE_PAGES.length} service pages</span></div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <span className="adm-search-ico">⌕</span>
          <input placeholder="Search services…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {selected && <button className="adm-btn adm-btn-sm" onClick={() => setSelected(null)}>← All services</button>}
      </div>

      {selected && (
        <div style={{ marginBottom: '1rem', fontSize: '.85rem', color: 'var(--muted)' }}>
          <button className="adm-link" onClick={() => setSelected(null)}>Service Images</button> › <b style={{ color: 'var(--text)' }}>{selected.title}</b>
        </div>
      )}

      {/* LEVEL 1: service list */}
      {!selected && (
        <div className="adm-grid-2">
          {filtered.map((svc) => {
            const g = getGallery(svc);
            return (
              <div key={svc.slug} className="adm-panel" style={{ cursor: 'pointer' }} onClick={() => setSelected(svc)}>
                <div className="adm-panel-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                    <img src={g.hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{svc.num} · {svc.title}</div>
                    <div className="adm-muted">{g.images.length} image{g.images.length !== 1 ? 's' : ''}{g.addedCount > 0 ? ` · ${g.addedCount} added` : ''}{g.removed.length > 0 ? ` · ${g.removed.length} hidden` : ''}</div>
                  </div>
                  <span style={{ color: 'var(--muted)' }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEVEL 2: images of selected service */}
      {selected && (() => {
        const g = getGallery(selected);
        return (
          <div className="adm-panel">
            <div className="adm-panel-head">
              <h3>{selected.title}</h3>
              {g.hero && (
                <span className="adm-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                  Hero: <img src={g.hero} alt="" style={{ width: 32, height: 32, borderRadius: 5, objectFit: 'cover', border: '1px solid var(--border)' }} />
                </span>
              )}
              <span className="adm-muted">{g.images.length} visible · {g.removed.length} hidden</span>
              <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => { setAddUrl(''); setAddOpen(true); }}>+ Add Image</button>
            </div>
            <div className="adm-panel-body">
              {g.images.length === 0 && g.removed.length === 0 ? (
                <Empty icon="▦" title="No images" sub="Add images to show them on this service page." />
              ) : (
                <div className="adm-media-grid">
                  {g.images.map((src, i) => (
                    <div key={src + i} className="adm-media-card">
                      <div className="adm-media-img">
                        <img src={src} alt="" loading="lazy" onError={(e) => { e.target.style.opacity = .3; }} />
                        {src === g.hero && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '.62rem', fontWeight: 600, padding: '.15rem .4rem', borderRadius: 4, background: 'var(--info-soft)', color: 'var(--info)' }}>Hero</span>}
                      </div>
                      <div className="adm-media-info">
                        <div className="adm-media-meta" style={{ wordBreak: 'break-all' }}>{src.replace(API, '').split('/').pop()}</div>
                      </div>
                      <div className="adm-media-actions">
                        {src !== g.hero && <button onClick={() => setHero(src)}>Set hero</button>}
                        <button className="danger" onClick={() => removeImage(src)}>Remove</button>
                      </div>
                    </div>
                  ))}
                  {g.removed.map((src, i) => (
                    <div key={`r-${src}-${i}`} className="adm-media-card" style={{ opacity: .55 }}>
                      <div className="adm-media-img"><img src={src} alt="" loading="lazy" onError={(e) => { e.target.style.opacity = .3; }} /></div>
                      <div className="adm-media-info">
                        <div className="adm-media-meta">Hidden</div>
                      </div>
                      <div className="adm-media-actions">
                        <button onClick={() => restoreImage(src)}>Restore</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Add image modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Image to Service"
        footer={addOpen && (
          <>
            <button className="adm-btn" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="adm-btn adm-btn-primary" onClick={async () => { await addImage(addUrl.trim()); setAddOpen(false); setAddUrl(''); }} disabled={!addUrl.trim()}>Add to Page</button>
          </>
        )}>
        {addOpen && (
          <div>
            <div style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--surface-2)', marginBottom: '1rem', maxWidth: 320 }}>
              {addUrl ? <img src={addUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.opacity = .3; }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>No image</div>}
            </div>
            <Field label="Image" required hint="Upload from your computer or paste an image URL.">
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <Input value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="https://… or /uploads/…" style={{ flex: 1 }} />
                <button type="button" className="adm-btn" onClick={() => uploadRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
              </div>
            </Field>
            <input ref={uploadRef} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }} />
          </div>
        )}
      </Modal>
    </>
  );
}

/* ============================================================
   ROOT
   ============================================================ */
export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [view, setView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const logout = () => { localStorage.removeItem('admin_token'); setToken(''); };

  if (!token) return (
    <ToastProvider><ConfirmProvider>
      <Login onLogin={() => setToken(localStorage.getItem('admin_token'))} />
    </ConfirmProvider></ToastProvider>
  );

  const pages = { dashboard: Dashboard, enquiries: Enquiries, 'website-images': WebsiteImages, 'service-images': ServiceImages, services: Services, projects: Projects, testimonials: Testimonials, gallery: Gallery, settings: Settings, activity: Activity, users: Users };
  const Page = pages[view] || Dashboard;

  return (
    <ToastProvider><ConfirmProvider>
      <Layout view={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={logout}>
        <Page go={setView} />
      </Layout>
    </ConfirmProvider></ToastProvider>
  );
}
