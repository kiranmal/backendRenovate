import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useContent, imageUrl } from '../hooks/useContent.js';
import { getService, SERVICES } from '../data/servicesData.js';
import API from '../config.js';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getService(slug);
  const { data: projects, loading } = useContent('projects');
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

  if (!service) return <Navigate to="/services" replace />;

  // Backend projects matching this service's categories
  const apiProjects = (projects || []).filter((p) => {
    const cat = (p.category || '').toLowerCase();
    return service.categories.some((c) => cat.includes(c.toLowerCase()) || c.toLowerCase().includes(cat));
  });

  // Gallery = API project images + static service images + admin-added − admin-removed
  const m = managed[service.slug] || { added: [], removed: [] };
  const apiImages = apiProjects.map((p) => p.image).filter(Boolean);
  const removed = new Set(m.removed || []);
  const gallery = [...new Set([...apiImages, ...service.images, ...(m.added || [])])].filter((img) => !removed.has(img));
  const next = SERVICES[(SERVICES.indexOf(service) + 1) % SERVICES.length];

  return (
    <div className="sd-page">
      <section className="sd-hero" style={{ backgroundImage: `url('${service.hero}')` }}>
        <div className="sd-hero-inner sd-reveal">
          <p className="eyebrow">Service {service.num}</p>
          <h1>{service.title}</h1>
          <p>{service.intro}</p>
          <div className="actions">
            <a href="/contact" className="btn-primary">Start a Project <span style={{ fontSize: '1.1rem' }}>→</span></a>
            <a href="/services" className="btn-outline">All Services</a>
          </div>
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
