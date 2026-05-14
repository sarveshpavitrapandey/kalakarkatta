import { resources } from "../data/content.js";

export default function Resources() {
  return (
    <section className="resources" id="resources">
      <div className="container">
        <header className="section-header">
          <h2>Spaces & Resources</h2>
          <p>Unlock tools designed to help you practice, perform, and grow sustainably.</p>
        </header>
        <div className="resource-grid">
          {resources.map((resource) => (
            <article className="resource-card" key={resource.title}>
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <ul>
                {resource.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a href={resource.href} className="text-link">
                {resource.linkLabel}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

