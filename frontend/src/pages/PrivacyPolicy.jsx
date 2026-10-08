import { useEffect } from 'react';
import './Legal.css';

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
        </div>
      </section>
      <section className="legal-content">
        <div className="container">
          <p className="legal-updated">Last updated: October 2026</p>

          <h2>1. Information We Collect</h2>
          <p>When you use our website or request a quote, we may collect your name, phone number, email address, project address, and the details you provide about your renovation project.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information you provide to respond to your inquiries, prepare quotes, schedule consultations, and communicate with you about our services.</p>

          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We only share information with team members or subcontractors directly involved in estimating or completing your project.</p>

          <h2>4. Data Security</h2>
          <p>We take reasonable steps to protect your information. However, no method of transmission over the internet or electronic storage is completely secure.</p>

          <h2>5. Cookies & Analytics</h2>
          <p>Our website may use basic analytics to understand how visitors interact with the site. This data is anonymous and used only to improve user experience.</p>

          <h2>6. Your Rights</h2>
          <p>You may contact us at any time to request access to, correction of, or deletion of your personal information.</p>

          <h2>7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through the information on our Contact page.</p>
        </div>
      </section>
    </main>
  );
}
