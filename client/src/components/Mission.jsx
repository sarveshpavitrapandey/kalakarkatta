import { missionHighlights } from "../data/content.js";

export default function Mission() {
  return (
    <section className="mission" id="mission">
      <div className="container">
        <div className="mission-card">
          <h2>Our Mission</h2>
          <p>
            Foster a thriving, inclusive ecosystem for local creatives by providing access to stages, stories, resources, and a supportive
            community that amplifies every voice.
          </p>
          <div className="mission-grid">
            {missionHighlights.map((item) => (
              <div key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

