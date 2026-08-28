import { Check, ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CvPreview } from '@/components/cv/cv-preview';
import { sampleCv } from '@/lib/cv-data';
import type { CvData, TemplateId } from '@/types/cv';

interface TemplatesProps {
  navigate: (to: string) => void;
}

const templateMeta: { id: TemplateId; name: string; tagline: string; desc: string }[] = [
  {
    id: 'modern',
    name: 'Modern',
    tagline: 'Clean & Contemporary',
    desc: 'A two-column layout with a bold accent header. Great for most roles and industries.',
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Traditional & Corporate',
    desc: 'A classic centred layout with serif styling. Ideal for experienced professionals and corporate roles.',
  },
  {
    id: 'ats',
    name: 'ATS Friendly',
    tagline: 'Simple & Readable',
    desc: 'A single-column, minimal layout designed to pass Applicant Tracking Systems used by online job portals.',
  },
];

export function Templates({ navigate }: TemplatesProps) {
  const base = sampleCv();

  const buildSample = (template: TemplateId): CvData => ({
    ...base,
    settings: { ...base.settings, template },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Choose Your CV Template
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every template works with the same information. Switch anytime in the
          builder without losing your content.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {templateMeta.map((t) => (
          <Card key={t.id} className="flex flex-col overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
            {/* Preview */}
            <div className="relative h-[420px] overflow-hidden border-b bg-muted/40 p-4">
              <div className="absolute inset-0 flex items-start justify-center overflow-hidden p-4">
                <div className="origin-top scale-[0.42] sm:scale-[0.5]">
                  <CvPreview cv={buildSample(t.id)} />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Eye className="h-3 w-3" />
                Live preview
              </div>
            </div>

            <CardContent className="flex flex-1 flex-col p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{t.name}</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {t.tagline}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <Button
                className="w-full"
                onClick={() => navigate(`#/builder?template=${t.id}`)}
              >
                Use this template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-secondary/40 p-8 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Check className="h-4 w-4" />
            All templates included
          </div>
          <p className="text-sm text-muted-foreground">
            Switch between templates any time in the builder. Your CV content
            stays exactly the same — only the layout changes.
          </p>
          <Button variant="outline" onClick={() => navigate('#/builder')} className="mt-2">
            Open the CV Builder
          </Button>
        </div>
      </div>
    </div>
  );
}
