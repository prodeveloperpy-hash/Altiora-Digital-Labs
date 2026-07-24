import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cardsApi } from '@/features/cards/api/cardsApi';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { ROUTES, STORAGE_KEYS } from '@/config/constants';

export function HomeBenefitMatcher() {
  const navigate = useNavigate();
  const catalog = useQuery({
    queryKey: ['questionnaire'],
    queryFn: ({ signal }) => cardsApi.questionnaire(signal),
  });
  const [selected, setSelected] = useState<string[]>([]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!selected.length) return;
    sessionStorage.setItem(STORAGE_KEYS.recommendationBenefits, JSON.stringify(selected));
    navigate(ROUTES.recommendations);
  };

  return (
    <form onSubmit={submit} className="min-w-0 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">What matters most in your next card?</h2>
        <p className="mt-2 text-muted-foreground">
          Select one, several, or every available requirement.
        </p>
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.data?.categories.map((category) => (
          <fieldset
            key={category.name}
            className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <legend className="max-w-full px-1 text-sm font-semibold text-primary sm:text-base">
              {category.name}
            </legend>
            <div className="mt-2 grid min-w-0 gap-2">
              {category.benefits.map((benefit) => (
                <Checkbox
                  key={benefit.code}
                  id={`pick-${benefit.code}`}
                  label={benefit.name}
                  className="w-full rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-muted/60 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5"
                  checked={selected.includes(benefit.code)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, benefit.code]
                        : current.filter((code) => code !== benefit.code),
                    )
                  }
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="flex justify-center">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!selected.length}>
          Show my top 5
        </Button>
      </div>
    </form>
  );
}
