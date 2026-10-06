import { useEffect } from 'react';
import { useSiteImages, imageUrl } from '../hooks/useContent.js';

export default function Header() {
  const si = useSiteImages();
  useEffect(() => {
    const header = document.getElementById('header');
    const toggle = document.getElementById('toggle');
    const menu = document.getElementById('menu');

    const onScroll = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const onToggle = () => {
      if (menu) menu.classList.toggle('open');
    };
    const onLinkClick = () => {
      if (menu) menu.classList.remove('open');
    };

    if (toggle) toggle.addEventListener('click', onToggle);
    if (menu) menu.querySelectorAll('a').forEach(a => a.addEventListener('click', onLinkClick));

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (toggle) toggle.removeEventListener('click', onToggle);
      if (menu) menu.querySelectorAll('a').forEach(a => a.removeEventListener('click', onLinkClick));
    };
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: `<header id="header">
  <div class="header-inner">
    <a href="/" class="logo"><img src="${imageUrl(si.get('header-logo', 0, '/images/logo.png'))}" alt="Renovate Max2Max" class="logo-img"></a>
    <button class="menu-toggle" id="toggle" aria-label="Menu"><span></span><span></span><span></span></button>
    <nav class="menu" id="menu">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/residential">Residential</a>
      <a href="/services">Services</a>
      <a href="/philosophy">Philosophy</a>
      <a href="/contact">Contact</a>
      <a href="tel:+14378698609" class="phone-link">+1 (437) 869-8609</a>
      <a href="/contact" class="start-link">Start a Project</a>
    </nav>
  </div>
</header>` }} />
  );
}