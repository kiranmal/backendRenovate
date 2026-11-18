import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useContent, imageUrl } from '../hooks/useContent.js';
import { getService, SERVICES } from '../data/servicesData.js';
import API from '../config.js';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { slug } = useParams();
  const staticService = getService(slug);
  const { data: projects, loading } = useContent('projects');
  const { data: dbServices, loading: svcLoading } = useContent('services');
  const [managed, setManaged] = useState({});

  useEffect(() => {
    fetch(`${API}/content/service-images`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setManaged(d.data || {}); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const reveals = document.querySelectorAll('.sd-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('sd-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slug, projects, loading, managed]);

  // The database copy (edited in Admin → Services) wins over the built-in text.
  const dbService = (dbServices || []).find((x) => x.slug === slug);
  const service = staticService
    ? {
        ...staticService,
        title: dbService?.title || staticService.title,
        intro: dbService?.description || staticService.intro,
        points: dbService?.points?.length ? dbService.points : staticService.points,
      }
    : dbService
      ? {
          slug: dbService.slug,
          num: String(Math.max(1, (dbServices || []).indexOf(dbService) + 1)).padStart(2, '0'),
          title: dbService.title,
          intro: dbService.description || dbService.summary || '',
          points: dbService.points || [],
          categories: dbService.categories?.length ? dbService.categories : [dbService.title],
          hero: dbService.image || '',
          images: [],
        }
      : null;

  if (!service) {
    if (svcLoading) return <div className="sd-page" style={{ minHeight: '60vh' }} />;
    return <Navigate to="/services" replace />;
  }

  // Backend projects matching this service's categories
  const apiProjects = (projects || []).filter((p) => {
    const cat = (p.category || '').toLowerCase();
    return service.categories.some((c) => cat.includes(c.toLowerCase()) || c.toLowerCase().includes(cat));
  });

  // Gallery = API project images + DB-stored service images + admin-added − admin-removed
  const m = managed[service.slug] || {};
  const baseImages = Array.isArray(m.images) ? m.images : service.images;
  const hero = m.hero || service.hero || dbService?.image || '';
  const apiImages = apiProjects.map((p) => p.image).filter(Boolean);
  const removed = new Set(m.removed || []);
  const gallery = [...new Set([...apiImages, ...baseImages, ...(m.added || [])])].filter((img) => !removed.has(img));
  const list = (dbServices && dbServices.length ? dbServices.filter((x) => x.slug) : SERVICES);
  const idx = list.findIndex((x) => x.slug === service.slug);
  const next = list[(idx + 1) % list.length] || SERVICES[0];

  return (
    <div className="sd-page">
      <section className="sd-hero" style={{ backgroundImage: `url('${imageUrl(hero)}')` }}>
        <div className="sd-hero-inner sd-reveal">
          <p className="eyebrow">Service {service.num}</p>
          <h1>{service.title}</h1>
          <p>{service.intro}</p>
        </div>
      </section>

      <section className="sd-intro">
        <div className="container sd-intro-grid">
          <div className="sd-reveal">
            <h2>What we deliver</h2>
            <p>{service.intro}</p>
          </div>
          <ul className="sd-points sd-reveal">
            {service.points.map((pt) => <li key={pt}>{pt}</li>)}
          </ul>
        </div>
      </section>

      <section className="sd-work">
        <div className="container">
          <div className="head sd-reveal">
            <h2>Our Work</h2>
            <div className="line"></div>
          </div>
          <div className="sd-gallery">
            {gallery.map((img, i) => (
              <figure className="sd-gallery-item sd-reveal" key={img + i}>
                <img src={imageUrl(img)} alt={`${service.title} — ${i + 1}`} loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="sd-cta">
        <div className="container sd-reveal">
          <h2>Ready to get started?</h2>
          <p>Tell us about your {service.title.toLowerCase()} project — we'll help you plan it right.</p>
          <div className="actions">
            <a href="/contact" className="btn-primary">Request a Free Quote <span style={{ fontSize: '1.1rem' }}>→</span></a>
          </div>
          <a href={`/services/${next.slug}`} className="sd-next">Next service: {next.title} →</a>
        </div>
      </section>
    </div>
  );
}
