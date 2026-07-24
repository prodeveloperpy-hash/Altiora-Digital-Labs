import { PageHeader } from '@/components/layout/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function ContactPage() {
  useDocumentTitle('Contact');
  return (
    <div className="container py-10 sm:py-14">
      <PageHeader title="Contact us" description="Questions, corrections, or card-data updates? Send our team a note." />
      <section className="mt-8 max-w-2xl rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Project information</h2>
        <p className="mt-2 text-muted-foreground">CCRS is a deterministic, SQLite-backed credit-card comparison and recommendation project by Altiora Digital Labs.</p>
        <p className="mt-3"><strong>Email:</strong> <a className="text-primary underline" href="mailto:hello@altioradigitallabs.com">hello@altioradigitallabs.com</a></p>
      </section>
      <form className="mt-10 max-w-2xl space-y-5 rounded-xl border bg-card p-6" action="mailto:hello@altioradigitallabs.com" method="post" encType="text/plain">
        <label className="block text-sm font-medium">Name<input name="name" required className="mt-2 h-11 w-full rounded-lg border bg-background px-3" /></label>
        <label className="block text-sm font-medium">Email<input name="email" type="email" required className="mt-2 h-11 w-full rounded-lg border bg-background px-3" /></label>
        <label className="block text-sm font-medium">Message<textarea name="message" required rows={6} className="mt-2 w-full rounded-lg border bg-background p-3" /></label>
        <button className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">Send message</button>
      </form>
    </div>
  );
}
