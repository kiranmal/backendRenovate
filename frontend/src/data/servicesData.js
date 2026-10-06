/**
 * Service detail pages data — drives /services/:slug routes.
 * Each service maps to project categories so backend projects
 * with matching categories appear in its gallery automatically.
 */
export const SERVICES = [
  {
    slug: 'tile-flooring',
    num: '01',
    title: 'Tile & Flooring',
    categories: ['Tile & Flooring', 'Flooring', 'Tile'],
    hero: '/images/IMG_0383.jpg',
    intro: 'Porcelain, ceramic and stone tile installed with clean grout lines, level surfaces and finishes that feel solid underfoot for years.',
    points: [
      'Porcelain, ceramic & natural stone',
      'Large-format & patterned layouts',
      'Floor levelling & substrate prep',
      'Clean, consistent grout lines',
    ],
    images: ['/images/IMG_9389.jpg', '/images/IMG_9415.jpg', '/images/IMG_9564.jpg', '/images/IMG_0609.JPG.jpeg', '/images/IMG_9381.jpg'],
  },
  {
    slug: 'bathroom-upgrades',
    num: '02',
    title: 'Bathroom Upgrades',
    categories: ['Bathroom', 'Bathrooms'],
    hero: '/images/IMG_0635.JPG.jpeg',
    intro: 'Complete bathroom transformations — new tile walls, floors, fixtures and waterproofing that turn an ordinary room into a calm, durable retreat.',
    points: [
      'Floor-to-ceiling tile work',
      'Vanities, fixtures & lighting',
      'Tub-to-shower conversions',
      'Full waterproofing systems',
    ],
    images: ['/images/IMG_0608.JPG.jpeg', '/images/IMG_0573.JPG.jpeg', '/images/IMG_8818.jpg', '/images/IMG_0578.JPG.jpeg', '/images/IMG_0634.JPG.jpeg', '/images/IMG_8820.jpg', '/images/IMG_9662.jpg', '/images/IMG_0212.jpg'],
  },
  {
    slug: 'custom-showers',
    num: '03',
    title: 'Custom Showers',
    categories: ['Shower', 'Showers'],
    hero: '/images/IMG_0618.JPG.jpeg',
    intro: 'Built from the waterproofing layer up, with custom tile layouts, niche details and mitered edges that look as good as they perform.',
    points: [
      'Custom tile layouts & niches',
      'Frameless glass ready',
      'Bench seats & curbs',
      'Precision waterproofing',
    ],
    images: ['/images/IMG_0572.JPG.jpeg', '/images/IMG_0574.JPG.jpeg', '/images/IMG_0581.JPG.jpeg', '/images/IMG_9545.jpg', '/images/IMG_0604.jpg', '/images/IMG_9437.jpg', '/images/IMG_9543.jpg', '/images/IMG_9546.jpg'],
  },
  {
    slug: 'kitchen-backsplash',
    num: '04',
    title: 'Kitchen Backsplash',
    categories: ['Kitchen', 'Kitchens'],
    hero: '/images/IMG_0455.jpg',
    intro: 'Backsplashes that frame the kitchen with texture and colour, installed with precision around outlets, corners and cabinets.',
    points: [
      'Subway, mosaic & slab tile',
      'Precision cuts around outlets',
      'Grout & sealant finishing',
      'Design-forward layouts',
    ],
    images: ['/images/IMG_0308.jpg', '/images/IMG_0447.jpg', '/images/IMG_0595.JPG.jpeg'],
  },
  {
    slug: 'waterproofing',
    num: '05',
    title: 'Waterproofing',
    categories: ['Waterproofing', 'Shower'],
    hero: '/images/IMG_0618.JPG.jpeg',
    intro: 'Solid waterproofing for showers, bathrooms and wet areas so the beauty on the surface is backed by protection underneath.',
    points: [
      'Shower pan & wall membranes',
      'Wet area sealing systems',
      'Flood-tested assemblies',
      'Long-term leak protection',
    ],
    images: ['/images/IMG_9437.jpg', '/images/IMG_9543.jpg', '/images/IMG_9546.jpg'],
  },
  {
    slug: 'fireplace-tile',
    num: '06',
    title: 'Fireplace Tile',
    categories: ['Fireplace'],
    hero: '/images/IMG_9446.jpg',
    intro: 'A tiled fireplace becomes the room\'s anchor. We handle layout, heat-safe materials and crisp edges for a refined focal point.',
    points: [
      'Heat-safe tile & stone',
      'Floor-to-ceiling surrounds',
      'Mantel & hearth details',
      'Clean edge finishing',
    ],
    images: ['/images/IMG_9446.jpg', '/images/IMG_0383.jpg'],
  },
  {
    slug: 'mitered-finishes',
    num: '07',
    title: '45° Mitered Finishes',
    categories: ['Mitered', 'Tile'],
    hero: '/images/IMG_9381.jpg',
    intro: 'Premium 45-degree tile cuts and mitered edges that create clean corners, seamless steps and a custom, high-end look.',
    points: [
      'Precision 45° angle cuts',
      'Seamless outside corners',
      'Niche & step detailing',
      'High-end finish work',
    ],
    images: ['/images/IMG_9381.jpg', '/images/IMG_9545.jpg', '/images/IMG_9546.jpg'],
  },
  {
    slug: 'home-repairs',
    num: '08',
    title: 'Home Repairs',
    categories: ['Repair', 'Home Repairs'],
    hero: '/images/IMG_9687.jpg',
    intro: 'Thoughtful repairs and improvements that bring older rooms back to life without cutting corners on quality or finish.',
    points: [
      'Tile & grout repairs',
      'Surface restoration',
      'Fixture replacements',
      'Detail corrections',
    ],
    images: ['/images/IMG_9662.jpg', '/images/IMG_0460.jpg', '/images/IMG_9687.jpg'],
  },
  {
    slug: 'appliance-installation',
    num: '09',
    title: 'Appliance Installation',
    categories: ['Appliance', 'Kitchen'],
    hero: '/images/IMG_0595.JPG.jpeg',
    intro: 'Professional installation support for appliances during your renovation, ensuring everything fits, sits level and functions safely.',
    points: [
      'Range & hood installation',
      'Dishwasher & fridge fit',
      'Level & secure mounting',
      'Renovation coordination',
    ],
    images: ['/images/IMG_0595.JPG.jpeg', '/images/IMG_0308.jpg', '/images/IMG_0455.jpg'],
  },
];

export function getService(slug) {
  return SERVICES.find((s) => s.slug === slug);
}
