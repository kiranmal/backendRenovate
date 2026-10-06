import WorkSection from '../components/WorkSection.jsx';

export default function Home() {
  // Fallback items for each category (used if backend has no projects)
  const fallbackResidential = [
    { title: 'Modern Bathroom', image: '/images/IMG_0573.JPG.jpeg', description: 'A complete modern bathroom with marble-look floor, double vanity and a clean, glass shower.' },
    { title: 'Open Kitchen', image: '/images/IMG_0595.JPG.jpeg', description: 'A bright open kitchen and living area finished with large-format tile, warm cabinetry and clean sightlines.' },
    { title: 'Custom Shower', image: '/images/IMG_9545.jpg', description: 'Frameless glass and a recessed tile niche, finished with mitered edges for a precise, high-end look.' },
  ];
  const fallbackTiles = [
    { title: 'Patterned Hallway', image: '/images/IMG_9389.jpg', description: 'Hexagon tile flooring laid in a hallway, creating visual rhythm and long-term durability.' },
    { title: 'Large-Format Floor', image: '/images/IMG_9415.jpg', description: 'Large-format grey tile flooring with clean grout lines and a professional finish.' },
    { title: 'Geometric Floor', image: '/images/IMG_9564.jpg', description: 'Patterned hexagon tiles arranged with precision for visual rhythm in wet areas and entries.' },
    { title: 'Hex Tile Detail', image: '/images/IMG_0609.JPG.jpeg', description: 'A close-up of hexagonal tile flooring with a bold black-and-white pattern and crisp grout lines.' },
  ];
  const fallbackBathrooms = [
    { title: 'Modern Bathroom', image: '/images/IMG_0608.JPG.jpeg', description: 'A full bathroom with floor-to-ceiling tile, modern fixtures and a clean, bright finish.' },
    { title: 'Double Vanity', image: '/images/IMG_0573.JPG.jpeg', description: 'His and hers vanities, LED mirrors and soft storage in a bright, modern bathroom.' },
    { title: 'Complete Bathroom', image: '/images/IMG_8818.jpg', description: 'A full bathroom with freestanding tub, vanity and floor-to-ceiling tile for a refined finish.' },
    { title: 'Elegant Double Vanity', image: '/images/IMG_0578.JPG.jpeg', description: 'A bright double vanity with brushed gold fixtures, round mirrors and marble-look floor tile.' },
    { title: 'Custom Vanity', image: '/images/IMG_0634.JPG.jpeg', description: 'A modern bathroom with warm wood cabinetry, vessel sinks and clean, simple lines.' },
    { title: 'Marble Bathroom', image: '/images/IMG_8820.jpg', description: 'Marble-look tile throughout for a bright, refined bathroom finish.' },
    { title: 'Bathroom Renovation', image: '/images/IMG_9662.jpg', description: 'A complete bathroom refresh with new tile, fixtures and finishes.' },
  ];
  const fallbackShowers = [
    { title: 'Glass Enclosure', image: '/images/IMG_0581.JPG.jpeg', description: 'Frameless glass and neutral tile create a spacious, spa-like shower.' },
    { title: 'Recessed Niche', image: '/images/IMG_9545.jpg', description: 'A built-in niche finished with accent tile for toiletries and clean styling.' },
    { title: 'Tub & Shower', image: '/images/IMG_0604.jpg', description: 'A tub and shower surround finished in marble-look tile for a calm, refined wet area.' },
    { title: 'Premium Custom Shower', image: '/images/IMG_0572.JPG.jpeg', description: 'A luxury walk-in shower with brushed gold fixtures, marble-look tile, hexagon floor and a built-in bench.' },
    { title: 'Tub & Shower Combo', image: '/images/IMG_0574.JPG.jpeg', description: 'A tub and shower combination with matte black fixtures and a hexagonal accent niche.' },
    { title: 'Shower Base & Tile', image: '/images/IMG_9437.jpg', description: 'Shower base installation with patterned floor tile — solid waterproofing underneath.' },
    { title: 'Custom Tile Shower', image: '/images/IMG_9543.jpg', description: 'Custom tile work in a walk-in shower, built to perform and made to last.' },
    { title: 'Hex Feature Shower', image: '/images/IMG_9546.jpg', description: 'A feature wall of hexagonal patterned tile turns this shower into a focal point.' },
  ];
  const fallbackKitchens = [
    { title: 'Subway Backsplash', image: '/images/IMG_0308.jpg', description: 'A clean white subway tile backsplash that brightens the kitchen and complements the cabinets.' },
    { title: 'Warm Kitchen', image: '/images/IMG_0447.jpg', description: 'A spacious open kitchen finished with marble-look flooring and warm natural light.' },
    { title: 'Marble Backsplash', image: '/images/IMG_0595.JPG.jpeg', description: 'Marble-look tile backsplash that brings quiet luxury behind the range.' },
  ];

  const html1 = `
<section class="hero" id="home">
  <div class="hero-inner">
    <p class="eyebrow">Tile &amp; Flooring · Residential &amp; Commercial</p>
    <h1>We design spaces<br>that feel timeless.</h1>
    <p class="sub">Tile Installation · Bathroom Upgrades · Kitchen Backsplash · Custom Showers</p>
    <div class="actions">
      <a href="#projects" class="btn-primary">Explore Projects <span style="font-size:1.1rem;">→</span></a>
      <a href="#contact" class="btn-outline">Start a Conversation <span style="font-size:1.1rem;">→</span></a>
    </div>
  </div>
  <a href="#philosophy" class="scroll">
    <span>Scroll to explore</span>
    <span class="line"></span>
  </a>
</section>

<section class="triad" id="philosophy">
  <div class="container">
    <div class="head">
      <h2>Good Design Yearns For Boundless Style That Is Underlined By Simplicity</h2>
      <div class="line"></div>
    </div>
    <div class="triad-grid">
      <article class="card">
        <div class="thumb">
          <img src="/images/IMG_0455.jpg" alt="Open kitchen and living space" loading="lazy" decoding="async">
        </div>
        <h3>Residential</h3>
        <p>Every home has its own rhythm. We craft bathrooms, kitchens, showers and floors with care — balancing the clean lines of modern design with the practical demands of daily life.</p>
      </article>
      <article class="card">
        <div class="thumb">
          <img src="/images/IMG_0212.jpg" alt="Freestanding bathtub in a light-filled bathroom" loading="lazy" decoding="async">
        </div>
        <h3>Bathrooms</h3>
        <p>We build bathrooms that feel like a retreat and function like a machine, with waterproofing, precise tile work and custom showers that last.</p>
      </article>
      <article class="card">
        <div class="thumb">
          <img src="/images/IMG_0308.jpg" alt="White subway tile kitchen backsplash" loading="lazy" decoding="async">
        </div>
        <h3>Kitchens</h3>
        <p>The kitchen is the heart of the home. We install backsplashes, floors and finishes that balance warmth, texture and everyday practicality.</p>
      </article>
    </div>
  </div>
</section>

<section class="category" id="residential" style="background-image:url('/images/IMG_0447.jpg');">
  <div class="cat-content">
    <p class="eyebrow">Residential</p>
    <h2>Residential</h2>
    <p>Where life unfolds. We approach each home with the belief that finishes should be both beautiful and livable — custom showers that feel like a retreat, backsplashes that catch the morning light, and floors that carry a family through every season.</p>
  </div>
</section>
  `;

  const html2 = `
<section class="category" id="tiles" style="background-image:url('/images/IMG_0383.jpg');">
  <div class="cat-content">
    <p class="eyebrow">Tile &amp; Flooring</p>
    <h2>Tiles</h2>
    <p>Every floor, wall and backsplash starts with the right tile. We install porcelain, ceramic and stone tiles with clean grout lines, level surfaces and finishes that feel solid and look refined for years.</p>
  </div>
</section>
  `;

  const html3 = `
<section class="category" id="bathrooms" style="background-image:url('/images/IMG_0635.JPG.jpeg');">
  <div class="cat-content">
    <p class="eyebrow">Bathrooms</p>
    <h2>Bathrooms</h2>
    <p>A bathroom should feel like a sanctuary and function like a machine. We build complete bathrooms with precise waterproofing, tile walls, floors and fixtures so the space stays beautiful through years of daily use.</p>
  </div>
</section>
  `;

  const html4 = `
<section class="category" id="showers" style="background-image:url('/images/IMG_0618.JPG.jpeg');">
  <div class="cat-content">
    <p class="eyebrow">Showers &amp; Waterproofing</p>
    <h2>Showers</h2>
    <p>Every shower is built from the waterproofing layer up. We design custom layouts, recessed niches, mitered edges and tile finishes that stay beautiful through years of daily use.</p>
  </div>
</section>
  `;

  const html5 = `
<section class="category" id="kitchens" style="background-image:url('/images/IMG_0455.jpg');">
  <div class="cat-content">
    <p class="eyebrow">Kitchens &amp; Backsplashes</p>
    <h2>Kitchens</h2>
    <p>The kitchen is the heart of the home, and the backsplash is its signature. We design and install tile backsplashes that balance warmth, texture and practicality, creating a focal point that works alongside prep, cooking and conversation.</p>
  </div>
</section>
  `;

  const html6 = `
<section class="services" id="services">
  <div class="container">
    <p class="eyebrow reveal" style="text-align:center;">What We Do</p>
    <h2 class="section-title">Our Services</h2>
    <p class="lead">From carefully laid floors to precisely cut edges, every service is delivered with the discipline of a craftsman and the care of someone who treats your space as their own.</p>
    <div class="service-grid">
      <a href="/services/tile-flooring" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">01</p>
        <h3>Tile &amp; Flooring</h3>
        <p>We install porcelain, ceramic and stone tiles with clean grout lines, level surfaces and finishes that feel solid underfoot for years.</p>
      </a>
      <a href="/services/bathroom-upgrades" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">02</p>
        <h3>Bathroom Upgrades</h3>
        <p>Complete bathroom transformations — new tile walls, floors, fixtures and waterproofing that turn an ordinary room into a calm, durable retreat.</p>
      </a>
      <a href="/services/custom-showers" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">03</p>
        <h3>Custom Showers</h3>
        <p>Built from the waterproofing layer up, with custom tile layouts, niche details and mitered edges that look as good as they perform.</p>
      </a>
      <a href="/services/kitchen-backsplash" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">04</p>
        <h3>Kitchen Backsplash</h3>
        <p>Backsplashes that frame the kitchen with texture and colour, installed with precision around outlets, corners and cabinets.</p>
      </a>
      <a href="/services/waterproofing" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">05</p>
        <h3>Waterproofing</h3>
        <p>Solid waterproofing for showers, bathrooms and wet areas so the beauty on the surface is backed by protection underneath.</p>
      </a>
      <a href="/services/fireplace-tile" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">06</p>
        <h3>Fireplace Tile</h3>
        <p>A tiled fireplace becomes the room's anchor. We handle layout, heat-safe materials and crisp edges for a refined focal point.</p>
      </a>
      <a href="/services/mitered-finishes" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">07</p>
        <h3>45&deg; Mitered Finishes</h3>
        <p>Premium 45-degree tile cuts and mitered edges that create clean corners, seamless steps and a custom, high-end look.</p>
      </a>
      <a href="/services/home-repairs" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">08</p>
        <h3>Home Repairs</h3>
        <p>Thoughtful repairs and improvements that bring older rooms back to life without cutting corners on quality or finish.</p>
      </a>
      <a href="/services/appliance-installation" class="service service-link" style="text-decoration:none;color:inherit;display:block;">
        <p class="num">09</p>
        <h3>Appliance Installation</h3>
        <p>Professional installation support for appliances during your renovation, ensuring everything fits, sits level and functions safely.</p>
      </a>
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="container">
    <div class="about-grid">
      <div>
        <img src="/images/IMG_9687.jpg" alt="Completed open interior renovation" loading="lazy" decoding="async">
      </div>
      <div>
        <p class="eyebrow">About Us</p>
        <h2>Built on Precision, Led by Care</h2>
        <p>Renovate Max2Max Inc. is an Edmonton-based tile and renovation company founded on the belief that the smallest details shape the biggest impressions. From a single backsplash to a full home renovation, we treat every surface, corner and cutline as a reflection of our commitment to the craft.</p>
        <p>Led by Gurdeep Singh, our team brings precision, patience and pride to every residential and commercial project across Edmonton and the surrounding area. We listen first, plan carefully, and finish with a level of care that makes the work last.</p>
        <div class="sig">
          <strong>Gurdeep Singh</strong>
          <span>Renovate Max2Max Inc.</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="contact" id="contact">
  <div class="container">
    <p class="eyebrow reveal" style="text-align:center;">Get in Touch</p>
    <h2>Start the Conversation</h2>
    <p class="lead">Tell us what you are planning. We will help you choose materials, map the scope and deliver a finish that is precise, durable and worth looking at for years.</p>
    <div class="contact-grid">
      <div class="contact-info reveal">
        <h3>Renovate Max2Max Inc.</h3>
        <p>Edmonton, Alberta, Canada</p>
        <p><a href="tel:+14378698609">+1 (437) 869-8609</a></p>
        <p><a href="mailto:Renovatemax2max@gmail.com">Renovatemax2max@gmail.com</a></p>
        <p>Service Area: Edmonton and surrounding areas</p>
      </div>
      <form class="form reveal" id="quoteForm" onsubmit="return false">
        <input type="text" name="name" placeholder="Your name" required>
        <input type="tel" name="phone" placeholder="Phone number" required>
        <input type="email" name="email" placeholder="Email address">
        <select name="type" required>
          <option value="" disabled selected>Project Type</option>
          <option value="Bathroom">Bathroom</option>
          <option value="Shower">Shower</option>
          <option value="Flooring">Flooring</option>
          <option value="Kitchen Backsplash">Kitchen Backsplash</option>
          <option value="Fireplace">Fireplace</option>
          <option value="Waterproofing">Waterproofing</option>
          <option value="Home Repair">Home Repair</option>
          <option value="Commercial">Commercial</option>
          <option value="Other">Other</option>
        </select>
        <textarea name="details" rows="4" placeholder="Tell us a little about your project..."></textarea>
        <button type="submit">Request a Free Quote</button>
      </form>
    </div>
  </div>
</section>
  `;

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: html1 }} />
      <WorkSection category="Residential" eyebrow="Residential" fallback={fallbackResidential} limit={3} />
      <div dangerouslySetInnerHTML={{ __html: html2 }} />
      <WorkSection category="Tile & Flooring" eyebrow="Tile & Flooring" fallback={fallbackTiles} limit={3} />
      <div dangerouslySetInnerHTML={{ __html: html3 }} />
      <WorkSection category="Bathroom" eyebrow="Bathrooms" fallback={fallbackBathrooms} limit={3} />
      <div dangerouslySetInnerHTML={{ __html: html4 }} />
      <WorkSection category="Shower" eyebrow="Showers" fallback={fallbackShowers} limit={3} />
      <div dangerouslySetInnerHTML={{ __html: html5 }} />
      <WorkSection category="Kitchen" eyebrow="Kitchens" fallback={fallbackKitchens} limit={3} />
      <div dangerouslySetInnerHTML={{ __html: html6 }} />
    </div>
  );
}
