import { Link } from 'react-router-dom';
import { ArrowRight, Database, Scale, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES, APP_NAME } from '@/config/constants';

const PRINCIPLES = [
  {
    icon: Database,
    title: 'Rules, not black boxes',
    description:
      'Every recommendation comes from transparent, database-driven rules — no opaque algorithms and no machine learning deciding for you.',
  },
  {
    icon: Scale,
    title: 'Genuinely unbiased',
    description:
      'We rank cards by how well they fit your profile, never by who pays the most. Your best match is our only goal.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy first',
    description:
      'Your questionnaire answers stay in your browser. We do not require an account and we do not run credit checks.',
  },
  {
    icon: Users,
    title: 'Built for real people',
    description:
      'Whether you are building credit or optimizing rewards, the experience adapts to your situation.',
  },
];

const STATS = [
  { value: '300+', label: 'Cards analyzed' },
  { value: '8', label: 'Card categories' },
  { value: '100%', label: 'Rules-based matching' },
  { value: '$0', label: 'Cost to you' },
];

export default function AboutPage() {
  useDocumentTitle('About');

  return (
    <div className="pb-6">
      <Section>
        <PageHeader
          eyebrow="About us"
          title={`Why ${APP_NAME} exists`}
          description="Choosing a credit card should be simple, transparent, and in your interest — not the issuer's. We built a matching engine that puts your goals first."
        />
      </Section>

      <Section className="bg-card/40 py-8">
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-3xl font-extrabold text-gradient sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <div className="grid gap-6 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="rounded-xl border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <principle.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{principle.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">How our matching works</h2>
          <p className="text-muted-foreground">
            When you complete the questionnaire, we send your goals, credit profile, and spending
            habits to our matching engine. It evaluates every card against a set of transparent
            rules — weighing annual fees, rewards categories, APR, and eligibility — and returns a
            ranked list with a plain-language explanation for each match. You stay in control: every
            recommendation shows exactly why it fits.
          </p>
          <div className="pt-2">
            <Link
              to={ROUTES.questionnaire}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-base font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Try it now
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
