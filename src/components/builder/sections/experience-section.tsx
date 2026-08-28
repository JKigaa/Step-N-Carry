import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, RepeatItem, SectionHeader } from '@/components/builder/builder-primitives';
import type { CvData, Experience, EmploymentType } from '@/types/cv';
import { emptyExperience } from '@/lib/cv-data';
import { formatMonthYear } from '@/lib/format';

const employmentTypes: EmploymentType[] = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Volunteer',
  'Freelance',
];

interface Props {
  cv: CvData;
  setCv: (updater: (prev: CvData) => CvData) => void;
}

export function ExperienceSection({ cv, setCv }: Props) {
  const add = () =>
    setCv((prev) => ({
      ...prev,
      experience: [...prev.experience, emptyExperience()],
    }));

  const update = (id: string, patch: Partial<Experience>) =>
    setCv((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    }));

  const remove = (id: string) =>
    setCv((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));

  const move = (index: number, dir: -1 | 1) =>
    setCv((prev) => {
      const arr = [...prev.experience];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[index], arr[j]] = [arr[j], arr[index]];
      return { ...prev, experience: arr };
    });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Work Experience"
        description="Add your roles, starting with the most recent."
        action={
          <Button type="button" size="sm" onClick={add}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Experience
          </Button>
        }
      />

      {cv.experience.length === 0 ? (
        <EmptyState
          label="No experience added yet"
          hint="Add your first job, internship or volunteer role."
          onAdd={add}
          addLabel="Add Experience"
        />
      ) : (
        <div className="space-y-3">
          {cv.experience.map((e, i) => (
            <RepeatItem
              key={e.id}
              defaultOpen={i === 0}
              title={e.jobTitle || 'Untitled role'}
              subtitle={[
                e.company,
                e.currentlyWorking
                  ? `${formatMonthYear(e.startDate)} — Present`
                  : [formatMonthYear(e.startDate), formatMonthYear(e.endDate)]
                      .filter(Boolean)
                      .join(' — '),
              ].filter(Boolean).join(' • ')}
              onRemove={() => remove(e.id)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
              canMoveUp={i > 0}
              canMoveDown={i < cv.experience.length - 1}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Job Title" htmlFor={`jobTitle-${e.id}`}>
                  <Input
                    id={`jobTitle-${e.id}`}
                    value={e.jobTitle}
                    onChange={(ev) => update(e.id, { jobTitle: ev.target.value })}
                    placeholder="Customer Service Representative"
                  />
                </Field>
                <Field label="Company" htmlFor={`company-${e.id}`}>
                  <Input
                    id={`company-${e.id}`}
                    value={e.company}
                    onChange={(ev) => update(e.id, { company: ev.target.value })}
                    placeholder="ABC Enterprises Ltd"
                  />
                </Field>
                <Field label="Location" htmlFor={`loc-${e.id}`}>
                  <Input
                    id={`loc-${e.id}`}
                    value={e.location}
                    onChange={(ev) => update(e.id, { location: ev.target.value })}
                    placeholder="Nairobi, Kenya"
                  />
                </Field>
                <Field label="Employment Type" htmlFor={`type-${e.id}`}>
                  <Select
                    value={e.employmentType || undefined}
                    onValueChange={(v) => update(e.id, { employmentType: v as EmploymentType })}
                  >
                    <SelectTrigger id={`type-${e.id}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Start Date" htmlFor={`start-${e.id}`}>
                  <Input
                    id={`start-${e.id}`}
                    type="month"
                    value={e.startDate}
                    onChange={(ev) => update(e.id, { startDate: ev.target.value })}
                  />
                </Field>
                <Field label="End Date" htmlFor={`end-${e.id}`}>
                  <Input
                    id={`end-${e.id}`}
                    type="month"
                    value={e.endDate}
                    onChange={(ev) => update(e.id, { endDate: ev.target.value })}
                    disabled={e.currentlyWorking}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`current-${e.id}`}
                      checked={e.currentlyWorking}
                      onCheckedChange={(v) =>
                        update(e.id, { currentlyWorking: v === true })
                      }
                    />
                    <Label htmlFor={`current-${e.id}`} className="text-sm">
                      I currently work here
                    </Label>
                  </div>
                </div>
                <Field label="Description" htmlFor={`desc-${e.id}`} className="sm:col-span-2">
                  <Textarea
                    id={`desc-${e.id}`}
                    value={e.description}
                    onChange={(ev) => update(e.id, { description: ev.target.value })}
                    placeholder="What you did in this role..."
                    rows={3}
                  />
                </Field>
                <Field
                  label="Achievements"
                  htmlFor={`ach-${e.id}`}
                  className="sm:col-span-2"
                  hint="One per line. Start each with an action verb."
                >
                  <Textarea
                    id={`ach-${e.id}`}
                    value={e.achievements}
                    onChange={(ev) => update(e.id, { achievements: ev.target.value })}
                    placeholder={'Increased sales by 20% in 6 months\nTrained 5 new team members'}
                    rows={4}
                  />
                </Field>
              </div>
            </RepeatItem>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  label,
  hint,
  onAdd,
  addLabel,
}: {
  label: string;
  hint: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-secondary/30 p-8 text-center">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <Button type="button" size="sm" onClick={onAdd} className="mt-4">
        <Plus className="mr-1.5 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
