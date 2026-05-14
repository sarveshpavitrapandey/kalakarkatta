import { supportOptions } from "../data/content.js";

export default function Support() {
  return (
    <section className="support" id="support">
      <div className="container">
        <header className="section-header">
          <h2>Support Local Creatives</h2>
          <p>Shop limited-edition merch, tip performers, or commission projects that uplift the community.</p>
        </header>
        <div className="support-grid">
          {supportOptions.map((option) => (
            <article key={option.title}>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              <button className="cta tertiary" type="button">
                {option.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

