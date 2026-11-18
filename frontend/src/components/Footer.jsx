import { useSettings, useTexts, useContent, esc, escBr } from '../hooks/useContent.js';

export default function Footer() {
  const cfg = useSettings();
  const t = useTexts();
  const socials = [['Instagram', cfg.instagram], ['Facebook', cfg.facebook], ['Pinterest', cfg.pinterest], ['LinkedIn', cfg.linkedin]]
    .filter(([, url]) => url)
    .map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noreferrer" class="link-underline">${name}</a>`)
    .join('');
  const { data: dbServices } = useContent('services');
  const year = new Date().getFullYear();
  const serviceLinks = (dbServices && dbServices.length
    ? dbServices.filter((x) => x.slug).map((x) => [x.slug, x.title])
    : null);
  return (
    <div dangerouslySetInnerHTML={{ __html: `<footer>
  <div class="container">
    <div class="top">
      <div>
        <h3>${esc(cfg.siteName.replace(/ Inc\.?$/, ""))}.</h3>
        <p style="max-width:320px;">${escBr(t('footer.blurb'))}</p>
        <div class="socials">${socials}</div>
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
        <ul class="footer-nav">${serviceLinks ? serviceLinks.map(([slug, title]) => `<li><a href="/services/${esc(slug)}" class="link-underline">${esc(title)}</a></li>`).join("") : `
          <li><a href="/services/tile-flooring" class="link-underline">Tile &amp; Flooring</a></li>
          <li><a href="/services/bathroom-upgrades" class="link-underline">Bathroom Upgrades</a></li>
          <li><a href="/services/custom-showers" class="link-underline">Custom Showers</a></li>
          <li><a href="/services/kitchen-backsplash" class="link-underline">Kitchen Backsplash</a></li>
          <li><a href="/services/waterproofing" class="link-underline">Waterproofing</a></li>
          <li><a href="/services/fireplace-tile" class="link-underline">Fireplace Tile</a></li>
          <li><a href="/services/mitered-finishes" class="link-underline">45° Mitered Finishes</a></li>
          <li><a href="/services/home-repairs" class="link-underline">Home Repairs</a></li>
          <li><a href="/services/appliance-installation" class="link-underline">Appliance Installation</a></li>
        `}</ul>
      </div>
      <div>
        <h4>Studio</h4>
        <p>${esc(cfg.siteName)}<br>${esc(cfg.address)}<br>${esc(cfg.country)}</p>
        <p style="margin-top:1rem;">
          <a href="tel:${esc(cfg.tel)}" class="link-underline">${esc(cfg.phone)}</a><br>
          <a href="mailto:${esc(cfg.email)}" class="link-underline">${esc(cfg.email)}</a>
        </p>
        <p style="font-size:.75rem; color:rgba(28,26,23,.5); margin-top:.75rem;">${esc(cfg.hours)}</p>
      </div>
    </div>

    <div class="bottom" style="margin-top:2rem; padding-top:2rem; border-top:1px solid rgba(28,26,23,.1);">
      <p>&copy; ${year} ${esc(cfg.siteName.replace(/ Inc\.?$/, ""))}</p>
      <div style="display:flex; gap:1.5rem;">
        <a href="/privacy-policy" class="link-underline">Privacy Policy</a>
        <a href="/terms" class="link-underline">Terms</a>
      </div>
    </div>
  </div>
</footer>

<div class="mobile-bar">
  <a href="tel:${esc(cfg.tel)}">Call Now</a>
  <a href="/contact">Get a Quote</a>
</div>

<a href="https://wa.me/${esc(cfg.whatsapp.replace(/\D/g, ""))}" target="_blank" rel="noreferrer" class="whatsapp" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.472 3.516A10.918 10.918 0 0 0 12.002 0C5.374 0 .008 5.364.008 11.998c0 2.11.55 4.17 1.594 5.99L0 24l6.252-1.59A11.92 11.92 0 0 0 12 24c6.626 0 11.992-5.364 11.992-11.998a11.88 11.88 0 0 0-3.52-8.486zM12 21.75a9.69 9.69 0 0 1-4.956-1.36l-.356-.213-3.744.952.998-3.648-.26-.41A9.694 9.694 0 0 1 2.25 11.998c0-5.385 4.366-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75zm5.612-7.988c-.304-.152-1.8-.888-2.08-1.008-.28-.116-.484-.174-.688.176-.204.35-.788 1.008-.964 1.146-.18.14-.356.158-.66.006-.304-.154-1.28-.47-2.44-1.502-.9-.806-1.51-1.798-1.688-2.102-.176-.304-.018-.468.132-.62.136-.136.304-.352.456-.528.152-.176.204-.304.304-.504.102-.204.05-.38-.024-.528-.076-.152-.688-1.658-.944-2.27-.25-.596-.502-.514-.688-.522-.18-.01-.384-.012-.588-.012-.204 0-.536.076-.816.38-.28.306-1.072 1.048-1.072 2.558 0 1.51 1.1 2.97 1.252 3.174.152.204 2.168 3.31 5.256 4.64 2.052.846 2.856.92 3.368.79.54-.142.988-.55 1.124-1.06.14-.512.14-.952.1-1.06-.04-.108-.148-.17-.348-.266z"/>
  </svg>
</a>
` }} />
  );
}
