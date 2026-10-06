import { useEffect, useState } from 'react';
import { useSiteImages, imageUrl } from '../hooks/useContent.js';
import API from '../config.js';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '', details: '' });
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });
  const si = useSiteImages();

  useEffect(() => {
    const reveals = document.querySelectorAll('.ct-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('ct-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [si.data]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setStatus({ loading: false, success: '', error: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setStatus({ loading: false, success: '', error: 'Please enter your name and phone number.' });
      return;
    }
    setStatus({ loading: true, success: '', error: '' });
    try {
      const res = await fetch(`${API}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ loading: false, success: 'Thank you. Your inquiry has been received.', error: '' });
        setForm({ name: '', email: '', phone: '', type: '', details: '' });
      } else {
        throw new Error(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setStatus({ loading: false, success: '', error: err.message || 'Could not send inquiry. Please try again or call us directly.' });
    }
  };

  return (
    <div className="contact-page">
      <section className="ct-hero" style={{ backgroundImage: `url('${imageUrl(si.get('ct-hero', 0, '/images/md-contact.jpg'))}')` }}>
        <div className="ct-hero-inner ct-reveal">
          <p className="eyebrow">Contact</p>
          <h1>Let's Talk</h1>
          <p>Have a project in mind? Let's turn your ideas into something beautifully built.</p>
        </div>
      </section>

      <section className="ct-main">
        <div className="container ct-main-grid">
          <div className="ct-info ct-reveal">
            <h2>Get In Touch</h2>
            <h3>Renovate Max2Max Inc.</h3>
            <p>Gurdeep Singh</p>
            <p>Edmonton, Alberta</p>
            <a href="tel:+14378698609">+1 (437) 869-8609</a>
            <a href="mailto:Renovatemax2max@gmail.com">Renovatemax2max@gmail.com</a>
            <div className="ct-actions">
              <a href="tel:+14378698609">Call Us</a>
              <a href="mailto:Renovatemax2max@gmail.com">Email Us</a>
            </div>
          </div>

          <div className="ct-form ct-reveal">
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="name">Name <span className="req">*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
              />

              <label htmlFor="phone">Phone <span className="req">*</span></label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                required
              />

              <label htmlFor="type">Project Type</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="">Select a project type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Tile & Flooring">Tile &amp; Flooring</option>
                <option value="Custom Shower">Custom Shower</option>
                <option value="Waterproofing">Waterproofing</option>
                <option value="Home Repair">Home Repair</option>
                <option value="Other">Other</option>
              </select>

              <label htmlFor="details">Tell us about your project</label>
              <textarea
                id="details"
                name="details"
                rows="4"
                value={form.details}
                onChange={handleChange}
                placeholder="Brief project details"
              />

              <button type="submit" disabled={status.loading}>
                {status.loading ? 'SENDING...' : 'SEND INQUIRY'}
              </button>

              {status.success && <div className="ct-message success">{status.success}</div>}
              {status.error && <div className="ct-message error">{status.error}</div>}
            </form>
          </div>
        </div>
      </section>

      <section className="ct-links">
        <div className="container">
          <div className="head ct-reveal">
            <h2>What Can We Help With?</h2>
          </div>
          <nav className="ct-links-list ct-reveal">
            <a href="/services">Tile &amp; Flooring</a>
            <a href="/services">Bathroom Upgrades</a>
            <a href="/services">Kitchen Backsplash</a>
            <a href="/services">Tile Installation</a>
            <a href="/services">Waterproofing</a>
            <a href="/services">Custom Shower</a>
            <a href="/services">Fireplace</a>
            <a href="/services">45° Angles</a>
            <a href="/services">Home Repairs</a>
            <a href="/services">Appliance Installations</a>
          </nav>
        </div>
      </section>

      <section className="ct-location">
        <div className="container ct-reveal">
          <h2>Serving Edmonton &amp; Surrounding Areas</h2>
          <p>Edmonton, Alberta</p>
        </div>
      </section>

      <section className="ct-cta">
        <div className="container ct-reveal">
          <h2>Ready to start?</h2>
          <p>Tell us about your project and let's take the first step together.</p>
          <a href="#ct-form" className="btn-primary" onClick={(e) => { e.preventDefault(); document.querySelector('.ct-form').scrollIntoView({ behavior: 'smooth' }); }}>
            Send an Inquiry <span style={{ fontSize: '1.1rem' }}>→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
