export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">

        <h1 className="text-3xl font-black">Legal & Disclaimer</h1>

        <section>
          <h2 className="mb-2 text-xl font-bold">Terms of Use</h2>
          <p className="text-slate-300">
            By using this website, you agree to use all information provided for
            informational and entertainment purposes only. Pro Football Intel
            does not provide financial, betting, or investment advice.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">Predictions Disclaimer</h2>
          <p className="text-slate-300">
            All match predictions, probabilities, and insights are generated
            using statistical models and data analysis. While we aim to provide
            accurate and useful information, we do not guarantee the accuracy,
            completeness, or reliability of any predictions.
          </p>
          <p className="mt-2 text-slate-300">
            Football is inherently unpredictable, and outcomes may differ
            significantly from any projections provided on this platform.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">Betting & Gambling Disclaimer</h2>
          <p className="text-slate-300">
            Any use of information from this website for betting or gambling is
            done entirely at your own risk. Pro Football Intel is not responsible
            for any financial losses, damages, or consequences resulting from
            decisions made based on our content.
          </p>
          <p className="mt-2 text-slate-300">
            We do not operate as a betting service, tipster, or gambling advisor.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">Responsible Gambling</h2>
          <p className="text-slate-300">
            If you choose to gamble, please do so responsibly. Gambling should be
            viewed as entertainment, not a way to make money.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            <li>Only bet what you can afford to lose</li>
            <li>Never chase losses</li>
            <li>Take regular breaks</li>
          </ul>
          <p className="mt-2 text-slate-300">
            If you feel you may have a gambling problem, seek help from:
          </p>
          <ul className="mt-2 list-disc pl-5 text-slate-300">
            <li>BeGambleAware.org</li>
            <li>GamCare.org.uk</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">Age Restriction</h2>
          <p className="text-slate-300">
            This website is intended for users aged 18 and over. By using this
            site, you confirm that you meet this requirement.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">Limitation of Liability</h2>
          <p className="text-slate-300">
            Pro Football Intel shall not be held liable for any direct, indirect,
            incidental, or consequential losses or damages arising from the use
            of this website or reliance on its content.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">Contact</h2>
          <p className="text-slate-300">
            For any questions regarding these terms:
          </p>
          <p className="mt-2 font-semibold text-white">
            support@profbint.com
          </p>
        </section>

      </div>
    </main>
  );
}