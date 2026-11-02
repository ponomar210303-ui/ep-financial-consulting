'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Linkedin, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CONTACT } from '@/lib/site';

// Public Web3Forms key (delivers to the e-mail registered at web3forms.com).
const WEB3FORMS_KEY = '929e8f83-7c01-4eea-a57e-0e73be12b604';

function makeSchema(e) {
  return z.object({
    name: z.string().trim().min(2, e.name),
    email: z.string().trim().email(e.email),
    message: z.string().trim().min(10, e.message),
    consent: z.literal(true, { errorMap: () => ({ message: e.consent }) }),
    // Honeypot: Web3Forms drops submissions where botcheck is filled in.
    botcheck: z.string().max(0),
  });
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

export default function Contact({ locale, t }) {
  const f = t.form;
  const [status, setStatus] = useState('idle'); // idle | sent | failed
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(makeSchema(f.errors)),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', message: '', consent: false, botcheck: '' },
  });

  const onSubmit = async (values) => {
    setStatus('idle');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: values.name,
          email: values.email,
          message: values.message,
          subject: `${f.subject} ${values.name}`,
          botcheck: values.botcheck,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      reset();
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  const channels = [
    { icon: Mail, label: t.channels.email, value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: Linkedin, label: t.channels.linkedin, value: 'evgenii-ponomarev', href: CONTACT.linkedin, external: true },
    { icon: Phone, label: t.channels.phone, value: CONTACT.phone, href: CONTACT.phoneHref, external: true },
  ];

  const inputClass = 'h-11 bg-background border-input text-base sm:text-sm';

  return (
    <section id="contact" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">{t.intro}</p>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {channels.map(({ icon: Icon, label, value, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-center gap-4 py-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm text-muted-foreground">{label}</span>
                    <span className="block truncate font-medium">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5 rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-8"
        >
          <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register('botcheck')} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">{f.name}</Label>
              <Input
                id="c-name"
                autoComplete="name"
                className={inputClass}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'c-name-err' : undefined}
                {...register('name')}
              />
              <FieldError id="c-name-err" message={errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">{f.email}</Label>
              <Input
                id="c-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'c-email-err' : undefined}
                {...register('email')}
              />
              <FieldError id="c-email-err" message={errors.email?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-message">{f.message}</Label>
            <Textarea
              id="c-message"
              rows={5}
              className="bg-background border-input text-base sm:text-sm"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'c-message-err' : undefined}
              {...register('message')}
            />
            <FieldError id="c-message-err" message={errors.message?.message} />
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Controller
                name="consent"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="c-consent"
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    onBlur={field.onBlur}
                    aria-invalid={!!errors.consent}
                    className="mt-0.5"
                  />
                )}
              />
              <Label htmlFor="c-consent" className="text-sm font-normal leading-relaxed text-muted-foreground">
                {f.consentBefore}
                <Link href={`/${locale}/privacy`} className="text-foreground underline underline-offset-2 hover:text-primary">
                  {f.consentLink}
                </Link>
                .
              </Label>
            </div>
            <FieldError message={errors.consent?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? f.sending : f.submit}
          </button>

          <div aria-live="polite">
            {status === 'sent' && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{f.success}</p>
            )}
            {status === 'failed' && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {f.failure}{' '}
                <a href={`mailto:${CONTACT.email}`} className="font-medium underline">{CONTACT.email}</a>.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
