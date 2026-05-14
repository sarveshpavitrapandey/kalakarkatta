import { offerings } from "../data/content.js";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Offerings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLinkClick = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };
  return (
    <section className="offerings" id="offerings">
      <div className="container">
        <header className="section-header">
          <h2>What We Offer</h2>
          <p>Curated opportunities that help you level-up your craft and connect with fellow creators.</p>
        </header>
        <div className="card-grid">
          {offerings.map((item) => (
            <article className="card" key={item.title}>
              <div className="card-icon" aria-hidden="true">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link 
                to={item.href === "#join" ? "/signup" : item.href === "#stories" ? "/community" : "/events"} 
                className="text-link no-underline"
                onClick={(e) => handleLinkClick(e, item.href)}
              >
                {item.linkLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

