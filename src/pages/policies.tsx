import { useState } from 'react';

interface PoliciesPageProps {
  navigate: (to: string) => void;
}

type Tab = 'terms' | 'privacy' | 'returns' | 'shipping';

const TABS: { key: Tab; label: string }[] = [
  { key: 'terms', label: 'Terms of Service' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'returns', label: 'Returns & Exchanges' },
  { key: 'shipping', label: 'Shipping & Delivery' },
];

export function PoliciesPage({ navigate }: PoliciesPageProps) {
  const [tab, setTab] = useState<Tab>('terms');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'terms' && <TermsContent />}
      {tab === 'privacy' && <PrivacyContent />}
      {tab === 'returns' && <ReturnsContent />}
      {tab === 'shipping' && <ShippingContent />}

      <div className="mt-10 rounded-lg border bg-secondary/30 p-6">
        <h3 className="font-semibold">Questions?</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Reach us on WhatsApp/phone at +254 702 918 650 or email hello@stepncarry.co.ke, and we'll be happy to help.
        </p>
        <button type="button" onClick={() => navigate('/')} className="mt-3 text-sm font-medium text-primary hover:underline">
          Back to home
        </button>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
      <Section title="1. About Step N Carry">
        Step N Carry is an online shoe and bag store based in Nairobi, Kenya, delivering to customers across the
        country. By browsing or ordering from this site, you agree to these terms.
      </Section>

      <Section title="2. Orders and acceptance">
        Placing an order is a request to buy, not a guarantee of sale. We confirm orders based on stock
        availability. If an item you ordered is out of stock, we will contact you to offer a replacement, size
        substitution, or a full refund of any amount already paid.
      </Section>

      <Section title="3. Pricing">
        All prices on this site are listed in Kenyan Shillings (KSh) and include applicable taxes unless stated
        otherwise. Prices may change without notice, but the price shown at the time you complete your order is
        the price you pay.
      </Section>

      <Section title="4. Payment methods">
        We currently support Pay on Delivery, with M-Pesa and card payment options being rolled out. Payment
        terms for each method are shown at checkout.
      </Section>

      <Section title="5. Accurate information">
        You agree to provide accurate contact and delivery details when creating an account or placing an order.
        We are not responsible for delayed or failed deliveries caused by incorrect information you provided.
      </Section>

      <Section title="6. Product accuracy">
        We do our best to display product images, descriptions, and sizing accurately. Minor variations in colour
        or appearance may occur due to photography and screen display differences.
      </Section>

      <Section title="7. Account responsibility">
        You are responsible for keeping your account password confidential and for all activity under your
        account. Notify us immediately if you suspect unauthorised access.
      </Section>

      <Section title="8. Limitation of liability">
        To the fullest extent permitted by law, Step N Carry is not liable for indirect or consequential losses
        arising from the use of this site or delays outside our reasonable control (such as courier delays,
        network outages, or events beyond our control).
      </Section>

      <Section title="9. Changes to these terms">
        We may update these terms from time to time. Continued use of the site after changes are posted means you
        accept the updated terms.
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
      <Section title="1. Information we collect">
        When you create an account or place an order, we collect your name, phone number, email address, delivery
        address, county, and town. If you contact us via WhatsApp, we may also see your WhatsApp number and
        message content.
      </Section>

      <Section title="2. How we use your information">
        We use your information to process and deliver your orders, communicate order updates, respond to your
        enquiries, and improve our service. We do not sell your personal information to third parties.
      </Section>

      <Section title="3. Order notifications">
        When you place an order, our team is automatically notified via WhatsApp so we can process it promptly.
        Your order details (name, phone, items, delivery location) are shared only with our own staff for this
        purpose.
      </Section>

      <Section title="4. Data storage">
        Your account and order information is stored securely with our database provider (Supabase). We take
        reasonable technical measures to protect your data, including restricting access to authorised staff only.
      </Section>

      <Section title="5. Your rights">
        Under Kenya's Data Protection Act, 2019, you have the right to access, correct, or request deletion of
        your personal data. You can update your details anytime from your account page, or contact us to request
        a full account deletion.
      </Section>

      <Section title="6. Cookies and analytics">
        We may use basic cookies or similar technology to keep you signed in and to understand how the site is
        used, so we can improve it.
      </Section>

      <Section title="7. Children's privacy">
        Step N Carry is intended for customers aged 18 and above. We do not knowingly collect information from
        children.
      </Section>

      <Section title="8. Changes to this policy">
        We may update this privacy policy from time to time. Any changes will be posted on this page with an
        updated date.
      </Section>
    </div>
  );
}

function ReturnsContent() {
  return (
    <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
      <Section title="1. Return window">
        You may request a return or exchange within 5 days of delivery.
      </Section>

      <Section title="2. Condition for returns">
        Items must be unworn, unused, in their original condition, and with all original tags and packaging
        intact. Items that show signs of wear cannot be accepted.
      </Section>

      <Section title="3. How to request a return or exchange">
        Contact us via WhatsApp/phone at +254 702 918 650 or email hello@stepncarry.co.ke within the 5-day
        window, with your order number and reason for the return.
      </Section>

      <Section title="4. Who pays for return shipping">
        If you are returning or exchanging an item for a reason other than our error (e.g. wrong size ordered,
        change of mind), you are responsible for the cost of shipping it back to us. If the item is defective,
        damaged, or not what you ordered, we cover the return shipping cost.
      </Section>

      <Section title="5. Refunds">
        Once we receive and inspect the returned item, we will process your refund or exchange. Refunds are
        issued using the same payment method used for the original order, where possible.
      </Section>

      <Section title="6. Non-returnable situations">
        We're unable to accept returns after the 5-day window, or for items that have been worn, damaged after
        delivery, or returned without their original tags/packaging.
      </Section>
    </div>
  );
}

function ShippingContent() {
  return (
    <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
      <Section title="1. Delivery coverage">
        We deliver nationwide, to all 47 counties in Kenya.
      </Section>

      <Section title="2. Delivery fee">
        A flat delivery fee of KSh 300 applies to every order, shown clearly at checkout before you confirm your
        order.
      </Section>

      <Section title="3. Delivery timeframes">
        Delivery timeframes vary by location, and typical estimated windows are shown during checkout. Delays can
        occasionally occur due to courier availability, weather, or circumstances beyond our control — we'll keep
        you updated if this happens.
      </Section>

      <Section title="4. Order tracking">
        You can check your order status anytime from your account's "My Orders" page. We'll also notify you as
        your order moves through processing, dispatch, and delivery.
      </Section>

      <Section title="5. Failed delivery attempts">
        If a delivery attempt fails because you were unreachable or the address provided was incorrect, we will
        contact you to arrange redelivery. Additional delivery fees may apply for repeated failed attempts due to
        incorrect address details.
      </Section>

      <Section title="6. Delivery address accuracy">
        Please double-check your delivery address, county, and town at checkout. We are not responsible for
        delays or non-delivery resulting from incorrect address information provided by you.
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
