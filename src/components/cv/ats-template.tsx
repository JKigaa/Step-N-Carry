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

export const AtsTemplate = forwardRef<HTMLDivElement, Props>(
  ({ cv }, ref) => {
    const p = cv.personal;
    const contacts = contactItems(cv);
    const spacing =
      cv.settings.sectionSpacing === 'compact'
        ? '0.7rem'
        : cv.settings.sectionSpacing === 'relaxed'
        ? '1.4rem'
        : '1rem';

    // ATS template uses near-black text, no background colors, single column
    return (
      <div
        ref={ref}
        className="cv-paper cv-prose mx-auto w-full"
        style={{
          fontFamily: `'${cv.settings.fontFamily}', sans-serif`,
          fontSize: `${cv.settings.fontSize}px`,
          lineHeight: 1.5,
          color: '#111111',
        }}
      >
        {/* Header — plain, single column */}
        <div style={{ padding: '1.5rem 1.5rem 0.75rem', borderBottom: '1px solid #999' }}>
          {p.photo && (
            <img
              src={p.photo}
              alt={p.fullName}
              className="mb-3 h-20 w-20 rounded-full object-cover"
            />
          )}
          <h1
            className="font-bold"
            style={{ fontSize: `${cv.settings.fontSize * 1.8}px` }}
          >
            {p.fullName || 'Your Name'}
          </h1>
          {p.professionalTitle && (
            <p
              className="mt-0.5 font-medium"
              style={{ fontSize: `${cv.settings.fontSize * 1.05}px` }}
            >
              {p.professionalTitle}
            </p>
          )}
          {contacts.length > 0 && (
            <div
              className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5"
              style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}
            >
              {contacts.map((c, i) => (
                <span key={i}>
                  {c}
                  {i < contacts.length - 1 && <span className="ml-3">|</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.1rem 1.5rem', rowGap: spacing, display: 'flex', flexDirection: 'column' }}>
          {hasSummary(cv) && (
            <Section title="Professional Summary" size={cv.settings.fontSize}>
              <p>{p.summary}</p>
            </Section>
          )}

          {hasExperience(cv) && (
            <Section title="Work Experience" size={cv.settings.fontSize}>
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
                        <span className="font-bold">{e.jobTitle || 'Job Title'}</span>
                        <span style={{ fontSize: `${cv.settings.fontSize * 0.85}px` }}>
                          {formatDateRange(e.startDate, e.endDate, e.currentlyWorking)}
                        </span>
                      </div>
                      <div style={{ fontSize: `${cv.settings.fontSize * 0.95}px` }}>
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
            <Section title="Education" size={cv.settings.fontSize}>
              <div className="space-y-2">
                {cv.education
                  .filter(
                    (e) => e.institution.trim() || e.qualification.trim()
                  )
                  .map((e) => (
                    <div key={e.id} className="break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="font-bold">{e.institution}</span>
                        <span style={{ fontSize: `${cv.settings.fontSize * 0.85}px` }}>
                          {formatYearRange(e.startYear, e.endYear)}
                        </span>
                      </div>
                      <div style={{ fontSize: `${cv.settings.fontSize * 0.95}px` }}>
                        {[e.qualification, e.course].filter(Boolean).join(', ')}
                      </div>
                      {e.grade && (
                        <div style={{ fontSize: `${cv.settings.fontSize * 0.85}px` }}>
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
            <Section title="Skills" size={cv.settings.fontSize}>
              <ul className="flex flex-wrap gap-x-4 gap-y-0.5">
                {cv.skills
                  .filter((s) => s.name.trim())
                  .map((s) => (
                    <li key={s.id}>{s.name.trim()}</li>
                  ))}
              </ul>
            </Section>
          )}

          {hasCertifications(cv) && (
            <Section title="Certifications" size={cv.settings.fontSize}>
              <div className="space-y-1.5">
                {cv.certifications
                  .filter((c) => c.name.trim())
                  .map((c) => (
                    <div key={c.id} className="break-inside-avoid">
                      <div className="font-bold">{c.name}</div>
                      <div style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                        {[c.issuer, c.issueDate].filter(Boolean).join(', ')}
                      </div>
                      {c.credentialId && (
                        <div style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                          Credential ID: {c.credentialId}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {hasProjects(cv) && (
            <Section title="Projects" size={cv.settings.fontSize}>
              <div className="space-y-1.5">
                {cv.projects
                  .filter((pr) => pr.name.trim())
                  .map((pr) => (
                    <div key={pr.id} className="break-inside-avoid">
                      <div className="font-bold">{pr.name}</div>
                      {pr.description && <p className="mt-0.5">{pr.description}</p>}
                      {pr.technologies && (
                        <div style={{ fontSize: `${cv.settings.fontSize * 0.85}px` }}>
                          {splitCommas(pr.technologies).join(', ')}
                        </div>
                      )}
                      {pr.url && (
                        <div style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
                          {pr.url}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {hasLanguages(cv) && (
            <Section title="Languages" size={cv.settings.fontSize}>
              <ul className="flex flex-wrap gap-x-4 gap-y-0.5">
                {cv.languages
                  .filter((l) => l.name.trim())
                  .map((l) => (
                    <li key={l.id}>
                      {l.name.trim()}
                      {l.proficiency && ` — ${l.proficiency}`}
                    </li>
                  ))}
              </ul>
            </Section>
          )}

          {hasInterests(cv) && (
            <Section title="Interests" size={cv.settings.fontSize}>
              <p>{cv.interests.filter((i) => i.trim()).join(', ')}</p>
            </Section>
          )}

          {hasCustomSections(cv) &&
            cv.customSections
              .filter((c) => c.title.trim() && c.content.trim())
              .map((c) => (
                <Section key={c.id} title={c.title} size={cv.settings.fontSize}>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{c.content}</p>
                </Section>
              ))}

          {cv.settings.showReferees && hasReferees(cv) && (
            <Section title="Referees" size={cv.settings.fontSize}>
              {cv.settings.refereesAvailableUponRequest ? (
                <p>Available upon request.</p>
              ) : (
                <div className="space-y-1.5">
                  {cv.referees
                    .filter((r) => r.name.trim())
                    .map((r) => (
                      <div key={r.id} className="break-inside-avoid">
                        <div className="font-bold">{r.name}</div>
                        <div style={{ fontSize: `${cv.settings.fontSize * 0.9}px` }}>
                          {[r.position, r.organization].filter(Boolean).join(', ')}
                        </div>
                        <div style={{ fontSize: `${cv.settings.fontSize * 0.8}px` }}>
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

AtsTemplate.displayName = 'AtsTemplate';

function Section({
  title,
  size,
  children,
}: {
  title: string;
  size: number;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid">
      <h2
        className="font-bold uppercase"
        style={{
          fontSize: `${size * 1.15}px`,
          borderBottom: '1px solid #999',
          paddingBottom: '0.2rem',
          marginBottom: '0.5rem',
          letterSpacing: '0.04em',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
