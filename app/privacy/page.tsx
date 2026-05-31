"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Last meaningful update to this policy's content. Update when the text changes.
const LAST_UPDATED = "May 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative px-4 sm:px-6 py-16">
        {/* faint grid backdrop, matching /about */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <article className="relative max-w-3xl mx-auto">
          {/* Heading */}
          <header className="mb-10">
            <h1 className="font-['Russo_One'] text-3xl sm:text-4xl text-white mb-3">
              Privacy Policy
            </h1>
            <p className="text-white/40 text-sm">Last updated: {LAST_UPDATED}</p>
            <p className="text-white/60 text-base leading-relaxed mt-5">
              This policy explains, in plain language, what Esports Adda collects
              about you, why we collect it, who can see it, how long we keep it,
              and how you can remove it. It is written so that a younger player —
              not just a lawyer — can understand it.
            </p>
          </header>

          <Section title="1. Who we are">
            <p>
              Esports Adda is a web-based tournament management and community
              platform for Nepal&apos;s esports scene. We connect players, teams,
              and organizations through profiles, tournaments, live streams, and
              per-game community chat.
            </p>
          </Section>

          <Section title="2. What we collect">
            <p>When you use Esports Adda, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Your name and email address</li>
              <li>Your date of birth and location (country/city)</li>
              <li>Your in-game identities, ranks, and roles across the games you add</li>
              <li>Your competitive statistics and match history</li>
              <li>Your team affiliations and, for organizations, organizational records</li>
              <li>Messages you post in community chat</li>
              <li>
                Basic technical data needed to keep you signed in and to operate
                the service (such as your login session)
              </li>
            </ul>
          </Section>

          <Section title="3. Why we collect it">
            <p>
              We use your data only to run the platform: to create and secure your
              account, show your profile and stats to others, register you for
              tournaments, deliver community chat and notifications, and keep the
              service safe (for example, by moderating reported messages). We do
              not sell your personal data.
            </p>
          </Section>

          <Section title="4. Who can see your data">
            <p>
              Information you choose to make public — your username, profile,
              ranks, achievements, team, and chat messages — is visible to other
              users by design. Your email, password, and date of birth are never
              shown publicly. Where you control a setting (such as making a profile
              public or private), we respect that choice.
            </p>
          </Section>

          <Section title="5. Younger players and parental consent">
            <p>
              Esports skews young, and some of our users are under 18. If you are a
              minor, you should use Esports Adda with the involvement of a parent
              or guardian, and we ask for age-appropriate consent. A parent or
              guardian may contact us to review or delete a minor&apos;s data.
            </p>
          </Section>

          <Section title="6. How long we keep it">
            <p>
              We keep your data for as long as your account is active. When you
              delete your account, we remove or anonymize your personal data,
              except where we are required to keep certain records to comply with
              the law or to resolve disputes.
            </p>
          </Section>

          <Section title="7. Your rights">
            <p>You can, at any time:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>See the data we hold about you</li>
              <li>Edit or correct your profile and account details</li>
              <li>Delete your data by deleting your account</li>
              <li>Ask us a question about how your data is used</li>
            </ul>
          </Section>

          <Section title="8. How we protect your data">
            <p>
              We take reasonable steps to keep your data safe. Passwords are stored
              using industry-standard one-way hashing and are never stored,
              logged, or transmitted in plain text. Sign-ins use signed session
              tokens. Traffic between your device and our servers runs over a
              secure (HTTPS) connection, and access to our systems is restricted to
              trusted origins. No system is perfectly secure, but we work to follow
              current good practice and to respond promptly if something goes wrong.
            </p>
          </Section>

          <Section title="9. The legal framework we operate under">
            <p>
              We operate primarily under Nepal&apos;s laws, including the Electronic
              Transactions Act 2063, the Individual Privacy Act 2075 (2018) and its
              Regulation 2077 (2020), and the privacy protection in Article 28 of
              the Constitution of Nepal. If users from the European Union take part,
              the relevant data-protection rules (GDPR), including rights of access,
              correction, deletion, and portability, may also apply.
            </p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>
              We may update this policy as the platform grows or as the law
              changes. When we make a significant change, we will update the date
              at the top of this page.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about your privacy? Reach out through the contact options on
              our{" "}
              <Link href="/about" className="text-[#e85d5d] hover:underline">
                About
              </Link>{" "}
              page. See also our{" "}
              <Link href="/terms" className="text-[#e85d5d] hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </Section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="font-['Russo_One'] text-lg sm:text-xl text-white/90 mb-3">
        {title}
      </h2>
      <div className="text-white/60 text-[15px] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
