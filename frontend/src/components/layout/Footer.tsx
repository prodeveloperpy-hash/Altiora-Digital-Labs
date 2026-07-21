import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ROUTES, APP_NAME } from '@/config/constants';

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { to: ROUTES.search, label: 'Browse cards' },
      { to: ROUTES.questionnaire, label: 'Get matched' },
      { to: ROUTES.compare, label: 'Compare cards' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: ROUTES.about, label: 'About us' },
      { to: ROUTES.faq, label: 'FAQ' },
    ],
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Personalized, unbiased credit card recommendations powered by transparent,
            rules-based matching — never paid placement.
          </p>
        </div>

        {FOOTER_SECTIONS.map((section) => (
          <nav key={section.title} aria-label={section.title} className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {APP_NAME}. For informational purposes only — not financial advice.
          </p>
          <p>
            Rates and terms are provided by issuers and subject to change. Confirm details before
            applying.
          </p>
        </div>
      </div>
    </footer>
  );
}
