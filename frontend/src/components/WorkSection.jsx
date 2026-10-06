import { useContent, imageUrl } from '../hooks/useContent.js';

/**
 * Selected Work section — fetches projects from backend API and renders
 * a triad grid of project cards for a given category.
 * Falls back to provided static items if no API projects exist.
 */
export default function WorkSection({ category, eyebrow, fallback = [], limit }) {
  const { data: projects, loading } = useContent('projects');

  // Filter API projects by category (case-insensitive partial match)
  const apiProjects = (projects || []).filter((p) => {
    const cat = (p.category || '').toLowerCase();
    const target = category.toLowerCase();
    return cat.includes(target) || target.includes(cat);
  });

  // Use API projects if available, otherwise fallback to static items
  let items = apiProjects.length > 0 ? apiProjects : fallback;
  if (limit) items = items.slice(0, limit);

  if (items.length === 0) return null;

  return (
    <section className="triad" id={`work-${category.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="container">
        <div className="head">
          <h2>Selected Work</h2>
          <div className="line"></div>
        </div>
        <div className="triad-grid">
          {items.map((p, i) => (
            <article className="card" key={p.id || i}>
              <div className="thumb">
                <img src={imageUrl(p.image)} alt={p.title || 'Project'} loading="lazy" decoding="async" />
              </div>
              <h3>{p.title || 'Project'}</h3>
              <p>{p.description || ''}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
