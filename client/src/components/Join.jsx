import { useState, useContext } from "react";
import { membershipTiers } from "../data/content.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const variantClassMap = {
  primary: "primary",
  secondary: "secondary",
  ghost: "ghost",
};

function TierCard({ tier }) {
  const { user } = useContext(AuthContext);
  const variantClass = variantClassMap[tier.variant] ?? "primary";
  return (
    <article className={`tier-card${tier.highlighted ? " highlighted" : ""}`}>
      <div className="tier-heading">
        <span className="tier-name">{tier.name}</span>
        <span className="tier-price">
          {tier.price}
          <span>{tier.frequency}</span>
        </span>
      </div>
      <ul>
        {tier.perks.map((perk) => (
          <li key={perk}>{perk}</li>
        ))}
      </ul>
      <Link to={user ? "/feed" : "/login"} className={`cta ${variantClass} no-underline text-center inline-block`}>
        {tier.cta}
      </Link>
    </article>
  );
}

function JoinForm() {
  const [buttonLabel, setButtonLabel] = useState("Submit");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    setButtonLabel("Thanks!");
    setDisabled(true);

    setTimeout(() => {
      form.reset();
      setButtonLabel("Submit");
      setDisabled(false);
    }, 2400);
  };

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <h3>Register interest</h3>
      <p>We’ll reach out with next steps, mentorship matches, and upcoming opportunities.</p>
      <label>
        Full name
        <input type="text" name="name" placeholder="Your name" required />
      </label>
      <label>
        Email
        <input type="email" name="email" placeholder="you@example.com" required />
      </label>
      <label>
        Discipline
        <select name="discipline" defaultValue="" required>
          <option value="" disabled>
            Select your primary focus
          </option>
          <option>Music</option>
          <option>Visual Arts</option>
          <option>Storytelling</option>
          <option>Dance & Theatre</option>
          <option>Film & Media</option>
        </select>
      </label>
      <label>
        Tell us about your practice
        <textarea name="message" rows="4" placeholder="Share your current projects or goals" />
      </label>
      <button type="submit" className="cta primary full-width" disabled={disabled}>
        {buttonLabel}
      </button>
    </form>
  );
}

export default function Join() {
  return (
    <section className="join" id="join">
      <div className="container">
        <div className="join-content">
          <header>
            <h2>Join & Collaborate</h2>
            <p>Start your membership, showcase your craft, and connect with collaborators today.</p>
          </header>
          <div className="tiers">
            {membershipTiers.map((tier) => (
              <TierCard key={tier.name} tier={tier} />
            ))}
          </div>
        </div>
        <JoinForm />
      </div>
    </section>
  );
}
