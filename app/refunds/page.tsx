import Link from "next/link";

export default function RefundPolicyPage() {
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
            Refund Policy
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Refund Policy
          </h1>

          <p className="mt-2 text-sm text-slate-400">Last updated: May 2026</p>

          <div className="mt-6 space-y-6 text-sm leading-7 text-slate-300 sm:text-base">
            <section>
              <h2 className="text-lg font-bold text-white">
                Digital Product Purchases
              </h2>

              <p className="mt-2">
                Pro Football Intel provides digital football prediction content.
                Once a prediction has been unlocked and access has been granted,
                purchases are generally non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Duplicate Purchases
              </h2>

              <p className="mt-2">
                If you believe you were charged more than once accidentally for
                the same prediction, please contact support and we will review
                the issue.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Technical Issues
              </h2>

              <p className="mt-2">
                If a technical issue prevented access to purchased content, we
                may investigate and provide support, replacement access or a
                refund where appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Fraudulent Activity
              </h2>

              <p className="mt-2">
                We reserve the right to refuse refunds where fraudulent activity,
                abuse of the platform or payment disputes are suspected.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Chargebacks
              </h2>

              <p className="mt-2">
                Initiating unjustified chargebacks after receiving purchased
                digital content may result in restriction or permanent removal
                of access to Pro Football Intel services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Contact Support
              </h2>

              <p className="mt-2">
                For refund or billing enquiries, contact{" "}
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