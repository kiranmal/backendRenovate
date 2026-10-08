import { useEffect } from 'react';
import './Legal.css';

export default function Terms() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="container">
          <h1>Terms of Service</h1>
        </div>
      </section>
      <section className="legal-content">
        <div className="container">
          <p className="legal-updated">Last updated: October 2026</p>

          <h2>1. Agreement to Terms</h2>
          <p>By using the Renovate Max2Max Inc. website, you agree to these Terms of Service. If you do not agree, please do not use the site.</p>

          <h2>2. Services</h2>
          <p>We provide residential and commercial renovation services including tile installation, bathroom upgrades, custom showers, kitchen backsplashes, waterproofing, flooring, and related home repair services. All projects are subject to a signed contract and estimate.</p>

          <h2>3. Quotes and Estimates</h2>
          <p>Quotes provided through our website or in-person consultations are estimates based on the information provided. Final pricing is determined after an on-site assessment and written agreement.</p>

          <h2>4. Project Scheduling</h2>
          <p>Project timelines are estimates and may be affected by material availability, weather, site conditions, or other factors outside our control. We will communicate any changes as early as possible.</p>

          <h2>5. Payments</h2>
          <p>Payment terms are outlined in the project contract. A deposit may be required to secure materials and schedule work.</p>

          <h2>6. Warranty</h2>
          <p>We stand behind the quality of our workmanship. Specific warranty terms are provided in the project contract and may vary depending on the type of service and materials used.</p>

          <h2>7. Limitation of Liability</h2>
          <p>Renovate Max2Max Inc. is not liable for damages arising from the misuse of our website or from factors beyond our reasonable control during a renovation project.</p>

          <h2>8. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the website after changes means you accept the updated Terms.</p>

          <h2>9. Contact</h2>
          <p>For questions about these Terms, please contact us through the information on our Contact page.</p>
        </div>
      </section>
    </main>
  );
}
