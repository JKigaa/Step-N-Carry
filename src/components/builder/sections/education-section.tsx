import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, RepeatItem, SectionHeader } from '@/components/builder/builder-primitives';
import { EmptyState } from '@/components/builder/sections/experience-section';
import type { CvData, Education, EducationLevel } from '@/types/cv';
import { emptyEducation } from '@/lib/cv-data';

const levels: EducationLevel[] = [
  'KCSE',
  'Certificate',
  'Diploma',
  'Higher Diploma',
  'Degree',
  'Postgraduate Diploma',
  "Master's",
  'PhD',
  'TVET',
  'Professional Certification',
  'Other',
];

interface Props {
  cv: CvData;
  setCv: (updater: (prev: CvData) => CvData) => void;
}

export function EducationSection({ cv, setCv }: Props) {
  const add = () =>
    setCv((prev) => ({
      ...prev,
      education: [...prev.education, emptyEducation()],
    }));

  const update = (id: string, patch: Partial<Education>) =>
    setCv((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    }));

  const remove = (id: string) =>
    setCv((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));

  const move = (index: number, dir: -1 | 1) =>
    setCv((prev) => {
      const arr = [...prev.education];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[index], arr[j]] = [arr[j], arr[index]];
      return { ...prev, education: arr };
    });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Education"
        description="Add your academic qualifications, most recent first."
        action={
          <Button type="button" size="sm" onClick={add}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Education
          </Button>
        }
      />

      {cv.education.length === 0 ? (
        <EmptyState
          label="No education added yet"
          hint="Add your degree, diploma, KCSE or certification."
          onAdd={add}
          addLabel="Add Education"
        />
      ) : (
        <div className="space-y-3">
          {cv.education.map((e, i) => (
            <RepeatItem
              key={e.id}
              defaultOpen={i === 0}
              title={e.institution || 'Untitled education'}
              subtitle={[e.qualification, e.course].filter(Boolean).join(' — ')}
              onRemove={() => remove(e.id)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
              canMoveUp={i > 0}
              canMoveDown={i < cv.education.length - 1}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Institution" htmlFor={`inst-${e.id}`}>
                  <Input
                    id={`inst-${e.id}`}
                    value={e.institution}
                    onChange={(ev) => update(e.id, { institution: ev.target.value })}
                    placeholder="University of Nairobi"
                  />
                </Field>
                <Field label="Qualification" htmlFor={`qual-${e.id}`}>
                  <Select
                    value={e.qualification || undefined}
                    onValueChange={(v) => update(e.id, { qualification: v as EducationLevel })}
                  >
                    <SelectTrigger id={`qual-${e.id}`}>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Course / Program" htmlFor={`course-${e.id}`}>
                  <Input
                    id={`course-${e.id}`}
                    value={e.course}
                    onChange={(ev) => update(e.id, { course: ev.target.value })}
                    placeholder="Bachelor of Commerce — Finance"
                  />
                </Field>
                <Field label="Location" htmlFor={`edu-loc-${e.id}`}>
                  <Input
                    id={`edu-loc-${e.id}`}
                    value={e.location}
                    onChange={(ev) => update(e.id, { location: ev.target.value })}
                    placeholder="Nairobi, Kenya"
                  />
                </Field>
                <Field label="Start Year" htmlFor={`edu-start-${e.id}`}>
                  <Input
                    id={`edu-start-${e.id}`}
                    value={e.startYear}
                    onChange={(ev) => update(e.id, { startYear: ev.target.value })}
                    placeholder="2019"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </Field>
                <Field label="End Year" htmlFor={`edu-end-${e.id}`}>
                  <Input
                    id={`edu-end-${e.id}`}
                    value={e.endYear}
                    onChange={(ev) => update(e.id, { endYear: ev.target.value })}
                    placeholder="2023"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </Field>
                <Field
                  label="Grade / Classification"
                  htmlFor={`grade-${e.id}`}
                  hint={e.qualification === 'KCSE' ? 'e.g. Mean Grade A- (79 points)' : 'e.g. Second Class Honours, Upper Division'}
                >
                  <Input
                    id={`grade-${e.id}`}
                    value={e.grade}
                    onChange={(ev) => update(e.id, { grade: ev.target.value })}
                    placeholder={e.qualification === 'KCSE' ? 'Mean Grade A-' : 'First Class Honours'}
                  />
                </Field>
                <Field label="Description" htmlFor={`edu-desc-${e.id}`} className="sm:col-span-2">
                  <Textarea
                    id={`edu-desc-${e.id}`}
                    value={e.description}
                    onChange={(ev) => update(e.id, { description: ev.target.value })}
                    placeholder="Optional — relevant coursework, awards or activities."
                    rows={2}
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
