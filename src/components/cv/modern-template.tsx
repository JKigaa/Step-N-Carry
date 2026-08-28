import { forwardRef } from 'react';
import type { CvData } from '@/types/cv';
import {
  contactItems,
  bullets,
  hasExperience,
  hasEducation,
  hasSkills,
  hasLanguages,
  hasCertifications,
  hasProjects,
  hasReferees,
  hasInterests,
  hasCustomSections,
  hasSummary,
} from '@/components/cv/helpers';
import { formatDateRange, formatYearRange, splitCommas } from '@/lib/format';

interface Props {
  cv: CvData;
}

export const ModernTemplate = forwardRef<HTMLDivElement, Props>(
  ({ cv }, ref) => {
    const p = cv.personal;
    const accent = cv.settings.accentColor;
    const contacts = contactItems(cv);
    const spacing =
      cv.settings.sectionSpacing === 'compact'
        ? '0.75rem'
        : cv.settings.sectionSpacing === 'relaxed'
        ? '1.5rem'
        : '1.1rem';

    return (
      <div
        ref={ref}
        className="cv-paper cv-prose mx-auto w-full"
        style={{
          fontFamily: `'${cv.settings.fontFamily}', sans-serif`,
          fontSize: `${cv.settings.fontSize}px`,
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)`,
            color: '#ffffff',
            padding: '1.5rem 1.5rem',
          }}
        >
          <div>
            <h1
              className="font-extrabold tracking-tight"
              style={{ fontSize: `${cv.settings.fontSize * 1.9}px` }}
            >
              {p.fullName || 'Your Name'}
            </h1>
            {p.professionalTitle && (
              <p
                className="mt-1 font-medium opacity-95"
                style={{ fontSize: `${cv.settings.fontSize * 1.1}px` }}
              >
                {p.professionalTitle}
              </p>
            )}
          </div>
          {p.photo && (
            <img
              src={p.photo}
              alt={p.fullName}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white/40"
              style={{ alignSelf: 'flex-start' }}
            />
          )}
        </div>

        {/* Contact bar */}
        {contacts.length > 0 && (
          <div
            className="flex flex-wrap gap-x-4 gap-y-1 border-b"
            style={{
              padding: '0.6rem 1.5rem',
              borderColor: `${accent}33`,
              background: `${accent}0d`,
              fontSize: `${cv.settings.fontSize * 0.85}px`,
            }}
          >
            {contacts.map((c, i) => (
              <span key={i} className="font-medium" style={{ color: accent }}>
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-3" style={{ padding: '1.25rem 1.5rem' }}>
          {/* Left column */}
          <div className="sm:col-span-1 sm:pr-4" style={{ rowGap: spacing, display: 'flex', flexDirection: 'column' }}>
            {hasSkills(cv) && (
              <Section title="Skills" accent={accent} size={cv.settings.fontSize}>
                <ul className="flex flex-wrap gap-1.5">
                  {cv.skills
                    .filter((s) => s.name.trim())
                    .map((s) => (
                      <li
                        key={s.id}
                        className="rounded px-2 py-0.5"
                        style={{
                          background: `${accent}14`,
                          color: accent,
                          fontSize: `${cv.settings.fontSize * 0.85}px`,
                        }}
                      >
                        {s.name.trim()}
                      </li>
                    ))}
                </ul>
              </Section>
            )}

            {hasLanguages(cv) && (
              <Section title="Languages" accent={accent} size={cv.settings.fontSize}>
                <ul className="space-y-0.5">
                  {cv.languages
                    .filter((l) => l.name.trim())
                    .map((l) => (
                      <li key={l.id} className="flex justify-between gap-2">
                        <span>{l.name.trim()}</span>
                        {l.proficiency && (
                          <span className="opacity-70">{l.proficiency}</span>
                        )}
                      </li>
                    ))}
                </ul>
              </Section>
            )}

            {hasInterests(cv) && (
              <Section title="Interests" accent={accent} size={cv.settings.fontSize}>
                <ul className="flex flex-wrap gap-1.5">
                  {cv.interests
                    .filter((i) => i.trim())
                    .map((i, idx) => (
                      <li
                        key={idx}
                        className="rounded px-2 py-0.5"
                        style={{
                          background: `${accent}14`,
                          color: accent,
                          fontSize: `${cv.settings.fontSize * 0.85}px`,
                        }}
                      >
                        {i.trim()}
                      </li>
                    ))}
                </ul>
              </Section>
            )}
          </div>

          {/* Right column (main) */}
          <div className="sm:col-span-2 sm:pl-4 sm:border-l" style={{ borderColor: `${accent}22`, rowGap: spacing, display: 'flex', flexDirection: 'column' }}>
            {hasSummary(cv) && (
              <Section title="Profile" accent={accent} size={cv.settings.fontSize}>
                <p>{p.summary}</p>
              </Section>
            )}

            {hasExperience(cv) && (
              <Section title="Experience" accent={accent} size={cv.settings.fontSize}>
                <div className="space-y-2">
                  {cv.experience
                    .filter(
                      (e) =>
                        e.jobTitle.trim() ||
                        e.company.trim() ||
                        e.description.trim()
                    )
                    .map((e) => (
                      <div key={e.id} className="break-inside-avoid">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                          <span className="font-semibold">
                            {e.jobTitle || 'Job Title'}
                          </span>
                          <span className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                            {formatDateRange(e.startDate, e.endDate, e.currentlyWorking)}
                          </span>
                        </div>
                        <div className="opacity-80" style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                          {[e.company, e.location, e.employmentType]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                        {e.description && <p className="mt-1">{e.description}</p>}
                        {bullets(e.achievements).length > 0 && (
                          <ul className="mt-1">
                            {bullets(e.achievements).map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              </Section>
            )}

            {hasEducation(cv) && (
              <Section title="Education" accent={accent} size={cv.settings.fontSize}>
                <div className="space-y-2">
                  {cv.education
                    .filter(
                      (e) => e.institution.trim() || e.qualification.trim()
                    )
                    .map((e) => (
                      <div key={e.id} className="break-inside-avoid">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                          <span className="font-semibold">{e.institution}</span>
                          <span className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                            {formatYearRange(e.startYear, e.endYear)}
                          </span>
                        </div>
                        <div className="opacity-80" style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                          {[e.qualification, e.course].filter(Boolean).join(' — ')}
                        </div>
                        {e.grade && (
                          <div className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.85}px` }}>
                            {e.grade}
                          </div>
                        )}
                        {e.description && <p className="mt-1">{e.description}</p>}
                      </div>
                    ))}
                </div>
              </Section>
            )}

            {hasCertifications(cv) && (
              <Section title="Certifications" accent={accent} size={cv.settings.fontSize}>
                <div className="space-y-1.5">
                  {cv.certifications
                    .filter((c) => c.name.trim())
                    .map((c) => (
                      <div key={c.id} className="break-inside-avoid">
                        <div className="font-semibold">{c.name}</div>
                        <div className="opacity-80" style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                          {[c.issuer, c.issueDate].filter(Boolean).join(' • ')}
                        </div>
                        {c.credentialId && (
                          <div className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                            ID: {c.credentialId}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </Section>
            )}

            {hasProjects(cv) && (
              <Section title="Projects" accent={accent} size={cv.settings.fontSize}>
                <div className="space-y-1.5">
                  {cv.projects
                    .filter((pr) => pr.name.trim())
                    .map((pr) => (
                      <div key={pr.id} className="break-inside-avoid">
                        <div className="font-semibold">{pr.name}</div>
                        {pr.description && <p className="mt-0.5">{pr.description}</p>}
                        {pr.technologies && (
                          <div className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.85}px` }}>
                            {splitCommas(pr.technologies).join(' • ')}
                          </div>
                        )}
                        {pr.url && (
                          <div className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                            {pr.url}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </Section>
            )}

            {hasCustomSections(cv) &&
              cv.customSections
                .filter((c) => c.title.trim() && c.content.trim())
                .map((c) => (
                  <Section key={c.id} title={c.title} accent={accent} size={cv.settings.fontSize}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{c.content}</p>
                  </Section>
                ))}

            {cv.settings.showReferees && hasReferees(cv) && (
              <Section title="Referees" accent={accent} size={cv.settings.fontSize}>
                {cv.settings.refereesAvailableUponRequest ? (
                  <p>Available upon request.</p>
                ) : (
                  <div className="space-y-1.5">
                    {cv.referees
                      .filter((r) => r.name.trim())
                      .map((r) => (
                        <div key={r.id} className="break-inside-avoid">
                          <div className="font-semibold">{r.name}</div>
                          <div className="opacity-80" style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                            {[r.position, r.organization].filter(Boolean).join(' • ')}
                          </div>
                          <div className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                            {[r.phone, r.email].filter(Boolean).join(' • ')}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Section>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ModernTemplate.displayName = 'ModernTemplate';

function Section({
  title,
  accent,
  size,
  children,
}: {
  title: string;
  accent: string;
  size: number;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid">
      <h2
        className="font-bold uppercase tracking-wide"
        style={{
          color: accent,
          fontSize: `${size * 1.05}px`,
          borderBottom: `2px solid ${accent}33`,
          paddingBottom: '0.25rem',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
