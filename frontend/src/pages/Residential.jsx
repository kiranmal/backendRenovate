import { useEffect } from 'react';
import { useContent, useSiteImages, imageUrl } from '../hooks/useContent.js';
import './Residential.css';

export default function Residential() {
  const { data: projects, loading } = useContent('projects');
  const si = useSiteImages();

  useEffect(() => {
    const reveals = document.querySelectorAll('.res-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('res-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [projects, loading, si.data]);

  // Default static work items (shown if backend has no projects yet)
  const fallbackWork = [
    { title: 'Kitchen', image: '/images/IMG_0308.jpg' },
    { title: 'Bathroom', image: '/images/IMG_0447.jpg' },
    { title: 'Custom Shower', image: '/images/IMG_0460.jpg' },
    { title: 'Living Space', image: '/images/IMG_9687.jpg' },
  ].map((p, i) => ({ ...p, image: si.get('res-work', i, p.image), title: si.list('res-work')[i]?.label || p.title }));
  const workItems = (projects && projects.length > 0) ? projects : fallbackWork;

  return (
    <div className="residential-page">
      <section className="res-hero" style={{ backgroundImage: `url('${imageUrl(si.get('res-hero', 0, '/images/md-residential.jpg'))}')` }}>
        <div className="res-hero-inner res-reveal">
          <p className="eyebrow">Residential</p>
          <h1>Residential</h1>
          <p>Thoughtfully crafted spaces, designed around the way you live.</p>
          <div className="actions">
            <a href="#res-work" className="btn-primary">View Our Work <span style={{ fontSize: '1.1rem' }}>→</span></a>
            <a href="/contact" className="btn-outline">Start a Project <span style={{ fontSize: '1.1rem' }}>→</span></a>
          </div>
        </div>
      </section>

      <section className="res-intro">
        <div className="container res-intro-grid">
          <div className="res-reveal">
            <img src={imageUrl(si.get('res-intro', 0, '/images/IMG_9687.jpg'))} alt="Refined residential interior" loading="lazy" decoding="async" />
          </div>
          <div className="res-reveal">
            <h2>Spaces made for living.</h2>
            <p>We create residential spaces where thoughtful design, quality craftsmanship, and everyday functionality come together. Every project is shaped by how a home is actually used, not just how it looks.</p>
          </div>
        </div>
      </section>

      <section className="res-services">
        <div className="container">
          <div className="head res-reveal">
            <h2>What We Do</h2>
            <div className="line"></div>
          </div>
          <div className="res-services-grid">
            <article className="res-service res-reveal">
              <p className="num">01 — Kitchens</p>
              <h3>Kitchens</h3>
              <p>Renovations, backsplashes, and custom finishes.</p>
            </article>
            <article className="res-service res-reveal">
              <p className="num">02 — Bathrooms</p>
              <h3>Bathrooms</h3>
              <p>Bathroom upgrades, custom showers, and detailed tile work.</p>
            </article>
            <article className="res-service res-reveal">
              <p className="num">03 — Tile & Flooring</p>
              <h3>Tile & Flooring</h3>
              <p>Precise installation across a range of formats and materials.</p>
            </article>
            <article className="res-service res-reveal">
              <p className="num">04 — Waterproofing</p>
              <h3>Waterproofing</h3>
              <p>Professional waterproofing for durable, reliable spaces.</p>
            </article>
            <article className="res-service res-reveal">
              <p className="num">05 — Home Renovations</p>
              <h3>Home Renovations</h3>
              <p>Thoughtful improvements tailored to your home.</p>
            </article>
            <article className="res-service res-reveal">
              <p className="num">06 — Custom Details</p>
              <h3>Custom Details</h3>
              <p>Fireplaces, feature walls, 45° angles, and other custom finishes.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="res-work" id="res-work">
        <div className="container">
          <div className="head res-reveal">
            <h2>Residential Work</h2>
            <div className="line"></div>
          </div>
          <div className="res-work-grid">
            {workItems.map((p, i) => (
              <article className="res-work-item res-reveal" key={p.id || i}>
                <img src={imageUrl(p.image)} alt={p.title || 'Project'} loading="lazy" decoding="async" />
                <div className="res-work-info">
                  <h3>{p.title || 'Project'}</h3>
                  {p.category && <span style={{ fontSize: '.85rem', color: '#999' }}>{p.category}{p.location ? ` · ${p.location}` : ''}</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="res-statement" style={{ backgroundImage: `url('${imageUrl(si.get('res-statement', 0, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&auto=format&fit=crop'))}')` }}>
        <div className="res-statement-inner res-reveal">
          <h2>Details make the difference.</h2>
          <p>From material selection to the final installation, every detail is considered.</p>
        </div>
      </section>

      <section className="res-cta">
        <div className="container res-reveal">
          <h2>Ready to transform your home?</h2>
          <p>Let's turn your ideas into a space that feels uniquely yours.</p>
          <div className="actions">
            <a href="/contact" className="btn-primary">Start a Project <span style={{ fontSize: '1.1rem' }}>→</span></a>
            <a href="/contact" className="btn-outline">Contact Us <span style={{ fontSize: '1.1rem' }}>→</span></a>
          </div>
        </div>
      </section>
    </div>
  );
}
