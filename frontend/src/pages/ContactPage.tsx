import { PageHeader } from '@/components/layout/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function ContactPage() {
  useDocumentTitle('Contact');
  return (
    <div className="container py-10 sm:py-14">
      <PageHeader title="Contact us" description="Questions, corrections, or card-data updates? Send our team a note." />
      <form className="mt-10 max-w-2xl space-y-5 rounded-xl border bg-card p-6" action="mailto:hello@altioradigitallabs.com" method="post" encType="text/plain">
        <label className="block text-sm font-medium">Name<input name="name" required className="mt-2 h-11 w-full rounded-lg border bg-background px-3" /></label>
        <label className="block text-sm font-medium">Email<input name="email" type="email" required className="mt-2 h-11 w-full rounded-lg border bg-background px-3" /></label>
        <label className="block text-sm font-medium">Message<textarea name="message" required rows={6} className="mt-2 w-full rounded-lg border bg-background p-3" /></label>
        <button className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">Send message</button>
      </form>
    </div>
  );
}
