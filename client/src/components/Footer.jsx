import { useMemo, useState } from "react";

const footerColumns = [
  {
    heading: "Community",
    links: [
      { href: "#events", label: "Events" },
      { href: "#creators", label: "Creators" },
      { href: "#stories", label: "Stories" },
      { href: "#resources", label: "Resources" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "#mission", label: "Mission" },
      { href: "#support", label: "Support" },
      { href: "#", label: "Press kit" },
      { href: "#", label: "Partnerships" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { href: "#", label: "Instagram" },
      { href: "#", label: "YouTube" },
      { href: "#", label: "Spotify" },
      { href: "mailto:hello@kalakarkatta.com", label: "hello@kalakarkatta.com" },
    ],
  },
];

const legalLinks = [
  { href: "#", label: "Community guidelines" },
  { href: "#", label: "Privacy policy" },
  { href: "#", label: "Terms" },
];

export default function Footer() {
  const [buttonLabel, setButtonLabel] = useState("Subscribe");
  const [disabled, setDisabled] = useState(false);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const handleSubscribe = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setButtonLabel("Thanks!");
    setDisabled(true);

    setTimeout(() => {
      form.reset();
      setButtonLabel("Subscribe");
      setDisabled(false);
    }, 2400);
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">
              <span className="note">♪</span>
              <span className="spark">✦</span>
            </div>
            <span className="brand-name">KalakarKatta</span>
          </div>
          <p className="footer-intro">
            A vibrant community platform connecting musicians, artists, storytellers, and patrons across the city.
          </p>
          <form className="newsletter" onSubmit={handleSubscribe}>
            <label htmlFor="newsletter-email">Stay in the loop</label>
            <div>
              <input id="newsletter-email" type="email" placeholder="Email address" required />
              <button type="submit" className="cta secondary" disabled={disabled}>
                {buttonLabel}
              </button>
            </div>
          </form>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h4>{column.heading}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="container footer-bottom">
        <small>
          © {currentYear} KalakarKatta Community Collective. All rights reserved.
        </small>
        <div className="footer-links">
          {legalLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

