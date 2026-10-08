export default function Footer() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `<footer>
  <div class="container">
    <div class="top">
      <div>
        <h3>Renovate Max2Max.</h3>
        <p style="max-width:320px;">A tile and renovation studio serving Edmonton and the surrounding area — crafting durable, beautiful floors, bathrooms, kitchens and feature work for homes and businesses.</p>
        <div class="socials">
          <a href="https://instagram.com/" target="_blank" rel="noreferrer" class="link-underline">Instagram</a>
          <a href="https://pinterest.com/" target="_blank" rel="noreferrer" class="link-underline">Pinterest</a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer" class="link-underline">LinkedIn</a>
        </div>
      </div>
      <div>
        <h4>Navigate</h4>
        <ul class="footer-nav">
          <li><a href="/" class="link-underline">Home</a></li>
          <li><a href="/about" class="link-underline">About</a></li>
          <li><a href="/services" class="link-underline">Services</a></li>
          <li><a href="/contact" class="link-underline">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Services</h4>
        <ul class="footer-nav">
          <li><a href="/services/tile-flooring" class="link-underline">Tile &amp; Flooring</a></li>
          <li><a href="/services/bathroom-upgrades" class="link-underline">Bathroom Upgrades</a></li>
          <li><a href="/services/custom-showers" class="link-underline">Custom Showers</a></li>
          <li><a href="/services/kitchen-backsplash" class="link-underline">Kitchen Backsplash</a></li>
          <li><a href="/services/waterproofing" class="link-underline">Waterproofing</a></li>
          <li><a href="/services/fireplace-tile" class="link-underline">Fireplace Tile</a></li>
          <li><a href="/services/mitered-finishes" class="link-underline">45° Mitered Finishes</a></li>
          <li><a href="/services/home-repairs" class="link-underline">Home Repairs</a></li>
          <li><a href="/services/appliance-installation" class="link-underline">Appliance Installation</a></li>
        </ul>
      </div>
      <div>
        <h4>Studio</h4>
        <p>Renovate Max2Max Inc.<br>Edmonton, Alberta<br>Canada</p>
        <p style="margin-top:1rem;">
          <a href="tel:+14378698609" class="link-underline">+1 (437) 869 8609</a><br>
          <a href="mailto:Renovatemax2max@gmail.com" class="link-underline">Renovatemax2max@gmail.com</a>
        </p>
        <p style="font-size:.75rem; color:rgba(28,26,23,.5); margin-top:.75rem;">Monday — Friday · 10:00 — 18:30</p>
      </div>
    </div>

    <div class="bottom" style="margin-top:2rem; padding-top:2rem; border-top:1px solid rgba(28,26,23,.1);">
      <p>&copy; 2026 Renovate Max2Max</p>
      <div style="display:flex; gap:1.5rem;">
        <a href="/privacy-policy" class="link-underline">Privacy Policy</a>
        <a href="/terms" class="link-underline">Terms</a>
      </div>
    </div>
  </div>
</footer>

<div class="mobile-bar">
  <a href="tel:+14378698609">Call Now</a>
  <a href="/contact">Get a Quote</a>
</div>

<a href="https://wa.me/14378698609" target="_blank" rel="noreferrer" class="whatsapp" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.472 3.516A10.918 10.918 0 0 0 12.002 0C5.374 0 .008 5.364.008 11.998c0 2.11.55 4.17 1.594 5.99L0 24l6.252-1.59A11.92 11.92 0 0 0 12 24c6.626 0 11.992-5.364 11.992-11.998a11.88 11.88 0 0 0-3.52-8.486zM12 21.75a9.69 9.69 0 0 1-4.956-1.36l-.356-.213-3.744.952.998-3.648-.26-.41A9.694 9.694 0 0 1 2.25 11.998c0-5.385 4.366-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75zm5.612-7.988c-.304-.152-1.8-.888-2.08-1.008-.28-.116-.484-.174-.688.176-.204.35-.788 1.008-.964 1.146-.18.14-.356.158-.66.006-.304-.154-1.28-.47-2.44-1.502-.9-.806-1.51-1.798-1.688-2.102-.176-.304-.018-.468.132-.62.136-.136.304-.352.456-.528.152-.176.204-.304.304-.504.102-.204.05-.38-.024-.528-.076-.152-.688-1.658-.944-2.27-.25-.596-.502-.514-.688-.522-.18-.01-.384-.012-.588-.012-.204 0-.536.076-.816.38-.28.306-1.072 1.048-1.072 2.558 0 1.51 1.1 2.97 1.252 3.174.152.204 2.168 3.31 5.256 4.64 2.052.846 2.856.92 3.368.79.54-.142.988-.55 1.124-1.06.14-.512.14-.952.1-1.06-.04-.108-.148-.17-.348-.266z"/>
  </svg>
</a>
` }} />
  );
}
