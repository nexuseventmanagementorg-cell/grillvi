import Link from 'next/link';
import { Settings2 } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <section className="w-full space-y-5 rounded-3xl border border-grill-border bg-grill-card p-8 text-center shadow-card sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-grill-gold/10 text-grill-gold">
          <Settings2 className="h-7 w-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-grill-gold">
          CONTACT INFORMATION
        </span>
        <h1 className="font-heading text-3xl font-black text-white sm:text-4xl">
          Add Your Business Details
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-400">
          This template does not include a restaurant phone number or address. Sign in to the
          admin portal to add your own business information before publishing.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-grill-orange to-grill-red px-6 py-3 text-sm font-bold text-white shadow-orangeGlow transition-all hover:from-grill-orange-light"
        >
          Open Admin Portal
        </Link>
      </section>
    </div>
  );
}
