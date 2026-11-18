/**
 * Editable website wording. The admin "Page Text" screen is built from this
 * list, and the website reads the same keys — so adding a field here makes it
 * editable in the admin automatically (after wiring t('key', default) in a page).
 * `default` is what shows until the admin saves something different.
 */
export const TEXT_FIELDS = [
  { page: 'Home', key: 'home.hero.eyebrow', label: 'Top small line', default: 'Tile & Flooring · Residential & Commercial' },
  { page: 'Home', key: 'home.hero.title', label: 'Main headline', default: 'We design spaces\nthat feel timeless.', multiline: true, hint: 'Press Enter for a new line.' },
  { page: 'Home', key: 'home.hero.sub', label: 'Sub-headline', default: 'Tile Installation · Bathroom Upgrades · Kitchen Backsplash · Custom Showers' },
  { page: 'Home', key: 'home.hero.cta1', label: 'First button', default: 'Explore Projects' },
  { page: 'Home', key: 'home.hero.cta2', label: 'Second button', default: 'Start a Conversation' },
  { page: 'Home', key: 'home.philosophy.heading', label: 'Philosophy heading', default: 'Good Design Yearns For Boundless Style That Is Underlined By Simplicity' },

  { page: 'About', key: 'about.hero.title', label: 'Page title', default: 'About Us' },
  { page: 'About', key: 'about.hero.sub', label: 'Tagline', default: 'Built on craftsmanship. Driven by detail.' },
  { page: 'About', key: 'about.who.heading', label: 'Intro heading', default: 'Craftsmanship with purpose.' },
  { page: 'About', key: 'about.who.p1', label: 'Intro paragraph 1', default: 'Renovate Max2Max Inc. is focused on delivering quality renovation, tile, flooring, and home improvement solutions with a strong attention to detail.', multiline: true },
  { page: 'About', key: 'about.who.p2', label: 'Intro paragraph 2', default: 'From bathrooms and kitchens to custom showers, flooring, fireplaces, waterproofing, and home improvements, every project is approached with care, precision, and practical thinking.', multiline: true },
  { page: 'About', key: 'about.founder.heading', label: 'Owner heading', default: 'Meet Gurdeep' },
  { page: 'About', key: 'about.founder.role', label: 'Owner role', default: 'Founder / Owner' },
  { page: 'About', key: 'about.founder.p1', label: 'Owner paragraph 1', default: 'Gurdeep Singh is the hands-on owner behind Renovate Max2Max. He takes pride in doing the work properly — not quickly — and in leaving every space cleaner, sharper, and better than he found it.', multiline: true },
  { page: 'About', key: 'about.founder.p2', label: 'Owner paragraph 2', default: 'His approach is built on careful preparation, clean execution, and clear communication. He believes that clients should feel confident at every stage of a project, from the first conversation to the final walkthrough.', multiline: true },
  { page: 'About', key: 'about.founder.p3', label: 'Owner paragraph 3', default: 'For Gurdeep, quality is not a promise; it is the result of paying attention to the details that most people do not notice.', multiline: true },

  { page: 'Services', key: 'services.hero.sub', label: 'Tagline', default: 'Craftsmanship, precision, and thoughtful solutions for every space.' },
  { page: 'Services', key: 'services.intro.heading', label: 'Intro heading', default: 'Built around quality.' },
  { page: 'Services', key: 'services.intro.text', label: 'Intro text', default: 'From detailed tile installation to complete home improvements, we bring careful planning, quality materials, and precise craftsmanship to every project.', multiline: true },

  { page: 'Residential', key: 'residential.hero.sub', label: 'Tagline', default: 'Thoughtfully crafted spaces, designed around the way you live.' },
  { page: 'Philosophy', key: 'philosophy.hero.sub', label: 'Intro text', default: 'We believe that great spaces are not just built; they are considered. Every material, every joint, and every finish is a chance to create something lasting, meaningful, and quietly beautiful.', multiline: true },

  { page: 'Contact', key: 'contact.hero.title', label: 'Page title', default: "Let's Talk" },
  { page: 'Contact', key: 'contact.hero.sub', label: 'Tagline', default: "Have a project in mind? Let's turn your ideas into something beautifully built." },
  { page: 'Contact', key: 'contact.person', label: 'Contact person', default: 'Gurdeep Singh' },

  { page: 'Footer', key: 'footer.blurb', label: 'Footer description', default: 'A tile and renovation studio serving Edmonton and the surrounding area — crafting durable, beautiful floors, bathrooms, kitchens and feature work for homes and businesses.', multiline: true },
];

export const TEXT_PAGES = [...new Set(TEXT_FIELDS.map((f) => f.page))];
export const TEXT_DEFAULTS = Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, f.default]));

/** Default contact/settings values (what the site showed before settings were wired up). */
export const SETTINGS_DEFAULTS = {
  siteName: 'Renovate Max2Max Inc.',
  phone: '+1 (437) 869-8609',
  email: 'Renovatemax2max@gmail.com',
  address: 'Edmonton, Alberta',
  country: 'Canada',
  hours: 'Monday — Friday · 10:00 — 18:30',
  instagram: 'https://instagram.com/',
  facebook: '',
  pinterest: 'https://pinterest.com/',
  linkedin: 'https://linkedin.com/',
  whatsapp: '+14378698609',
};
