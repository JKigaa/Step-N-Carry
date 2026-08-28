import {
  UserPlus,
  LayoutTemplate,
  Eye,
  Download,
  ShieldCheck,
  Smartphone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AboutProps {
  navigate: (to: string) => void;
}

const steps = [
  {
    icon: UserPlus,
    title: 'Enter your details',
    desc: 'Add your personal information, work experience, education, skills and more using a simple form.',
  },
  {
    icon: LayoutTemplate,
    title: 'Choose your template',
    desc: 'Pick from Modern, Professional or ATS-friendly layouts. Switch anytime without losing content.',
  },
  {
    icon: Eye,
    title: 'Preview your CV',
    desc: 'Watch your CV update in real time on the right side of the builder as you type.',
  },
  {
    icon: Download,
    title: 'Download your CV',
    desc: 'Export a clean, print-ready A4 PDF with proper page breaks. Name it and send it to employers.',
  },
];

const features = [
  {
    icon: MapPin,
    title: 'Built for Kenya',
    desc: 'Kenyan examples throughout — KCSE, diploma, TVET, M-Pesa operations and more. Works internationally too.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    desc: 'Your CV is stored only on your device. We never send your information to any server.',
  },
  {
    icon: Smartphone,
    title: 'Works everywhere',
    desc: 'Fully responsive — build your CV on your phone, tablet or desktop with no horizontal scrolling.',
  },
];

export function About({ navigate }: AboutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How CV Chap Works
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          CV Chap is a free CV builder designed for the Kenyan job market. Build
          a professional CV in minutes — no login, no downloads, no cost to
          start. Your work is saved automatically on your device.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" onClick={() => navigate('#/builder')}>
            Create My CV
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('#/templates')}>
            View Templates
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold">Four simple steps</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.title} className="border-border/60">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-xs font-semibold text-muted-foreground">
                  Step {i + 1}
                </div>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold">Why CV Chap?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/60">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-center text-2xl font-bold">Common questions</h2>
        <div className="mt-6 space-y-4">
          <FaqItem
            q="Do I need to create an account?"
            a="No. CV Chap works without any login. Just open the builder and start typing — your work is saved on your device automatically."
          />
          <FaqItem
            q="Is my CV information sent anywhere?"
            a="No. All your CV data stays in your browser's local storage on your device. Nothing is uploaded to a server."
          />
          <FaqItem
            q="Can I download my CV as a PDF?"
            a="Yes. The PDF download creates a clean A4 document with proper page breaks, ready to email or print."
          />
          <FaqItem
            q="Can I switch templates without losing my information?"
            a="Absolutely. Your content stays the same when you switch templates — only the layout changes."
          />
          <FaqItem
            q="Does it work on my phone?"
            a="Yes. CV Chap is fully responsive. On mobile, use the Preview button to see your CV and download it."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-16 max-w-5xl rounded-2xl bg-gradient-to-br from-primary to-accent px-6 py-12 text-center text-primary-foreground shadow-lg sm:px-12">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Ready to build your CV?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-primary-foreground/90">
          It's free to start. No login required.
        </p>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate('#/builder')}
          className="mt-6"
        >
          Create My CV
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="font-semibold">{q}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
