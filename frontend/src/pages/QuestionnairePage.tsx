import { Link } from 'react-router-dom';
import { Lock, Clock, ShieldCheck } from 'lucide-react';
import { QuestionnaireForm } from '@/features/questionnaire/components/QuestionnaireForm';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/config/constants';

export default function QuestionnairePage() {
  useDocumentTitle('Get matched');

  return (
    <div className="container max-w-3xl py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Let&rsquo;s find your card
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Answer a few quick questions and we&rsquo;ll rank the cards that best fit your profile.
          Your answers stay in your browser.
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <li className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            About 2 minutes
          </li>
          <li className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            No credit impact
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
            No sign-up required
          </li>
        </ul>
      </div>

      <QuestionnaireForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Prefer to look around first?{' '}
        <Link to={ROUTES.search} className="font-semibold text-primary hover:underline">
          Browse all cards
        </Link>
        .
      </p>
    </div>
  );
}
