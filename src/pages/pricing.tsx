import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PricingProps {
  navigate: (to: string) => void;
}

const plans = [
  {
    name: 'Free',
    price: 'KSh 0',
    period: 'forever',
    description: 'Everything you need to build and save a CV.',
    features: [
      'Create your CV',
      'Basic template',
      'Live CV preview',
      'Local saving on your device',
      'Unlimited editing',
    ],
    cta: 'Start Free',
    to: '#/builder',
    featured: false,
  },
  {
    name: 'Professional',
    price: 'KSh 199',
    period: 'one-time',
    description: 'For job seekers who want premium templates and PDF export.',
    features: [
      'All Free features',
      'Premium templates',
      'PDF download',
      'Multiple CV templates',
      'Cover letter builder',
      'More customization options',
    ],
    cta: 'Get Professional',
    to: '#/builder',
    featured: true,
  },
  {
    name: 'Complete Job Kit',
    price: 'KSh 399',
    period: 'one-time',
    description: 'The full toolkit for serious job applicants.',
    features: [
      'Professional CV',
      'Cover letter',
      'Job application email template',
      'Multiple CV templates',
      'Job application tools',
      'Priority support',
    ],
    cta: 'Get the Job Kit',
    to: '#/builder',
    featured: false,
  },
];

export function Pricing({ navigate }: PricingProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Simple, one-time pricing
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Pricing that fits your job hunt
        </h1>
        <p className="mt-3 text-muted-foreground">
          Start free, upgrade when you need more. No subscriptions, no hidden
          fees — pay once and it's yours.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'flex flex-col border',
              plan.featured
                ? 'border-primary shadow-lg ring-1 ring-primary/20 lg:scale-[1.02]'
                : 'border-border/60'
            )}
          >
            {plan.featured && (
              <div className="rounded-t-xl bg-primary py-1.5 text-center text-xs font-semibold text-primary-foreground">
                Most Popular
              </div>
            )}
            <CardContent className="flex flex-1 flex-col p-6">
              <h2 className="text-lg font-bold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/ {plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button
                className="w-full"
                variant={plan.featured ? 'default' : 'outline'}
                onClick={() => navigate(plan.to)}
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-2xl rounded-xl border bg-secondary/30 p-6 text-center">
        <h3 className="font-semibold">Payment coming soon</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The free plan is fully available today. Paid plans will be activated
          with secure M-Pesa and card payments soon — your CV is always saved on
          your device in the meantime.
        </p>
        <Button variant="outline" onClick={() => navigate('#/builder')} className="mt-4">
          Build my CV now
        </Button>
      </div>
    </div>
  );
}
