import type { CvData } from '@/types/cv';
import { splitLines } from '@/lib/format';

/* Shared helpers for CV preview templates. Each template renders sections
   in its own layout, but these helpers centralise the "has content" checks
   and common section rendering primitives. */

export function hasExperience(cv: CvData): boolean {
  return cv.experience.some(
    (e) => e.jobTitle.trim() || e.company.trim() || e.description.trim()
  );
}
export function hasEducation(cv: CvData): boolean {
  return cv.education.some(
    (e) => e.institution.trim() || e.qualification.trim()
  );
}
export function hasSkills(cv: CvData): boolean {
  return cv.skills.some((s) => s.name.trim());
}
export function hasLanguages(cv: CvData): boolean {
  return cv.languages.some((l) => l.name.trim());
}
export function hasCertifications(cv: CvData): boolean {
  return cv.certifications.some((c) => c.name.trim());
}
export function hasProjects(cv: CvData): boolean {
  return cv.projects.some((p) => p.name.trim());
}
export function hasReferees(cv: CvData): boolean {
  return (
    cv.settings.refereesAvailableUponRequest ||
    cv.referees.some((r) => r.name.trim())
  );
}
export function hasInterests(cv: CvData): boolean {
  return cv.interests.some((i) => i.trim());
}
export function hasCustomSections(cv: CvData): boolean {
  return cv.customSections.some(
    (c) => c.title.trim() && c.content.trim()
  );
}
export function hasSummary(cv: CvData): boolean {
  return cv.personal.summary.trim().length > 0;
}

export function contactItems(cv: CvData): string[] {
  const p = cv.personal;
  const items: string[] = [];
  if (p.phone.trim()) items.push(p.phone.trim());
  if (p.email.trim()) items.push(p.email.trim());
  if (p.location.trim()) items.push(p.location.trim());
  if (p.linkedin.trim()) items.push(p.linkedin.trim());
  if (p.portfolio.trim()) items.push(p.portfolio.trim());
  return items;
}

export function bullets(text: string): string[] {
  return splitLines(text);
}
