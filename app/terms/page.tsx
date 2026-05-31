"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Last meaningful update to these terms. Update when the text changes.
const LAST_UPDATED = "May 2026";

export default function TermsPage() {
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
          <header className="mb-10">
            <h1 className="font-['Russo_One'] text-3xl sm:text-4xl text-white mb-3">
              Terms of Service
            </h1>
            <p className="text-white/40 text-sm">Last updated: {LAST_UPDATED}</p>
            <p className="text-white/60 text-base leading-relaxed mt-5">
              These terms set out the rules for using Esports Adda. By creating an
              account or using the platform, you agree to them. We&apos;ve kept the
              language plain on purpose.
            </p>
          </header>

          <Section title="1. Who can use Esports Adda">
            <p>
              You may use Esports Adda to compete, build a profile, form teams, run
              tournaments, stream, and chat with the community. If you are under
              18, you should use the platform with the involvement of a parent or
              guardian. You are responsible for keeping your login details secure
              and for activity on your account.
            </p>
          </Section>

          <Section title="2. Account types">
            <p>
              The platform offers separate player accounts and organization
              accounts. Each account type receives only the permissions it needs.
              Within an organization, roles control who can change tournament
              settings, rosters, and staff. You must not attempt to access features
              or data your account is not entitled to.
            </p>
          </Section>

          <Section title="3. Community conduct">
            <p>
              Esports Adda includes per-game community chat and announcements. When
              you post, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Harass, threaten, or bully other users</li>
              <li>Post hate speech or discriminatory content</li>
              <li>Spam, scam, or post misleading information</li>
              <li>Share inappropriate or unlawful content</li>
              <li>Impersonate another player, team, or organization</li>
            </ul>
            <p className="mt-3">
              Messages can be reported by users and reviewed by moderators. We may
              hide, remove, or flag content, and we may warn, suspend, or ban
              accounts that break these rules.
            </p>
          </Section>

          <Section title="4. Fair competition">
            <p>
              Tournaments depend on trust. You agree to compete honestly and not to
              cheat, use unauthorized software, manipulate match results, or abuse
              registration and bracket systems. Organizers may verify registrations
              and disqualify entries that break tournament rules.
            </p>
          </Section>

          <Section title="5. Your content">
            <p>
              You keep ownership of the content you create — your profile details,
              team information, and messages. By posting it, you allow Esports Adda
              to display it as part of running the platform (for example, showing
              your profile to other users or your message in a community room).
            </p>
          </Section>

          <Section title="6. Publisher and third-party rights">
            <p>
              Games and their logos, names, and assets belong to their publishers
              (such as Riot, Valve, and Garena). Esports Adda is a community
              platform and is not endorsed by these publishers. When you organize or
              join events, you are responsible for respecting the relevant
              publisher&apos;s tournament and licensing rules.
            </p>
          </Section>

          <Section title="7. Moderation and enforcement">
            <p>
              We may warn, suspend, or ban accounts that break these terms or that
              put other users at risk. Where appropriate, we keep an internal record
              of moderation actions for accountability. If your account is actioned,
              the reason is shown to you where possible.
            </p>
          </Section>

          <Section title="8. Availability">
            <p>
              We work to keep the platform running, but we do not guarantee it will
              always be available or error-free. Features may change, and we may
              perform maintenance that temporarily interrupts the service.
            </p>
          </Section>

          <Section title="9. The law that applies">
            <p>
              These terms operate under the laws of Nepal, including the Electronic
              Transactions Act 2063 and related legislation. Where users from other
              regions take part, additional local rules may also apply to them.
            </p>
          </Section>

          <Section title="10. Changes to these terms">
            <p>
              We may update these terms as the platform evolves. When we make a
              significant change, we will update the date at the top of this page.
              Continuing to use Esports Adda after a change means you accept the
              updated terms.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about these terms? Reach out through the contact options on
              our{" "}
              <Link href="/about" className="text-[#e85d5d] hover:underline">
                About
              </Link>{" "}
              page. See also our{" "}
              <Link href="/privacy" className="text-[#e85d5d] hover:underline">
                Privacy Policy
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
