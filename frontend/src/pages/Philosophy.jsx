import { useEffect } from 'react';
import { useSiteImages, imageUrl } from '../hooks/useContent.js';
import './Philosophy.css';

export default function Philosophy() {
  const si = useSiteImages();
  useEffect(() => {
    const reveals = document.querySelectorAll('.ph-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('ph-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [si.data]);

  const html = `
    <section class="ph-hero" style="background-image:url('${imageUrl(si.get('ph-hero', 0, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&auto=format&fit=crop'))}');">
      <div class="ph-hero-inner ph-reveal">
        <p class="eyebrow">Our Belief</p>
        <h1>Our Philosophy</h1>
        <p>We believe that great spaces are not just built; they are considered. Every material, every joint, and every finish is a chance to create something lasting, meaningful, and quietly beautiful.</p>
        <div class="actions">
          <a href="/contact" class="btn-primary">Discover Our Approach <span style="font-size:1.1rem;">→</span></a>
          <a href="/residential" class="btn-outline">Explore Our Work <span style="font-size:1.1rem;">→</span></a>
        </div>
      </div>
    </section>

    <section class="ph-intro">
      <div class="container ph-intro-grid">
        <div class="ph-reveal">
          <h2>Great work begins with a clear philosophy.</h2>
        </div>
        <div class="ph-reveal">
          <p class="lead">At Renovate Max2Max, we approach every project with intention. We do not chase trends or add detail for the sake of decoration. We listen, understand, and build with purpose.</p>
          <p>Our work is rooted in the belief that a home or commercial space should feel effortless to live in and beautiful to experience. That means honest materials, clean lines, and finishes that can be touched and used every day without losing their charm.</p>
          <p>Every decision — from the angle of a tile cut to the placement of a backsplash — is made with attention to how the space will be lived in, not just how it will be photographed.</p>
        </div>
      </div>
    </section>

    <section class="ph-principles">
      <div class="container">
        <div class="head ph-reveal">
          <h2>What We Believe</h2>
          <div class="line"></div>
        </div>
        <div class="ph-principles-grid">
          <article class="ph-principle ph-reveal">
            <p class="num">01 — Purpose</p>
            <h3>Purpose</h3>
            <p>Every decision should have a clear purpose. If a material, colour, or detail does not serve the client or the space, it does not belong.</p>
          </article>
          <article class="ph-principle ph-reveal">
            <p class="num">02 — Simplicity</p>
            <h3>Simplicity</h3>
            <p>We believe thoughtful simplicity creates lasting impact. Restraint is not a lack of imagination; it is the confidence to let quality speak.</p>
          </article>
          <article class="ph-principle ph-reveal">
            <p class="num">03 — Quality</p>
            <h3>Quality</h3>
            <p>We focus on craftsmanship, materials, and details that stand the test of time. A beautiful finish is one that still looks right years later.</p>
          </article>
          <article class="ph-principle ph-reveal">
            <p class="num">04 — Function</p>
            <h3>Function</h3>
            <p>Beautiful design should also be practical, comfortable, and functional. A space must work before it can inspire.</p>
          </article>
          <article class="ph-principle ph-reveal">
            <p class="num">05 — Detail</p>
            <h3>Detail</h3>
            <p>The smallest details often create the strongest overall impression. Clean grout, crisp corners, and careful cuts are where trust is earned.</p>
          </article>
          <article class="ph-principle ph-reveal">
            <p class="num">06 — Experience</p>
            <h3>Experience</h3>
            <p>Every project should create an experience that feels considered and meaningful. We design for the people who will use the space every day.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="ph-approach">
      <div class="container">
        <div class="head ph-reveal">
          <h2>Our Approach</h2>
          <div class="line"></div>
        </div>
        <div class="ph-approach-list">
          <article class="ph-step ph-reveal">
            <h3>Listen</h3>
            <p>We begin by understanding the client's needs, goals, lifestyle, and expectations. Every good project starts with a clear conversation.</p>
          </article>
          <article class="ph-step ph-reveal">
            <h3>Explore</h3>
            <p>We research ideas, materials, possibilities, and creative directions that fit the space and the budget without compromising quality.</p>
          </article>
          <article class="ph-step ph-reveal">
            <h3>Design</h3>
            <p>We develop a thoughtful solution that balances aesthetics and functionality, preparing every detail before work begins.</p>
          </article>
          <article class="ph-step ph-reveal">
            <h3>Refine</h3>
            <p>We review every element and continuously improve the details, ensuring the finish matches the vision we set out to achieve.</p>
          </article>
          <article class="ph-step ph-reveal">
            <h3>Deliver</h3>
            <p>We turn the final vision into a high-quality finished result, leaving a space that is clean, complete, and ready to be lived in.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="ph-statement" style="background-image:url('${imageUrl(si.get('ph-statement', 0, 'https://images.unsplash.com/photo-1774429145093-3e813eedcd7a?w=1920&q=80&auto=format&fit=crop'))}');">
      <div class="ph-statement-inner ph-reveal">
        <h2>We don't just create spaces.<br>We create experiences that last.</h2>
        <p>Design that respects daily life and elevates the ordinary.</p>
      </div>
    </section>

    <section class="ph-human">
      <div class="container ph-human-grid">
        <div class="ph-reveal">
          <img src="${imageUrl(si.get('ph-human', 0, '/images/IMG_9687.jpg'))}" alt="Warm residential interior with considered details" loading="lazy" decoding="async">
        </div>
        <div class="ph-reveal">
          <h2>Built around people</h2>
          <p>Our philosophy is ultimately centered around the people who live and work in the spaces we touch. We take time to understand how they move, relax, gather, and begin their days.</p>
          <p>By listening carefully and designing for real everyday life, we create comfortable experiences that balance beauty and practicality. We are not just installing tile; we are helping clients build a better relationship with their space.</p>
          <ul>
            <li>Understanding clients before choosing materials</li>
            <li>Listening carefully to how a space will be used</li>
            <li>Creating comfortable, practical experiences</li>
            <li>Balancing beauty and everyday function</li>
            <li>Designing for real life, not just first impressions</li>
            <li>Building long-term relationships through honest work</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="ph-cta">
      <div class="container ph-reveal">
        <h2>Let's create something meaningful.</h2>
        <p>Have an idea, a vision, or a space that needs a new direction? Let's start a conversation and see where it takes us.</p>
        <div class="actions">
          <a href="/contact" class="btn-primary">Start a Conversation <span style="font-size:1.1rem;">→</span></a>
          <a href="/residential" class="btn-outline">View Our Work <span style="font-size:1.1rem;">→</span></a>
        </div>
      </div>
    </section>
  `;

  return <div className="philosophy-page" dangerouslySetInnerHTML={{ __html: html }} />;
}
