import type { CvData } from '@/types/cv';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts +254 or 0xx formats, spaces, dashes
export const PHONE_RE = /^(\+?254|0)[\s-]?[17]\d{2}[\s-]?\d{3}[\s-]?\d{3}$/;

export interface CvValidation {
  errors: Record<string, string>;
  isValid: boolean;
  canDownload: boolean;
}

export function validateCv(cv: CvData): CvValidation {
  const errors: Record<string, string> = {};
  const p = cv.personal;

  if (!p.fullName.trim()) errors.fullName = 'Please enter your full name.';
  if (p.email && !EMAIL_RE.test(p.email.trim()))
    errors.email = 'Please enter a valid email address.';
  if (p.phone && !PHONE_RE.test(p.phone.trim()))
    errors.phone = 'Please enter a valid Kenyan phone number, e.g. +254 7XX XXX XXX.';

  // At least one meaningful CV section before download
  const hasContent =
    p.fullName.trim() !== '' &&
    (p.summary.trim() !== '' ||
      cv.experience.some(
        (e) => e.jobTitle.trim() || e.company.trim() || e.description.trim()
      ) ||
      cv.education.some(
        (e) => e.institution.trim() || e.qualification.trim()
      ) ||
      cv.skills.some((s) => s.name.trim()) ||
      cv.languages.some((l) => l.name.trim()) ||
      cv.certifications.some((c) => c.name.trim()) ||
      cv.projects.some((pr) => pr.name.trim()) ||
      cv.interests.length > 0 ||
      cv.customSections.some((c) => c.title.trim() || c.content.trim()));

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    canDownload: hasContent,
  };
}

export function cvCompletion(cv: CvData): number {
  const p = cv.personal;
  let score = 0;
  if (p.fullName.trim()) score += 12;
  if (p.professionalTitle.trim()) score += 8;
  if (p.phone.trim()) score += 8;
  if (p.email.trim()) score += 8;
  if (p.location.trim()) score += 6;
  if (p.summary.trim().length > 30) score += 12;
  if (cv.experience.length) score += 14;
  if (cv.education.length) score += 12;
  if (cv.skills.length >= 3) score += 8;
  if (cv.languages.length) score += 4;
  if (cv.certifications.length) score += 3;
  if (cv.projects.length) score += 3;
  if (cv.interests.length) score += 2;
  return Math.min(100, score);
}
