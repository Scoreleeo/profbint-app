import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#101827] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <section className="mt-5 rounded-2xl border border-white/15 bg-[#172033] p-5 shadow-xl sm:rounded-3xl sm:p-8">
          <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Terms
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Terms of Service
          </h1>

          <p className="mt-2 text-sm text-slate-400">Last updated: May 2026</p>

          <div className="mt-6 space-y-6 text-sm leading-7 text-slate-300 sm:text-base">
            <section>
              <h2 className="text-lg font-bold text-white">
                Agreement to These Terms
              </h2>
              <p className="mt-2">
                By using Pro Football Intel and profbint.com, you agree to these
                Terms of Service. If you do not agree, you should not use the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Informational Use Only
              </h2>
              <p className="mt-2">
                Predictions, probabilities, confidence ratings and match insights
                are provided for informational and entertainment purposes only.
                They do not guarantee football results, betting success,
                winnings or profit.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Age Requirement</h2>
              <p className="mt-2">
                You must be 18 years or older to purchase premium prediction
                access or use any paid features on Pro Football Intel.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Premium Access</h2>
              <p className="mt-2">
                Premium purchases unlock prediction content for the selected
                fixture only. Access to a paid match prediction remains available
                until that match has ended, unless otherwise stated.
              </p>
              <p className="mt-3">
                A purchase does not unlock other matches, future fixtures,
                divisions, competitions or subscription access.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Payments</h2>
              <p className="mt-2">
                Payments are processed securely through Stripe or another
                approved payment provider. We do not store full card details on
                our servers.
              </p>
              <p className="mt-3">
                Prices may change at any time, but price changes will not affect
                purchases that have already been completed.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Refunds</h2>
              <p className="mt-2">
                Due to the nature of digital prediction content, purchases are
                generally non-refundable once access has been granted.
              </p>
              <p className="mt-3">
                If you believe you were charged incorrectly, made a duplicate
                purchase, or experienced a technical issue that prevented access,
                contact support and we will review the issue.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Service Availability
              </h2>
              <p className="mt-2">
                We aim to keep the platform available and accurate, but we do
                not guarantee uninterrupted access. Football fixtures,
                predictions, live data, results, lineups and statistics may be
                delayed, unavailable or inaccurate due to third-party data
                providers or technical issues.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Responsible Use
              </h2>
              <p className="mt-2">
                You are responsible for how you use information provided by Pro
                Football Intel. Never gamble more than you can afford to lose.
                If gambling stops being enjoyable or becomes harmful, seek
                support from a responsible gambling organisation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Prohibited Use</h2>
              <p className="mt-2">You must not:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Copy, scrape, resell or redistribute prediction data</li>
                <li>Attempt to reverse engineer the prediction model</li>
                <li>Abuse, overload or disrupt the platform</li>
                <li>Use the service for unlawful purposes</li>
                <li>Attempt to bypass payment or access controls</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Limitation of Liability
              </h2>
              <p className="mt-2">
                Pro Football Intel is not responsible for betting losses,
                financial losses, missed opportunities, third-party data errors,
                service interruptions or decisions made based on information
                shown on the platform.
              </p>
              <p className="mt-3">
                Use of the service is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Changes to These Terms
              </h2>
              <p className="mt-2">
                We may update these Terms of Service from time to time. The
                latest version will be displayed on this page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Contact</h2>
              <p className="mt-2">
                For questions about these terms, contact{" "}
                <a
                  href="mailto:support@profbint.com"
                  className="font-semibold text-[#d6a94f] hover:text-[#f3d98b]"
                >
                  support@profbint.com
                </a>
                .
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}