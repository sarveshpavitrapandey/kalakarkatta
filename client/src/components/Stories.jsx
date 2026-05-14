import { stories } from "../data/content.js";

export default function Stories() {
  return (
    <section className="stories" id="stories">
      <div className="container">
        <header className="section-header">
          <h2>Community Stories</h2>
          <p>Insights, behind-the-scenes, and reflections from the KalakarKatta family.</p>
        </header>
        <div className="story-list">
          {stories.map((story) => (
            <article className="story-card" key={story.title}>
              <span className="story-tag">{story.tag}</span>
              <h3>{story.title}</h3>
              <p>{story.description}</p>
              <a href={story.href} className="text-link">
                {story.linkLabel}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

