import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Privacy Policy
          </h1>

          <p className="mt-2 text-sm text-slate-400">Last updated: May 2026</p>

          <div className="mt-6 space-y-6 text-sm leading-7 text-slate-300 sm:text-base">
            <section>
              <h2 className="text-lg font-bold text-white">Welcome</h2>
              <p className="mt-2">
                Welcome to Pro Football Intel. This Privacy Policy explains how
                we collect, use and protect information when you use profbint.com.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Information We Collect
              </h2>
              <p className="mt-2">We may collect:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Basic device and browser information</li>
                <li>IP address and usage analytics</li>
                <li>Pages visited and interactions within the app</li>
                <li>
                  Payment-related information processed securely by third-party
                  providers such as Stripe
                </li>
                <li>Information you provide when contacting support</li>
              </ul>
              <p className="mt-3">
                We do not intentionally collect sensitive personal information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Payments</h2>
              <p className="mt-2">
                Payments are securely processed by third-party providers
                including Stripe. We do not store full card details on our
                servers.
              </p>
              <p className="mt-3">
                Please review Stripe’s privacy policy for further information
                regarding payment processing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                How We Use Information
              </h2>
              <p className="mt-2">We use information to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Operate and improve the platform</li>
                <li>Provide match predictions and premium access</li>
                <li>Monitor technical performance and security</li>
                <li>Respond to customer support requests</li>
                <li>Prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Cookies and Analytics
              </h2>
              <p className="mt-2">
                We may use cookies and analytics services to improve the user
                experience and monitor platform performance. You can disable
                cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Data Security</h2>
              <p className="mt-2">
                We take reasonable measures to protect data and platform
                security. However, no online service can guarantee complete
                security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Third-Party Services
              </h2>
              <p className="mt-2">
                We may use trusted third-party providers including:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Stripe</li>
                <li>Vercel</li>
                <li>Analytics providers</li>
                <li>Football data providers</li>
              </ul>
              <p className="mt-3">
                These providers may process limited technical information
                necessary for service operation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Children</h2>
              <p className="mt-2">
                This service is intended for users aged 18 and over.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Contact</h2>
              <p className="mt-2">
                For support or privacy questions, contact{" "}
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