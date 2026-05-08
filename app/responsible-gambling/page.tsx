import Link from "next/link";

export default function ResponsibleGamblingPage() {
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
            Responsible Gambling
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Responsible Gambling Notice
          </h1>

          <p className="mt-2 text-sm text-slate-400">Last updated: May 2026</p>

          <div className="mt-6 space-y-6 text-sm leading-7 text-slate-300 sm:text-base">
            <section>
              <h2 className="text-lg font-bold text-white">
                Informational Use Only
              </h2>

              <p className="mt-2">
                Pro Football Intel provides football predictions and insights
                for informational and entertainment purposes only.
              </p>

              <p className="mt-3">
                Predictions do not guarantee outcomes, winnings or betting
                success.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Gamble Responsibly
              </h2>

              <p className="mt-2">
                Never gamble more than you can afford to lose.
              </p>

              <p className="mt-3">
                Gambling should remain enjoyable and controlled. If gambling
                becomes stressful, harmful or financially damaging, seek support
                immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Age Restriction
              </h2>

              <p className="mt-2">
                You must be 18 years or older to access paid prediction content
                on Pro Football Intel.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Signs of Problem Gambling
              </h2>

              <p className="mt-2">
                You may need support if gambling:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Causes financial stress</li>
                <li>Impacts relationships or work</li>
                <li>Feels difficult to control</li>
                <li>Stops being enjoyable</li>
                <li>Creates anxiety or emotional distress</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Seek Support
              </h2>

              <p className="mt-2">
                If you believe gambling may be becoming a problem, contact a
                responsible gambling organisation or professional support
                service in your country.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Contact
              </h2>

              <p className="mt-2">
                For support regarding Pro Football Intel services, contact{" "}
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