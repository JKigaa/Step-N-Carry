import { useRef } from 'react';
import { User, Upload, X, Wand2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field, SectionHeader } from '@/components/builder/builder-primitives';
import type { CvData, PersonalInfo } from '@/types/cv';
import { buildSuggestedSummary } from '@/lib/summary-suggestions';

interface Props {
  cv: CvData;
  setCv: (updater: (prev: CvData) => CvData) => void;
  errors: Record<string, string>;
  onToast: (msg: string) => void;
}

export function PersonalSection({ cv, setCv, errors, onToast }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const p = cv.personal;

  const update = (patch: Partial<PersonalInfo>) =>
    setCv((prev) => ({ ...prev, personal: { ...prev.personal, ...patch } }));

  const onPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onToast('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onToast('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update({ photo: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Personal Information"
        description="Start with the basics. These appear at the top of your CV."
      />

      {/* Photo */}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-secondary">
          {p.photo ? (
            <img src={p.photo} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload Photo
            </Button>
            {p.photo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => update({ photo: '' })}
                className="text-destructive hover:text-destructive"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Optional. Square images work best. Max 2MB.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="fullName" required error={errors.fullName}>
          <Input
            id="fullName"
            value={p.fullName}
            onChange={(e) => update({ fullName: e.target.value })}
            placeholder="Amani Wanjiru"
            aria-invalid={!!errors.fullName}
          />
        </Field>
        <Field label="Professional Title" htmlFor="title">
          <Input
            id="title"
            value={p.professionalTitle}
            onChange={(e) => update({ professionalTitle: e.target.value })}
            placeholder="Customer Service Representative"
          />
        </Field>
        <Field label="Phone Number" htmlFor="phone" error={errors.phone} hint={!errors.phone ? 'e.g. +254 712 345 678' : undefined}>
          <Input
            id="phone"
            value={p.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="+254 7XX XXX XXX"
            inputMode="tel"
          />
        </Field>
        <Field label="Email Address" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            value={p.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="you@email.com"
            inputMode="email"
          />
        </Field>
        <Field label="Location" htmlFor="location">
          <Input
            id="location"
            value={p.location}
            onChange={(e) => update({ location: e.target.value })}
            placeholder="Nairobi, Kenya"
          />
        </Field>
        <Field label="LinkedIn URL" htmlFor="linkedin">
          <Input
            id="linkedin"
            value={p.linkedin}
            onChange={(e) => update({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/username"
          />
        </Field>
        <Field label="Portfolio / Website URL" htmlFor="portfolio" className="sm:col-span-2">
          <Input
            id="portfolio"
            value={p.portfolio}
            onChange={(e) => update({ portfolio: e.target.value })}
            placeholder="yourwebsite.com"
          />
        </Field>
      </div>

      {/* Summary */}
      <div className="space-y-3 border-t pt-6">
        <SectionHeader
          title="Professional Summary"
          description="A short paragraph that introduces you to employers."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                update({ summary: buildSuggestedSummary(p.summary) });
                onToast('Summary suggestion added — edit it to make it yours.');
              }}
            >
              <Wand2 className="mr-1.5 h-3.5 w-3.5" />
              Improve Summary
            </Button>
          }
        />
        <Textarea
          id="summary"
          value={p.summary}
          onChange={(e) => update({ summary: e.target.value })}
          placeholder="Results-driven professional with experience in customer service, sales and digital operations..."
          rows={4}
          maxLength={600}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Aim for 2–4 sentences highlighting your strengths.</span>
          <span>{p.summary.length}/600</span>
        </div>
      </div>
    </div>
  );
}
