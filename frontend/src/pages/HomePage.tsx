import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Scale,
  Search as SearchIcon,
  Wallet,
} from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { CardGrid } from '@/features/cards/components/CardGrid';
import { CardGridSkeleton } from '@/features/cards/components/CardSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useFeaturedCards } from '@/features/cards/hooks/useFeaturedCards';
import { useCategories } from '@/features/cards/hooks/useCategories';
import { CATEGORY_LABELS } from '@/features/cards/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES, APP_NAME } from '@/config/constants';
import { HomeBenefitMatcher } from '@/features/questionnaire/components/HomeBenefitMatcher';
import { CardSearchInput } from '@/features/cards/components/CardSearchInput';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Tell us about you',
    description: 'Answer a few quick questions about your spending, credit, and goals.',
  },
  {
    icon: Sparkles,
    title: 'Get matched',
    description: 'Our rules-based engine ranks cards by how well they fit your profile.',
  },
  {
    icon: Scale,
    title: 'Compare & choose',
    description: 'Weigh rewards, fees, and perks side by side, then apply with confidence.',
  },
];

const VALUE_PROPS = [
  { icon: ShieldCheck, title: 'Unbiased matching', description: 'Rankings come from transparent rules — never paid placement.' },
  { icon: Wallet, title: 'Real savings', description: 'Find the rewards and low rates that actually fit how you spend.' },
  { icon: SearchIcon, title: 'Everything in one place', description: 'Search, compare, and review hundreds of cards without the noise.' },
];

export default function HomePage() {
  useDocumentTitle();
  const featured = useFeaturedCards();
  const categories = useCategories();
  const navigate = useNavigate();

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient border-b border-border">
        <div className="container grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="animate-fade-in-up space-y-6">
            <Badge variant="primary" className="px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Personalized, rules-based recommendations
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find the <span className="text-gradient">right credit card</span> for the way you spend
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              {APP_NAME} matches you with cards based on your goals, credit, and spending — then lets
              you compare them side by side. No guesswork, no bias.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={ROUTES.questionnaire}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-base font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Get my matches
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                to={ROUTES.search}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-input bg-card px-7 text-base font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Browse all cards
              </Link>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-4">
              {[
                { label: 'Supported banks', value: '6' },
                { label: 'Match accuracy', value: 'Rules-based' },
                { label: 'Cost to you', value: 'Free' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                  <dd className="text-xl font-bold text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="animate-fade-in-up space-y-4 [animation-delay:120ms]">
              <div className="ml-auto w-72 rotate-3 rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground shadow-elevated">
                <p className="text-xs uppercase tracking-wide opacity-80">Rewards</p>
                <p className="mt-6 text-lg font-semibold">Best for everyday spend</p>
                <p className="mt-1 text-sm opacity-80">Cash back on groceries & dining</p>
              </div>
              <div className="w-72 -rotate-2 rounded-2xl border border-border bg-card p-6 shadow-elevated">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Travel</p>
                <p className="mt-6 text-lg font-semibold text-foreground">Miles that go further</p>
                <p className="mt-1 text-sm text-muted-foreground">No foreign transaction fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="recommendation-questionnaire">
        <div className="mx-auto mb-10 max-w-2xl">
          <h2 className="mb-3 text-center text-2xl font-bold">Quick card search</h2>
          <CardSearchInput value="" onDebouncedChange={(query) => query && navigate(`${ROUTES.search}?q=${encodeURIComponent(query)}`)} />
        </div>
        <HomeBenefitMatcher />
      </Section>

      {/* How it works */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">How it works</h2>
          <p className="mt-2 text-muted-foreground">
            Three simple steps to a card that actually fits.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative rounded-xl border border-border bg-card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="absolute right-6 top-6 text-4xl font-bold text-secondary">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            to={ROUTES.questionnaire}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start the questionnaire
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      {/* Featured cards */}
      <Section className="bg-card/40">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured cards</h2>
            <p className="mt-2 text-muted-foreground">Popular picks across every category.</p>
          </div>
          <Link
            to={ROUTES.search}
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {featured.isLoading ? (
          <CardGridSkeleton count={3} />
        ) : featured.isError ? (
          <ErrorState error={featured.error} onRetry={() => featured.refetch()} isRetrying={featured.isFetching} />
        ) : !featured.data || featured.data.length === 0 ? (
          <EmptyState title="No featured cards yet" description="Check back soon for curated picks." />
        ) : (
          <CardGrid cards={featured.data.slice(0, 6)} />
        )}
      </Section>

      {/* Categories */}
      <Section>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Browse by category</h2>
          <p className="mt-2 text-muted-foreground">Jump straight to the type of card you need.</p>
        </div>

        {categories.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skeleton-shimmer h-24 rounded-xl bg-muted/70" />
            ))}
          </div>
        ) : categories.isError ? (
          <ErrorState error={categories.error} onRetry={() => categories.refetch()} compact />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(categories.data ?? []).map((category) => (
              <Link
                key={category.id}
                to={`${ROUTES.search}?category=${category.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-semibold text-foreground group-hover:text-primary">
                  {category.name || CATEGORY_LABELS[category.slug]}
                </span>
                <span className="mt-2 text-sm text-muted-foreground">
                  {category.cardCount} {category.cardCount === 1 ? 'card' : 'cards'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Value props + CTA */}
      <Section className="bg-card/40">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="flex gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
                <prop.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{prop.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{prop.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to find your match?</h2>
          <p className="mx-auto mt-2 max-w-xl text-primary-foreground/90">
            It takes about two minutes. No sign-up, no impact to your credit score.
          </p>
          <Link
            to={ROUTES.questionnaire}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-card px-7 text-base font-semibold text-primary transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            Get started
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </Section>
    </>
  );
}
