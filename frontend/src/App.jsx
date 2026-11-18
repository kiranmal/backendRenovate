import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Philosophy from './pages/Philosophy.jsx';
import Residential from './pages/Residential.jsx';
import Services from './pages/Services.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import Terms from './pages/Terms.jsx';
import Admin from './admin/Admin.jsx';
import { useSeo } from './hooks/useContent.js';

const SEO_KEYS = { '/': 'home', '/about': 'about', '/services': 'services', '/residential': 'residential', '/philosophy': 'philosophy', '/contact': 'contact' };

function setMeta(attr, name, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

/** Applies the SEO settings saved in Admin → SEO to the page being viewed. */
function SeoManager() {
  const { pathname } = useLocation();
  const seo = useSeo();
  useEffect(() => {
    if (!seo || pathname.startsWith('/admin')) return;
    const cfg = seo[SEO_KEYS[pathname.replace(/\/+$/, '') || '/']];
    if (!cfg) return;
    if (cfg.title) { document.title = cfg.title; setMeta('property', 'og:title', cfg.title); setMeta('name', 'twitter:title', cfg.title); }
    if (cfg.description) { setMeta('name', 'description', cfg.description); setMeta('property', 'og:description', cfg.description); setMeta('name', 'twitter:description', cfg.description); }
    if (cfg.keywords) setMeta('name', 'keywords', cfg.keywords);
    if (cfg.ogImage) { const img = cfg.ogImage.startsWith('http') ? cfg.ogImage : window.location.origin + cfg.ogImage; setMeta('property', 'og:image', img); setMeta('name', 'twitter:image', img); }
  }, [seo, pathname]);
  return null;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

  // Intercept clicks on internal links in dangerouslySetInnerHTML content
  useEffect(() => {
    const handleClick = (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      // Only intercept internal links (starting with / but not //)
      if (href && href.startsWith('/') && !href.startsWith('//') && !a.target) {
        e.preventDefault();
        navigate(href);
        window.scrollTo(0, 0);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [navigate]);
  return (
    <>
      <SeoManager />
      {!isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/philosophy" element={<Philosophy />} />
        <Route path="/residential" element={<Residential />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
