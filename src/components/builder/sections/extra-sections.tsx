import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Field, RepeatItem, SectionHeader } from '@/components/builder/builder-primitives';
import { EmptyState } from '@/components/builder/sections/experience-section';
import type {
  CvData,
  Certification,
  Project,
  Referee,
  CustomSection,
} from '@/types/cv';
import {
  emptyCertification,
  emptyProject,
  emptyReferee,
  emptyCustomSection,
} from '@/lib/cv-data';

interface Props {
  cv: CvData;
  setCv: (updater: (prev: CvData) => CvData) => void;
}

export function CertificationsSection({ cv, setCv }: Props) {
  const add = () =>
    setCv((prev) => ({
      ...prev,
      certifications: [...prev.certifications, emptyCertification()],
    }));

  const update = (id: string, patch: Partial<Certification>) =>
    setCv((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));

  const remove = (id: string) =>
    setCv((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));

  const move = (index: number, dir: -1 | 1) =>
    setCv((prev) => {
      const arr = [...prev.certifications];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[index], arr[j]] = [arr[j], arr[index]];
      return { ...prev, certifications: arr };
    });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Certifications"
        description="Add professional certifications and short courses."
        action={
          <Button type="button" size="sm" onClick={add}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Certification
          </Button>
        }
      />

      {cv.certifications.length === 0 ? (
        <EmptyState
          label="No certifications added yet"
          hint="Add a short course, professional cert or licence."
          onAdd={add}
          addLabel="Add Certification"
        />
      ) : (
        <div className="space-y-3">
          {cv.certifications.map((c, i) => (
            <RepeatItem
              key={c.id}
              defaultOpen={i === 0}
              title={c.name || 'Untitled certification'}
              subtitle={c.issuer}
              onRemove={() => remove(c.id)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
              canMoveUp={i > 0}
              canMoveDown={i < cv.certifications.length - 1}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Certification Name" htmlFor={`cert-name-${c.id}`}>
                  <Input
                    id={`cert-name-${c.id}`}
                    value={c.name}
                    onChange={(e) => update(c.id, { name: e.target.value })}
                    placeholder="Safaricom Customer Excellence Certification"
                  />
                </Field>
                <Field label="Issuing Organization" htmlFor={`cert-issuer-${c.id}`}>
                  <Input
                    id={`cert-issuer-${c.id}`}
                    value={c.issuer}
                    onChange={(e) => update(c.id, { issuer: e.target.value })}
                    placeholder="Safaricom PLC"
                  />
                </Field>
                <Field label="Issue Date" htmlFor={`cert-issue-${c.id}`}>
                  <Input
                    id={`cert-issue-${c.id}`}
                    type="month"
                    value={c.issueDate}
                    onChange={(e) => update(c.id, { issueDate: e.target.value })}
                  />
                </Field>
                <Field label="Expiry Date" htmlFor={`cert-exp-${c.id}`} hint="Leave blank if it doesn't expire">
                  <Input
                    id={`cert-exp-${c.id}`}
                    type="month"
                    value={c.expiryDate}
                    onChange={(e) => update(c.id, { expiryDate: e.target.value })}
                  />
                </Field>
                <Field label="Credential ID" htmlFor={`cert-id-${c.id}`}>
                  <Input
                    id={`cert-id-${c.id}`}
                    value={c.credentialId}
                    onChange={(e) => update(c.id, { credentialId: e.target.value })}
                    placeholder="SCE-2022-0451"
                  />
                </Field>
                <Field label="Credential URL" htmlFor={`cert-url-${c.id}`}>
                  <Input
                    id={`cert-url-${c.id}`}
                    value={c.credentialUrl}
                    onChange={(e) => update(c.id, { credentialUrl: e.target.value })}
                    placeholder="credly.com/..."
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

export function ProjectsSection({ cv, setCv }: Props) {
  const add = () =>
    setCv((prev) => ({ ...prev, projects: [...prev.projects, emptyProject()] }));

  const update = (id: string, patch: Partial<Project>) =>
    setCv((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    }));

  const remove = (id: string) =>
    setCv((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));

  const move = (index: number, dir: -1 | 1) =>
    setCv((prev) => {
      const arr = [...prev.projects];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[index], arr[j]] = [arr[j], arr[index]];
      return { ...prev, projects: arr };
    });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Projects"
        description="Showcase projects that demonstrate your skills."
        action={
          <Button type="button" size="sm" onClick={add}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Project
          </Button>
        }
      />

      {cv.projects.length === 0 ? (
        <EmptyState
          label="No projects added yet"
          hint="Add a work, academic or personal project."
          onAdd={add}
          addLabel="Add Project"
        />
      ) : (
        <div className="space-y-3">
          {cv.projects.map((p, i) => (
            <RepeatItem
              key={p.id}
              defaultOpen={i === 0}
              title={p.name || 'Untitled project'}
              subtitle={p.technologies}
              onRemove={() => remove(p.id)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
              canMoveUp={i > 0}
              canMoveDown={i < cv.projects.length - 1}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Project Name" htmlFor={`proj-name-${p.id}`}>
                  <Input
                    id={`proj-name-${p.id}`}
                    value={p.name}
                    onChange={(e) => update(p.id, { name: e.target.value })}
                    placeholder="Agent Onboarding Playbook"
                  />
                </Field>
                <Field label="Project URL" htmlFor={`proj-url-${p.id}`}>
                  <Input
                    id={`proj-url-${p.id}`}
                    value={p.url}
                    onChange={(e) => update(p.id, { url: e.target.value })}
                    placeholder="github.com/..."
                  />
                </Field>
                <Field label="Description" htmlFor={`proj-desc-${p.id}`} className="sm:col-span-2">
                  <Textarea
                    id={`proj-desc-${p.id}`}
                    value={p.description}
                    onChange={(e) => update(p.id, { description: e.target.value })}
                    placeholder="What the project was and your impact..."
                    rows={3}
                  />
                </Field>
                <Field label="Technologies / Skills" htmlFor={`proj-tech-${p.id}`} className="sm:col-span-2" hint="Comma separated">
                  <Input
                    id={`proj-tech-${p.id}`}
                    value={p.technologies}
                    onChange={(e) => update(p.id, { technologies: e.target.value })}
                    placeholder="Excel, CRM, Data Analysis"
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

export function RefereesSection({ cv, setCv }: Props) {
  const s = cv.settings;

  const updateSettings = (patch: Partial<typeof s>) =>
    setCv((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));

  const add = () =>
    setCv((prev) => ({ ...prev, referees: [...prev.referees, emptyReferee()] }));

  const update = (id: string, patch: Partial<Referee>) =>
    setCv((prev) => ({
      ...prev,
      referees: prev.referees.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }));

  const remove = (id: string) =>
    setCv((prev) => ({ ...prev, referees: prev.referees.filter((r) => r.id !== id) }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Referees"
        description="Optional. Add 2–3 people who can vouch for your work."
      />

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-referees"
            checked={s.showReferees}
            onCheckedChange={(v) => updateSettings({ showReferees: v === true })}
          />
          <Label htmlFor="show-referees" className="text-sm font-medium">
            Show referees on my CV
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="referees-request"
            checked={s.refereesAvailableUponRequest}
            onCheckedChange={(v) =>
              updateSettings({ refereesAvailableUponRequest: v === true })
            }
            disabled={!s.showReferees}
          />
          <Label htmlFor="referees-request" className="text-sm font-medium">
            Show "Available upon request" instead of listing referees
          </Label>
        </div>
      </div>

      {s.showReferees && !s.refereesAvailableUponRequest && (
        <>
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={add}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Referee
            </Button>
          </div>
          {cv.referees.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No referees added yet. Add a former manager, lecturer or supervisor.
            </p>
          ) : (
            <div className="space-y-3">
              {cv.referees.map((r) => (
                <div key={r.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => remove(r.id)}
                      aria-label="Remove referee"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full Name" htmlFor={`ref-name-${r.id}`}>
                      <Input
                        id={`ref-name-${r.id}`}
                        value={r.name}
                        onChange={(e) => update(r.id, { name: e.target.value })}
                        placeholder="James Otieno"
                      />
                    </Field>
                    <Field label="Position" htmlFor={`ref-pos-${r.id}`}>
                      <Input
                        id={`ref-pos-${r.id}`}
                        value={r.position}
                        onChange={(e) => update(r.id, { position: e.target.value })}
                        placeholder="Customer Experience Manager"
                      />
                    </Field>
                    <Field label="Organization" htmlFor={`ref-org-${r.id}`}>
                      <Input
                        id={`ref-org-${r.id}`}
                        value={r.organization}
                        onChange={(e) => update(r.id, { organization: e.target.value })}
                        placeholder="Safaricom PLC"
                      />
                    </Field>
                    <Field label="Phone" htmlFor={`ref-phone-${r.id}`}>
                      <Input
                        id={`ref-phone-${r.id}`}
                        value={r.phone}
                        onChange={(e) => update(r.id, { phone: e.target.value })}
                        placeholder="+254 700 112 233"
                      />
                    </Field>
                    <Field label="Email" htmlFor={`ref-email-${r.id}`} className="sm:col-span-2">
                      <Input
                        id={`ref-email-${r.id}`}
                        value={r.email}
                        onChange={(e) => update(r.id, { email: e.target.value })}
                        placeholder="j.otieno@example.com"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function CustomSectionsSection({ cv, setCv }: Props) {
  const add = () =>
    setCv((prev) => ({
      ...prev,
      customSections: [...prev.customSections, emptyCustomSection()],
    }));

  const update = (id: string, patch: Partial<CustomSection>) =>
    setCv((prev) => ({
      ...prev,
      customSections: prev.customSections.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));

  const remove = (id: string) =>
    setCv((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((c) => c.id !== id),
    }));

  const suggestions = ['Awards', 'Volunteer Experience', 'Publications', 'Professional Memberships', 'Achievements'];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Custom Sections"
        description="Add any other section your CV needs."
        action={
          <Button type="button" size="sm" onClick={add}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Section
          </Button>
        }
      />

      {suggestions.some((s) => !cv.customSections.some((c) => c.title === s)) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Ideas:</span>
          {suggestions
            .filter((s) => !cv.customSections.some((c) => c.title === s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setCv((prev) => ({
                    ...prev,
                    customSections: [...prev.customSections, emptyCustomSection()],
                  }))
                }
                className="rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                + {s}
              </button>
            ))}
        </div>
      )}

      {cv.customSections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No custom sections yet. Add awards, volunteer work, publications and more.
        </p>
      ) : (
        <div className="space-y-3">
          {cv.customSections.map((c) => (
            <div key={c.id} className="rounded-lg border p-4">
              <div className="mb-3 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => remove(c.id)}
                  aria-label="Remove section"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <Field label="Section Title" htmlFor={`custom-title-${c.id}`}>
                  <Input
                    id={`custom-title-${c.id}`}
                    value={c.title}
                    onChange={(e) => update(c.id, { title: e.target.value })}
                    placeholder="Awards"
                  />
                </Field>
                <Field label="Content" htmlFor={`custom-content-${c.id}`}>
                  <Textarea
                    id={`custom-content-${c.id}`}
                    value={c.content}
                    onChange={(e) => update(c.id, { content: e.target.value })}
                    placeholder="Describe your awards, memberships or other details..."
                    rows={4}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
