import { useEffect } from 'react';
import { useSiteImages, imageUrl, useTexts, esc, escBr } from '../hooks/useContent.js';
import AboutTestimonials from '../components/AboutTestimonials.jsx';
import './About.css';

export default function About() {
  const si = useSiteImages();
  const t = useTexts();
  useEffect(() => {
    const reveals = document.querySelectorAll('.abt-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('abt-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [si.data]);

  const html = `
    <section class="abt-hero" style="background-image:url('${imageUrl(si.get('abt-hero', 0, '/images/IMG_0455.jpg'))}');">
      <div class="abt-hero-inner abt-reveal">
        <p class="eyebrow">About</p>
        <h1>${esc(t('about.hero.title'))}</h1>
        <p>${esc(t('about.hero.sub'))}</p>
      </div>
    </section>

    <section class="abt-who">
      <div class="container abt-who-grid">
        <div class="abt-reveal">
          <img src="${imageUrl(si.get('abt-who', 0, '/images/IMG_9687.jpg'))}" alt="Refined residential interior" loading="lazy" decoding="async">
        </div>
        <div class="abt-reveal">
          <h2>${esc(t('about.who.heading'))}</h2>
          <p>${escBr(t('about.who.p1'))}</p>
          <p>${escBr(t('about.who.p2'))}</p>
        </div>
      </div>
    </section>

    <section class="abt-founder">
      <div class="container abt-founder-grid">
        <div class="abt-reveal">
          <h2>${esc(t('about.founder.heading'))}</h2>
          <p class="role">${esc(t('about.founder.role'))}</p>
          <p>${escBr(t('about.founder.p1'))}</p>
          <p>${escBr(t('about.founder.p2'))}</p>
          <p>${escBr(t('about.founder.p3'))}</p>
        </div>
        <div class="abt-reveal">
          <img src="${imageUrl(si.get('abt-founder', 0, '/images/IMG_9545.jpg'))}" alt="Tile and craft detail" loading="lazy" decoding="async">
        </div>
      </div>
    </section>

    <section class="abt-values">
      <div class="container">
        <div class="head abt-reveal">
          <h2>What Drives Us</h2>
          <div class="line"></div>
        </div>
        <div class="abt-values-grid">
          <article class="abt-value abt-reveal">
            <h3>Quality</h3>
            <p>We care about the quality of every installation and finish.</p>
          </article>
          <article class="abt-value abt-reveal">
            <h3>Precision</h3>
            <p>Details, measurements, cuts, and finishing matter.</p>
          </article>
          <article class="abt-value abt-reveal">
            <h3>Reliability</h3>
            <p>Clear communication and professional execution from start to finish.</p>
          </article>
          <article class="abt-value abt-reveal">
            <h3>Craftsmanship</h3>
            <p>We take pride in doing the work properly and thoughtfully.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="abt-areas">
      <div class="container">
        <div class="head abt-reveal">
          <h2>For Homes &amp; Businesses</h2>
          <div class="line"></div>
        </div>
        <div class="abt-areas-grid">
          <a href="/residential" class="abt-area abt-reveal">
            <img src="${imageUrl(si.get('abt-areas', 0, '/images/IMG_0447.jpg'))}" alt="Residential project" loading="lazy" decoding="async">
            <div class="abt-area-content">
              <h3>Residential</h3>
              <p>Creating comfortable, functional, and beautifully finished spaces for homeowners.</p>
              <span>Explore →</span>
            </div>
          </a>
          <a href="/" class="abt-area abt-reveal">
            <img src="${imageUrl(si.get('abt-areas', 1, '/images/IMG_9415.jpg'))}" alt="Commercial project" loading="lazy" decoding="async">
            <div class="abt-area-content">
              <h3>Commercial</h3>
              <p>Providing professional installation and improvement solutions for commercial spaces.</p>
              <span>Explore →</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="abt-approach">
      <div class="container">
        <div class="head abt-reveal">
          <h2>How We Work</h2>
          <div class="line"></div>
        </div>
        <div class="abt-approach-list">
          <article class="abt-step abt-reveal">
            <h3>Listen</h3>
            <p>We understand your needs, space, and priorities.</p>
          </article>
          <article class="abt-step abt-reveal">
            <h3>Plan</h3>
            <p>We define materials, layout, timeline, and scope.</p>
          </article>
          <article class="abt-step abt-reveal">
            <h3>Build</h3>
            <p>We execute with care, precision, and clean workmanship.</p>
          </article>
          <article class="abt-step abt-reveal">
            <h3>Refine</h3>
            <p>We finish every detail before the final handover.</p>
          </article>
        </div>
      </div>
    </section>
  `;

  const html2 = `
    <section class="abt-cta">
      <div class="container abt-reveal">
        <h2>Let's build something great.</h2>
        <p>Have a renovation, installation, or home improvement project in mind? We'd love to hear about it.</p>
        <div class="actions">
          <a href="/contact" class="btn-primary">Start a Project <span style="font-size:1.1rem;">→</span></a>
          <a href="/contact" class="btn-outline">Contact Us <span style="font-size:1.1rem;">→</span></a>
        </div>
      </div>
    </section>
  `;

  return (
    <div className="about-page">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <AboutTestimonials />
      <div dangerouslySetInnerHTML={{ __html: html2 }} />
    </div>
  );
}
