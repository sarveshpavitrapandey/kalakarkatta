import heroIllustration from "../assets/hero-illustration.svg";
import { heroStats } from "../data/content.js";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Hero() {
  const { user } = useContext(AuthContext);
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-content">
          <span className="eyebrow">Community of Creators</span>
          <h1>
            Celebrate Local Talent.
            <br />
            Collaborate. Create. Shine.
          </h1>
          <p>
            KalakarKatta is where musicians, visual artists, storytellers, and performers come together to co-create vibrant experiences
            for our city.
          </p>
          <div className="hero-actions">
            <Link className="cta primary no-underline" to={user ? "/feed" : "/login"}>
              {user ? "Go to Dashboard" : "Join the Community"}
            </Link>
            <Link className="cta ghost no-underline" to={user ? "/events" : "/login"}>
              Explore Events
            </Link>
          </div>
          <div className="hero-badges">
            {heroStats.map((stat) => (
              <div className="badge" key={stat.label}>
                <span className="badge-icon" aria-hidden="true">
                  {stat.icon}
                </span>
                <div>
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <img src={heroIllustration} alt="" />
        </div>
      </div>
      <div className="hero-blur hero-blur-1" />
      <div className="hero-blur hero-blur-2" />
    </section>
  );
}

