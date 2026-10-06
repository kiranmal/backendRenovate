import { useEffect, useRef, useState } from 'react';
import { useContent, useSiteImages, imageUrl } from '../hooks/useContent.js';
import { SERVICES as SERVICE_PAGES } from '../data/servicesData.js';
import API from '../config.js';
import './Services.css';

const slugFor = (title = '') => {
  const t = title.toLowerCase().replace(/&/g, 'and');
  const match = SERVICE_PAGES.find((s) => t.includes(s.title.toLowerCase()) || s.title.toLowerCase().includes(t));
  if (match) return match.slug;
  return t.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

export default function Services() {
  const { data: services, loading } = useContent('services');
  const si = useSiteImages();
  const [svcImages, setSvcImages] = useState({});
  const pageRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/content/service-images`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSvcImages(d.data || {}); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll('.ser-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('ser-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [services, loading, si.data]);

  // Default static services (shown if backend has no data yet)
  const fallbackServices = [
    { title: 'Tile & Flooring', summary: 'Professional installation for all tile formats and flooring applications.', icon: '01' },
    { title: 'Bathroom Upgrades', summary: 'Complete bathroom improvements with quality finishes and detailed execution.', icon: '02' },
    { title: 'Kitchen Backsplash', summary: 'Custom backsplash installation designed to complement your kitchen.', icon: '03' },
    { title: 'Custom Showers', summary: 'Custom shower installations with detailed tile work and waterproofing.', icon: '04' },
    { title: 'Waterproofing', summary: 'Reliable waterproofing solutions designed for long-lasting performance.', icon: '05' },
    { title: 'Fireplace', summary: 'Custom fireplace tile work and feature installations.', icon: '06' },
    { title: 'Home Repairs', summary: 'Practical repairs and improvements for residential spaces.', icon: '07' },
    { title: 'Appliance Installations', summary: 'Professional appliance installation and related home improvements.', icon: '08' },
  ];

  const activeServices = (services && services.length > 0) ? services : fallbackServices;

  return (
    <div className="services-page" ref={pageRef}>
      <section className="ser-hero" style={{ backgroundImage: `url('${imageUrl(si.get('ser-hero', 0, '/images/md-services.jpg'))}')` }}>
        <div className="ser-hero-inner ser-reveal">
          <p className="eyebrow">Services</p>
          <h1>Services</h1>
          <p>Craftsmanship, precision, and thoughtful solutions for every space.</p>
          <a href="/contact" className="btn-primary">Start a Project <span style={{ fontSize: '1.1rem' }}>→</span></a>
        </div>
      </section>

      <section className="ser-intro">
        <div className="container ser-intro-grid">
          <div className="ser-reveal">
            <img src={imageUrl(si.get('ser-intro', 0, '/images/IMG_0308.jpg'))} alt="Modern kitchen interior" loading="lazy" decoding="async" />
          </div>
          <div className="ser-reveal">
            <h2>Built around quality.</h2>
            <p>From detailed tile installation to complete home improvements, we bring careful planning, quality materials, and precise craftsmanship to every project.</p>
          </div>
        </div>
      </section>

      <section className="ser-main">
        <div className="container">
          <div className="head ser-reveal">
            <h2>What We Do</h2>
            <div className="line"></div>
          </div>
          <div className="ser-services-grid">
            {activeServices.map((s, i) => {
              const cardImage = s.image || (svcImages[slugFor(s.title)] || {}).hero;
              return (
              <a href={`/services/${slugFor(s.title)}`} className="ser-service ser-reveal" key={s.id || i} style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
                {cardImage && (
                  <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={imageUrl(cardImage)} alt={s.title} loading="lazy" decoding="async" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                <p className="num">{String(i + 1).padStart(2, '0')} — {s.icon && s.icon.length <= 3 ? s.icon : s.title}</p>
                <h3>{s.title}</h3>
                <p>{s.summary || s.description}</p>
              </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ser-specialty">
        <div className="container">
          <div className="head ser-reveal">
            <h2>The Details Matter.</h2>
            <div className="line"></div>
          </div>
          <div className="ser-specialty-grid">
            {si.list('ser-specialty', [
              { src: '/images/IMG_9381.jpg', label: '45° Angles', text: 'Precise cuts and professional finishing.' },
              { src: '/images/IMG_9389.jpg', label: 'All Tile Formats', text: 'Experience with different tile sizes, shapes, and formats.' },
              { src: '/images/IMG_9446.jpg', label: 'Custom Finishes', text: 'Detailed solutions tailored to each project.' },
            ]).map((c, i) => (
              <article className="ser-specialty-card ser-reveal" key={i}>
                <div className="thumb">
                  <img src={imageUrl(c.src)} alt={c.label || 'Specialty'} loading="lazy" decoding="async" />
                </div>
                <div className="body">
                  <h3>{c.label}</h3>
                  <p>{c.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ser-areas">
        <div className="container ser-areas-grid">
          {si.list('ser-areas', [
            { src: '/images/IMG_9687.jpg', label: 'Residential', text: 'Homes, renovations, bathrooms, kitchens, flooring, and custom spaces.', href: '/residential', cta: 'Explore Residential →' },
            { src: '/images/IMG_0212.jpg', label: 'Commercial', text: 'Professional tile, flooring, repairs, and installation solutions.', href: '/', cta: 'Explore Commercial →' },
          ]).map((a, i) => (
            <a href={a.href || '/'} className="ser-area ser-reveal" key={i}>
              <img src={imageUrl(a.src)} alt={a.label || 'Area'} loading="lazy" decoding="async" />
              <div className="ser-area-content">
                <h3>{a.label}</h3>
                <p>{a.text}</p>
                <span>{a.cta || 'Explore →'}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="ser-cta">
        <div className="container ser-reveal">
          <h2>Have a project in mind?</h2>
          <p>Tell us what you're planning. Let's create a space built with precision and care.</p>
          <div className="actions">
            <a href="/contact" className="btn-primary">Start a Project <span style={{ fontSize: '1.1rem' }}>→</span></a>
            <a href="/contact" className="btn-outline">Contact Us <span style={{ fontSize: '1.1rem' }}>→</span></a>
          </div>
        </div>
      </section>
    </div>
  );
}
