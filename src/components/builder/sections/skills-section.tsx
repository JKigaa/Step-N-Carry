import { useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionHeader } from '@/components/builder/builder-primitives';
import type { CvData, Language, LanguageProficiency } from '@/types/cv';
import { emptySkill, emptyLanguage } from '@/lib/cv-data';

interface Props {
  cv: CvData;
  setCv: (updater: (prev: CvData) => CvData) => void;
}

const proficiencies: LanguageProficiency[] = [
  'Basic',
  'Intermediate',
  'Fluent',
  'Native',
];

const skillSuggestions = [
  'Microsoft Excel',
  'Customer Service',
  'Sales',
  'Digital Marketing',
  'M-Pesa Operations',
  'Communication',
  'Leadership',
  'Data Analysis',
];

export function SkillsSection({ cv, setCv }: Props) {
  const [input, setInput] = useState('');

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (cv.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setInput('');
      return;
    }
    setCv((prev) => ({ ...prev, skills: [...prev.skills, emptySkill(trimmed)] }));
    setInput('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input);
    }
  };

  const removeSkill = (id: string) =>
    setCv((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));

  const unusedSuggestions = skillSuggestions.filter(
    (s) => !cv.skills.some((cs) => cs.name.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Skills"
        description="Add skills that match the jobs you're applying for."
      />

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a skill and press Enter"
          aria-label="Add a skill"
        />
        <Button type="button" onClick={() => addSkill(input)} disabled={!input.trim()}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add skill</span>
        </Button>
      </div>

      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          {unusedSuggestions.slice(0, 5).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSkill(s)}
              className="rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {cv.skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {cv.skills.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              {s.name}
              <button
                type="button"
                onClick={() => removeSkill(s.id)}
                className="ml-0.5 rounded-full hover:bg-primary/20"
                aria-label={`Remove ${s.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No skills added yet. Add the skills you're best at.
        </p>
      )}
    </div>
  );
}

export function LanguagesSection({ cv, setCv }: Props) {
  const add = () =>
    setCv((prev) => ({ ...prev, languages: [...prev.languages, emptyLanguage()] }));

  const update = (id: string, patch: Partial<Language>) =>
    setCv((prev) => ({
      ...prev,
      languages: prev.languages.map((l) =>
        l.id === id ? { ...l, ...patch } : l
      ),
    }));

  const remove = (id: string) =>
    setCv((prev) => ({ ...prev, languages: prev.languages.filter((l) => l.id !== id) }));

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Languages"
        description="Add languages you speak and your level."
        action={
          <Button type="button" size="sm" onClick={add}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Language
          </Button>
        }
      />

      {cv.languages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No languages added yet. e.g. English, Kiswahili.
        </p>
      ) : (
        <div className="space-y-2">
          {cv.languages.map((l) => (
            <div
              key={l.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
            >
              <Input
                value={l.name}
                onChange={(e) => update(l.id, { name: e.target.value })}
                placeholder="Language e.g. Kiswahili"
                className="flex-1"
              />
              <Select
                value={l.proficiency || undefined}
                onValueChange={(v) => update(l.id, { proficiency: v as LanguageProficiency })}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Proficiency" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencies.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(l.id)}
                className="text-destructive hover:text-destructive"
                aria-label="Remove language"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InterestsSection({ cv, setCv }: Props) {
  const [input, setInput] = useState('');

  const add = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (cv.interests.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setInput('');
      return;
    }
    setCv((prev) => ({ ...prev, interests: [...prev.interests, trimmed] }));
    setInput('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    }
  };

  const remove = (interest: string) =>
    setCv((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Interests"
        description="Optional. Add a few things you enjoy outside work."
      />

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type an interest and press Enter"
          aria-label="Add an interest"
        />
        <Button type="button" onClick={() => add(input)} disabled={!input.trim()}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add interest</span>
        </Button>
      </div>

      {cv.interests.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {cv.interests.map((i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium"
            >
              {i}
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-0.5 rounded-full hover:bg-muted"
                aria-label={`Remove ${i}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No interests added yet.
        </p>
      )}
    </div>
  );
}
