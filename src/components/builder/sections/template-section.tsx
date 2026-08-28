import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionHeader } from '@/components/builder/builder-primitives';
import type { CvData, TemplateId, FontFamily, CvSettings } from '@/types/cv';
import { cn } from '@/lib/utils';

interface Props {
  cv: CvData;
  setCv: (updater: (prev: CvData) => CvData) => void;
}

const templates: { id: TemplateId; name: string; desc: string }[] = [
  { id: 'modern', name: 'Modern', desc: 'Clean two-column with accent header.' },
  { id: 'professional', name: 'Professional', desc: 'Traditional, corporate, centred.' },
  { id: 'ats', name: 'ATS Friendly', desc: 'Simple single column for online systems.' },
];

const colors = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Navy', value: '#1e3a8a' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Slate', value: '#334155' },
  { name: 'Charcoal', value: '#1f2937' },
  { name: 'Crimson', value: '#b91c1c' },
  { name: 'Amber', value: '#b45309' },
];

const fonts: FontFamily[] = ['Inter', 'Lato', 'Merriweather', 'Roboto Slab'];

export function TemplateCustomizationSection({ cv, setCv }: Props) {
  const s = cv.settings;

  const update = (patch: Partial<CvSettings>) =>
    setCv((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Template & Customization"
        description="Pick a layout and fine-tune the look. Your content stays the same."
      />

      {/* Template picker */}
      <div className="grid gap-3 sm:grid-cols-3">
        {templates.map((t) => {
          const active = s.template === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => update({ template: t.id })}
              className={cn(
                'rounded-lg border p-3 text-left transition-all',
                active
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t.name}</span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Accent color */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Accent Color</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => update({ accentColor: c.value })}
              className={cn(
                'h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
                s.accentColor === c.value ? 'ring-foreground' : 'ring-transparent'
              )}
              style={{ backgroundColor: c.value }}
              aria-label={c.name}
              title={c.name}
            />
          ))}
          <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-white">
            <input
              type="color"
              value={s.accentColor}
              onChange={(e) => update({ accentColor: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom color"
            />
            <span className="text-xs text-muted-foreground">+</span>
          </label>
        </div>
      </div>

      {/* Font family */}
      <div className="space-y-2">
        <Label htmlFor="font-family" className="text-sm font-medium">Font Family</Label>
        <Select value={s.fontFamily} onValueChange={(v) => update({ fontFamily: v as FontFamily })}>
          <SelectTrigger id="font-family" className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-size" className="text-sm font-medium">Font Size</Label>
          <span className="text-xs text-muted-foreground">{s.fontSize}px</span>
        </div>
        <Slider
          id="font-size"
          min={11}
          max={16}
          step={1}
          value={[s.fontSize]}
          onValueChange={(v) => update({ fontSize: v[0] })}
        />
      </div>

      {/* Section spacing */}
      <div className="space-y-2">
        <Label htmlFor="spacing" className="text-sm font-medium">Section Spacing</Label>
        <Select
          value={s.sectionSpacing}
          onValueChange={(v) => update({ sectionSpacing: v as CvSettings['sectionSpacing'] })}
        >
          <SelectTrigger id="spacing" className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="relaxed">Relaxed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
