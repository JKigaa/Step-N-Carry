import {
  FileText,
  Eye,
  MapPin,
  Download,
  Pencil,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CvPreview } from '@/components/cv/cv-preview';
import { sampleCv } from '@/lib/cv-data';

interface LandingProps {
  navigate: (to: string) => void;
}

const valueCards = [
  {
    icon: FileText,
    title: 'Professional Templates',
    desc: 'Choose from clean, recruiter-approved templates designed to make your CV stand out.',
  },
  {
    icon: Eye,
    title: 'Live CV Preview',
    desc: 'See your CV update in real time as you type — no surprises when you download.',
  },
  {
    icon: MapPin,
    title: 'Kenyan-Friendly Fields',
    desc: 'Built for the Kenyan job market with KCSE, diploma, TVET and M-Pesa-ready examples.',
  },
  {
    icon: Download,
    title: 'PDF Download',
    desc: 'Export a clean, print-ready A4 PDF with proper page breaks and readable text.',
  },
  {
    icon: Pencil,
    title: 'Easy Editing',
    desc: 'Add, remove and reorder sections with a simple, intuitive editor.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    desc: 'Build your CV anywhere — fully responsive on phones, tablets and desktops.',
  },
];

const steps = [
  { n: '1', title: 'Enter your details', desc: 'Add your personal info, experience, education and skills.' },
  { n: '2', title: 'Choose your template', desc: 'Pick from Modern, Professional or ATS-friendly layouts.' },
  { n: '3', title: 'Preview your CV', desc: 'Watch your CV come together with a live, real-time preview.' },
  { n: '4', title: 'Download your CV', desc: 'Export a polished PDF, ready to send to employers.' },
];

export function Landing({ navigate }: LandingProps) {
  const sample = sampleCv();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Built for the Kenyan job market
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build a Professional CV in Minutes
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Create a polished, job-ready CV designed for the Kenyan job market.
              Choose a template, add your experience, preview your CV and download
              it when you're ready.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate('#/builder')} className="text-base">
                Create My CV
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('#/templates')}
                className="text-base"
              >
                View Templates
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No login required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Saved on your device
              </span>
            </div>
          </div>

          {/* CV mockup */}
          <div className="relative animate-fade-up lg:pl-8" style={{ animationDelay: '0.15s' }}>
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />
            <div className="overflow-hidden rounded-xl border bg-white shadow-2xl ring-1 ring-black/5">
              <div
                className="origin-top scale-[0.78] sm:scale-[0.62] md:scale-[0.7] lg:scale-[0.8]"
                style={{ transformOrigin: 'top left' }}
              >
                <CvPreview cv={sample} />
              </div>
            </div>
            <div className="mt-3 hidden items-center justify-center gap-2 text-xs text-muted-foreground lg:flex">
              <Eye className="h-3.5 w-3.5" />
              Live preview — this is a real CV template
            </div>
          </div>
        </div>
      </section>

      {/* Value cards */}
      <section className="border-t bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to create a better CV
            </h2>
            <p className="mt-3 text-muted-foreground">
              All the tools to build, customise and download a professional CV —
              in one place.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {valueCards.map((card) => (
              <Card
                key={card.title}
                className="border-border/60 transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {card.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              From blank page to polished CV in four simple steps.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.n} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-sm">
                  {step.n}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="absolute left-12 top-6 hidden h-px w-[calc(100%-3rem)] bg-border lg:block"
                    aria-hidden="true"
                  />
                )}
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent px-6 py-12 text-center text-primary-foreground shadow-lg sm:px-12 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to create your CV?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
            Join thousands of Kenyan job seekers building professional CVs with
            CV Chap. It's free to start.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('#/builder')}
            className="mt-7 text-base"
          >
            Create My CV
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
