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

export const ProfessionalTemplate = forwardRef<HTMLDivElement, Props>(
  ({ cv }, ref) => {
    const p = cv.personal;
    const accent = cv.settings.accentColor;
    const contacts = contactItems(cv);
    const spacing =
      cv.settings.sectionSpacing === 'compact'
        ? '0.7rem'
        : cv.settings.sectionSpacing === 'relaxed'
        ? '1.4rem'
        : '1rem';

    return (
      <div
        ref={ref}
        className="cv-paper cv-prose mx-auto w-full"
        style={{
          fontFamily: `'${cv.settings.fontFamily}', serif`,
          fontSize: `${cv.settings.fontSize}px`,
          lineHeight: 1.5,
        }}
      >
        {/* Header — centered, traditional */}
        <div
          className="text-center"
          style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: `3px solid ${accent}` }}
        >
          {p.photo && (
            <img
              src={p.photo}
              alt={p.fullName}
              className="mx-auto mb-3 h-24 w-24 rounded-full object-cover"
              style={{ border: `3px solid ${accent}` }}
            />
          )}
          <h1
            className="font-bold uppercase tracking-wider"
            style={{ fontSize: `${cv.settings.fontSize * 2}px`, color: accent }}
          >
            {p.fullName || 'Your Name'}
          </h1>
          {p.professionalTitle && (
            <p
              className="mt-1 font-medium uppercase tracking-wide opacity-80"
              style={{ fontSize: `${cv.settings.fontSize * 1.05}px` }}
            >
              {p.professionalTitle}
            </p>
          )}
          {contacts.length > 0 && (
            <div
              className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 opacity-80"
              style={{ fontSize: `${cv.settings.fontSize * 0.85}px` }}
            >
              {contacts.map((c, i) => (
                <span key={i}>
                  {c}
                  {i < contacts.length - 1 && (
                    <span className="ml-3" style={{ color: accent }}>|</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.25rem 1.5rem', rowGap: spacing, display: 'flex', flexDirection: 'column' }}>
          {hasSummary(cv) && (
            <Section title="Professional Summary" accent={accent} size={cv.settings.fontSize}>
              <p>{p.summary}</p>
            </Section>
          )}

          {hasExperience(cv) && (
            <Section title="Work Experience" accent={accent} size={cv.settings.fontSize}>
              <div className="space-y-2.5">
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
                        <span className="font-bold uppercase tracking-wide">
                          {e.jobTitle || 'Job Title'}
                        </span>
                        <span className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                          {formatDateRange(e.startDate, e.endDate, e.currentlyWorking)}
                        </span>
                      </div>
                      <div className="italic opacity-85" style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                        {[e.company, e.location, e.employmentType]
                          .filter(Boolean)
                          .join(', ')}
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
                        <span className="font-bold">{e.institution}</span>
                        <span className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                          {formatYearRange(e.startYear, e.endYear)}
                        </span>
                      </div>
                      <div className="italic opacity-85" style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                        {[e.qualification, e.course].filter(Boolean).join(', ')}
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

          {hasSkills(cv) && (
            <Section title="Skills" accent={accent} size={cv.settings.fontSize}>
              <p>
                {cv.skills
                  .filter((s) => s.name.trim())
                  .map((s) => s.name.trim())
                  .join(' • ')}
              </p>
            </Section>
          )}

          {hasCertifications(cv) && (
            <Section title="Certifications" accent={accent} size={cv.settings.fontSize}>
              <div className="space-y-1.5">
                {cv.certifications
                  .filter((c) => c.name.trim())
                  .map((c) => (
                    <div key={c.id} className="break-inside-avoid">
                      <div className="font-bold">{c.name}</div>
                      <div className="italic opacity-85" style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                        {[c.issuer, c.issueDate].filter(Boolean).join(', ')}
                      </div>
                      {c.credentialId && (
                        <div className="opacity-70" style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                          Credential ID: {c.credentialId}
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
                      <div className="font-bold">{pr.name}</div>
                      {pr.description && <p className="mt-0.5">{pr.description}</p>}
                      {pr.technologies && (
                        <div className="italic opacity-85" style={{ fontSize: `${cv.settings.fontSize * 0.85}px` }}>
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

          {hasLanguages(cv) && (
            <Section title="Languages" accent={accent} size={cv.settings.fontSize}>
              <p>
                {cv.languages
                  .filter((l) => l.name.trim())
                  .map((l) =>
                    l.proficiency
                      ? `${l.name.trim()} (${l.proficiency})`
                      : l.name.trim()
                  )
                  .join(' • ')}
              </p>
            </Section>
          )}

          {hasInterests(cv) && (
            <Section title="Interests" accent={accent} size={cv.settings.fontSize}>
              <p>{cv.interests.filter((i) => i.trim()).join(' • ')}</p>
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
                        <div className="font-bold">{r.name}</div>
                        <div className="italic opacity-85" style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                          {[r.position, r.organization].filter(Boolean).join(', ')}
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
    );
  }
);

ProfessionalTemplate.displayName = 'ProfessionalTemplate';

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
        className="font-bold uppercase tracking-wider"
        style={{
          color: accent,
          fontSize: `${size * 1.1}px`,
          borderBottom: `1px solid ${accent}55`,
          paddingBottom: '0.2rem',
          marginBottom: '0.5rem',
          letterSpacing: '0.08em',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
