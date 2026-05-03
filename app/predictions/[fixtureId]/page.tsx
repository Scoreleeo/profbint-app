import Image from "next/image";
import Link from "next/link";
import { formatUKDateTime } from "@/lib/utils/date";

type PageProps = {
  params: Promise<{
    fixtureId: string;
  }>;
  searchParams: Promise<{
    home?: string;
    away?: string;
    league?: string;
    date?: string;
    homeLogo?: string;
    awayLogo?: string;
    provider?: string;
  }>;
};

function TeamLogo({ src, alt }: { src?: string; alt: string }) {
  const initials = alt
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white sm:h-14 sm:w-14">
        {initials || "?"}
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/5 sm:h-14 sm:w-14">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="56px"
        className="object-contain p-1"
      />
    </div>
  );
}

export default async function LockedPredictionPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const home = resolvedSearchParams.home || "Home Team";
  const away = resolvedSearchParams.away || "Away Team";
  const league = resolvedSearchParams.league || "Football";
  const date = resolvedSearchParams.date || "";
  const homeLogo = resolvedSearchParams.homeLogo || "";
  const awayLogo = resolvedSearchParams.awayLogo || "";
  const provider = resolvedSearchParams.provider || "football-data";

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0b1220] text-white">
      <div className="border-b border-white/10 bg-[#08101c]">
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            ← Back to Home
          </Link>

          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-red-400 sm:text-sm sm:tracking-[0.2em]">
            Locked Match Prediction
          </div>

          <h1 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">
            {home} vs {away}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Unlock the model prediction, probability rating and confidence score
            for this fixture.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#1e293b] shadow-2xl sm:rounded-[32px]">
          <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8">
            <div className="mb-4 flex min-w-0 flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 truncate">{league}</span>
              <span className="shrink-0">
                {date ? formatUKDateTime(date) : "Kick-off TBC"}
              </span>
            </div>

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 md:gap-6">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <TeamLogo src={homeLogo} alt={home} />
                <span className="min-w-0 truncate text-sm font-black sm:text-lg md:text-2xl">
                  {home}
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                <div className="text-xs font-black uppercase tracking-wide text-slate-300">
                  vs
                </div>
              </div>

              <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
                <span className="min-w-0 truncate text-right text-sm font-black sm:text-lg md:text-2xl">
                  {away}
                </span>
                <TeamLogo src={awayLogo} alt={away} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Prediction
                </div>
                <div className="mt-2 blur-sm text-lg font-black text-white">
                  Home Win
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Probability
                </div>
                <div className="mt-2 blur-sm text-lg font-black text-white">
                  67%
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Confidence
                </div>
                <div className="mt-2 blur-sm text-lg font-black text-white">
                  High
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 via-[#111827] to-red-400/5 p-5 shadow-xl sm:mt-6 sm:rounded-3xl sm:p-6 md:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-300">
              🔒 Prediction locked
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Unlock this match prediction
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Get the best outcome option, model probability and confidence
              rating for this fixture.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Single match
                </div>
                <div className="mt-2 text-2xl font-black text-white">£1.99</div>
              </div>

              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                <div className="text-xs uppercase tracking-wide text-red-300">
                  Best value
                </div>
                <div className="mt-2 text-2xl font-black text-white">£9.99</div>
                <div className="mt-1 text-xs text-slate-400">
                  Unlock all today
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Division pass
                </div>
                <div className="mt-2 text-2xl font-black text-white">£5.99</div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="rounded-xl bg-red-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-red-400"
              >
                Unlock this prediction – £1.99
              </button>

              <Link
                href="/predictions"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                View all predictions
              </Link>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Payments are not active yet. This page prepares the premium unlock
              flow before Stripe is connected. Fixture ID:{" "}
              {resolvedParams.fixtureId}. Provider: {provider}.
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#111827] p-4 text-xs leading-6 text-slate-400 sm:mt-6 sm:rounded-3xl sm:p-5">
          Predictions are for informational purposes only and do not guarantee
          outcomes. Please see the legal disclaimer before using the service.
        </section>
      </div>
    </main>
  );
}