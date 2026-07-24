import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cardsApi } from '@/features/cards/api/cardsApi';
import { apiClient } from '@/lib/apiClient';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/constants';
import type { BenefitOption, CreditCard } from '@/features/cards/types';

interface Match {
  card: CreditCard; ranking: number; matchPercentage: number;
  matchedBenefits: string[]; missingBenefits: string[]; explanation: string;
}

export function HomeBenefitMatcher() {
  const catalog = useQuery({ queryKey: ['filters'], queryFn: ({ signal }) => cardsApi.filters(signal) });
  const [selected, setSelected] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>();
  const [loading, setLoading] = useState(false);
  const groups = useMemo(() => (catalog.data?.benefits ?? []).reduce<Record<string, BenefitOption[]>>((all, item) => {
    (all[item.category] ??= []).push(item);
    return all;
  }, {}), [catalog.data]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected.length) return;
    setLoading(true);
    try {
      const result = await apiClient.post<{ recommendations: Match[] }, { benefits: string[] }>('/recommend', { benefits: selected });
      setMatches(result.recommendations);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">What matters most in your next card?</h2>
        <p className="mt-2 text-muted-foreground">Pick benefits across any category. Every option and weight comes from the database.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groups).map(([category, options]) => (
          <fieldset key={category} className="rounded-xl border bg-card p-5">
            <legend className="px-1 font-semibold text-primary">{category}</legend>
            <div className="mt-2 space-y-3">{options?.map((option) => (
              <Checkbox key={option.code} id={`pick-${option.code}`} label={option.name}
                checked={selected.includes(option.code)}
                onChange={(e) => setSelected((current) => e.target.checked ? [...current, option.code] : current.filter((x) => x !== option.code))} />
            ))}</div>
          </fieldset>
        ))}
      </div>
      <div className="flex justify-center"><Button type="submit" size="lg" disabled={!selected.length || loading}>{loading ? 'Scoring cards…' : 'Show my top 5'}</Button></div>
      {matches && <div className="grid gap-4 lg:grid-cols-5">
        {matches.map((match) => <article key={match.card.id} className="rounded-xl border bg-card p-4">
          <p className="text-sm font-bold text-primary">#{match.ranking} · {match.matchPercentage}% match</p>
          <h3 className="mt-2 font-semibold">{match.card.name}</h3>
          <p className="mt-2 text-xs text-muted-foreground">{match.explanation}</p>
          <dl className="mt-3 space-y-1 text-xs">
            <div><dt className="font-semibold">Joining fee</dt><dd>₹{match.card.joiningFee}</dd></div>
            <div><dt className="font-semibold">Fee waiver</dt><dd>{match.card.feeWaiver || 'None'}</dd></div>
            <div><dt className="font-semibold">Reward rate</dt><dd>{match.card.rewardRate}</dd></div>
            <div><dt className="font-semibold">Eligibility</dt><dd>{match.card.eligibility}</dd></div>
            <div><dt className="font-semibold">Income</dt><dd>{match.card.incomeRequirement}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-success">Matched: {match.matchedBenefits.join(', ') || 'None'}</p>
          <p className="mt-1 text-xs text-muted-foreground">Missing: {match.missingBenefits.join(', ') || 'None'}</p>
          <Link to={ROUTES.cardDetails(match.card.id)} className="mt-3 inline-block text-sm font-semibold text-primary">View card</Link>
        </article>)}
      </div>}
    </form>
  );
}
