interface LegalProps {
  navigate: (to: string) => void;
  kind: 'privacy' | 'terms';
}

export function Legal({ navigate, kind }: LegalProps) {
  const isPrivacy = kind === 'privacy';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {isPrivacy ? <PrivacyContent /> : <TermsContent />}

      <div className="mt-10 rounded-lg border bg-secondary/30 p-6">
        <h3 className="font-semibold">Questions?</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This is an MVP privacy/terms document. For a production launch, have a
          qualified professional review and finalise these documents.
        </p>
        <button
          type="button"
          onClick={() => navigate('#/')}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
      <Section title="1. Overview">
        CV Chap is a CV/resume builder designed for Kenyan job seekers. We are
        committed to protecting your privacy. This policy explains how your
        information is handled.
      </Section>

      <Section title="2. Your CV data stays on your device">
        CV Chap does not require an account and does not send your CV
        information to any server. All data you enter — personal details, work
        experience, education and everything else — is stored only in your
        browser's local storage on the device you are using. It never leaves
        your device.
      </Section>

      <Section title="3. No account, no login">
        We do not ask you to create an account or provide credentials to use the
        free CV builder. There is no server-side database storing your CV.
      </Section>

      <Section title="4. Information we do not collect">
        We do not collect your name, email, phone number, location, or any CV
        content. We do not use tracking cookies for the CV builder itself.
      </Section>

      <Section title="5. PDF generation">
        When you download your CV as a PDF, the file is generated entirely in
        your browser. The PDF is not uploaded to or processed by any external
        service.
      </Section>

      <Section title="6. Third-party services">
        CV Chap may use analytics or font services loaded from third-party
        servers (such as Google Fonts). These services may set cookies or
        collect technical data as described in their own privacy policies. Your
        CV content is never shared with these services.
      </Section>

      <Section title="7. Deleting your data">
        Because your data is stored only in your browser, you can delete it at
        any time by using the "Start New CV" button in the builder, or by
        clearing your browser's site data for this website.
      </Section>

      <Section title="8. Children's privacy">
        CV Chap is intended for job seekers aged 16 and above. We do not
        knowingly collect information from children.
      </Section>

      <Section title="9. Changes to this policy">
        We may update this privacy policy from time to time. Any changes will be
        posted on this page with an updated date.
      </Section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
      <Section title="1. Acceptance of terms">
        By using CV Chap, you agree to these terms of service. If you do not
        agree, please do not use the application.
      </Section>

      <Section title="2. What CV Chap provides">
        CV Chap is a free tool that helps you create, preview and download a
        professional CV. The service is provided on an "as is" basis for the
        MVP.
      </Section>

      <Section title="3. Your responsibility for content">
        You are solely responsible for the information you enter into your CV.
        You agree to provide accurate, truthful information and not to use CV
        Chap to create misleading or fraudulent documents.
      </Section>

      <Section title="4. Data storage">
        Your CV data is stored locally in your browser. We are not responsible
        for data loss caused by clearing browser data, browser updates, or
        device changes. We recommend downloading a PDF copy of your CV for
        safekeeping.
      </Section>

      <Section title="5. Acceptable use">
        You agree not to use CV Chap to create content that is illegal,
        defamatory, or that infringes the rights of others. You may not use the
        service to misrepresent your qualifications or identity.
      </Section>

      <Section title="6. Intellectual property">
        The CV Chap application, its design, templates and code are the property
        of CV Chap. The CV content you create belongs to you.
      </Section>

      <Section title="7. No guarantee of employment">
        CV Chap is a tool to help you create a CV. We do not guarantee that
        using CV Chap will result in employment, interviews or any specific
        outcome.
      </Section>

      <Section title="8. Limitation of liability">
        CV Chap is provided free of charge for the MVP. To the fullest extent
        permitted by law, we are not liable for any indirect or consequential
        losses arising from the use of the service.
      </Section>

      <Section title="9. Changes to these terms">
        We may update these terms from time to time. Continued use of CV Chap
        after changes are posted constitutes acceptance of the updated terms.
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1.5">{children}</p>
    </section>
  );
}
