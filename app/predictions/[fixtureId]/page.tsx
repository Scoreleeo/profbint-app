import Image from "next/image";
import Link from "next/link";
import { formatUKDateTime } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

const CHECKOUT_START_URL = "https://checkout.profbint.com/start";
const CHECKOUT_VALIDATE_URL =
  "https://checkout.profbint.com/api/unlock/validate";

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
    ref?: string;
    unlockReference?: string;
  }>;
};

type UnlockValidationResult = {
  valid: boolean;
  status?: string | null;
  error?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function cleanLogoUrl(value?: string) {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cleanUnlockReference(value?: string) {
  if (!value) {
    return "";
  }

  return value.trim().toUpperCase();
}

function buildReturnUrl({
  fixtureId,
  home,
  away,
  league,
  date,
  homeLogo,
  awayLogo,
  provider,
}: {
  fixtureId: string;
  home: string;
  away: string;
  league: string;
  date: string;
  homeLogo: string;
  awayLogo: string;
  provider: string;
}) {
  const params = new URLSearchParams();

  params.set("home", home);
  params.set("away", away);
  params.set("league", league);

  if (date) params.set("date", date);
  if (homeLogo) params.set("homeLogo", homeLogo);
  if (awayLogo) params.set("awayLogo", awayLogo);
  if (provider) params.set("provider", provider);

  return `https://profbint.com/predictions/${fixtureId}?${params.toString()}`;
}

function buildCheckoutUrl({
  fixtureId,
  home,
  away,
  returnUrl,
}: {
  fixtureId: string;
  home: string;
  away: string;
  returnUrl: string;
}) {
  const params = new URLSearchParams();

  params.set("fixtureId", fixtureId);
  params.set("matchName", `${home} vs ${away}`);
  params.set("returnUrl", returnUrl);

  return `${CHECKOUT_START_URL}?${params.toString()}`;
}

async function validateUnlockReference({
  unlockReference,
  fixtureId,
}: {
  unlockReference: string;
  fixtureId: string;
}): Promise<UnlockValidationResult> {
  if (!unlockReference) {
    return {
      valid: false,
    };
  }

  try {
    const params = new URLSearchParams();

    params.set("ref", unlockReference);
    params.set("fixtureId", fixtureId);

    const response = await fetch(`${CHECKOUT_VALIDATE_URL}?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        valid: false,
        error: "Unable to validate unlock reference.",
      };
    }

    const data = (await response.json()) as UnlockValidationResult;

    return {
      valid: Boolean(data.valid),
      status: data.status ?? null,
      error: data.error,
    };
  } catch {
    return {
      valid: false,
      error: "Unable to validate unlock reference.",
    };
  }
}

function TeamLogo({ src, alt }: { src?: string; alt: string }) {
  const logoSrc = cleanLogoUrl(src);
  const initials = getInitials(alt);

  if (!logoSrc) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white sm:h-14 sm:w-14">
        {initials || "?"}
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/5 sm:h-14 sm:w-14">
      <Image
        src={logoSrc}
        alt={alt}
        fill
        unoptimized
        sizes="56px"
        className="object-contain p-1"
      />
    </div>
  );
}

function hasMatchStarted(date: string) {
  if (!date) {
    return false;
  }

  const kickoffTime = new Date(date).getTime();

  if (Number.isNaN(kickoffTime)) {
    return false;
  }

  return Date.now() >= kickoffTime;
}

export default async function LockedPredictionPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const fixtureId = resolvedParams.fixtureId;
  const home = resolvedSearchParams.home || "Home Team";
  const away = resolvedSearchParams.away || "Away Team";
  const league = resolvedSearchParams.league || "Football";
  const date = resolvedSearchParams.date || "";
  const homeLogo = cleanLogoUrl(resolvedSearchParams.homeLogo);
  const awayLogo = cleanLogoUrl(resolvedSearchParams.awayLogo);
  const provider = resolvedSearchParams.provider || "football-data";
  const unlockReference = cleanUnlockReference(
    resolvedSearchParams.ref || resolvedSearchParams.unlockReference,
  );

  const matchStarted = hasMatchStarted(date);

  const returnUrl = buildReturnUrl({
    fixtureId,
    home,
    away,
    league,
    date,
    homeLogo,
    awayLogo,
    provider,
  });

  const checkoutUrl = buildCheckoutUrl({
    fixtureId,
    home,
    away,
    returnUrl,
  });

  const unlockValidation = await validateUnlockReference({
    unlockReference,
    fixtureId,
  });

  const isUnlocked = unlockValidation.valid;

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
            {isUnlocked
              ? "Prediction Unlocked"
              : matchStarted
                ? "Prediction Closed"
                : "Locked Match Prediction"}
          </div>

          <h1 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">
            {home} vs {away}
          </h1>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300 md:text-base">
            {isUnlocked
              ? "Your unlock reference has been verified for this fixture."
              : matchStarted
                ? "This match has already kicked off, so the paid prediction window is now closed."
                : "Unlock the model prediction, probability rating and confidence score before kick-off."}
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
                <div
                  className={`mt-2 text-lg font-black text-white ${
                    isUnlocked ? "" : "blur-sm"
                  }`}
                >
                  Home Win
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Probability
                </div>
                <div
                  className={`mt-2 text-lg font-black text-white ${
                    isUnlocked ? "" : "blur-sm"
                  }`}
                >
                  67%
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Confidence
                </div>
                <div
                  className={`mt-2 text-lg font-black text-white ${
                    isUnlocked ? "" : "blur-sm"
                  }`}
                >
                  High
                </div>
              </div>
            </div>
          </div>
        </section>

        {isUnlocked ? (
          <section className="mt-5 overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 via-[#111827] to-emerald-400/5 p-5 shadow-xl sm:mt-6 sm:rounded-3xl sm:p-6 md:p-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
                ✓ Prediction unlocked
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Your paid prediction is unlocked
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                This unlock reference has been verified against fixture ID{" "}
                {fixtureId}.
              </p>

              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-left">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
                  Unlock reference
                </p>
                <p className="mt-3 break-all font-mono text-sm font-black text-emerald-300">
                  {unlockReference}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/predictions"
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  View all predictions
                </Link>

                <Link
                  href="/basket"
                  className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/20"
                >
                  View basket
                </Link>
              </div>
            </div>
          </section>
        ) : matchStarted ? (
          <section className="mt-5 overflow-hidden rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5 shadow-xl sm:mt-6 sm:rounded-3xl sm:p-6 md:p-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-4 inline-flex rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-300">
                Prediction closed
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Match has started
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Paid predictions close at kick-off. This protects the product
                and keeps the service fair.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/"
                  className="rounded-xl bg-red-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-red-400"
                >
                  Back to fixtures
                </Link>

                <Link
                  href="/predictions"
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  View available predictions
                </Link>
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                Fixture ID: {fixtureId}. Provider: {provider}.
              </p>
            </div>
          </section>
        ) : (
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

              <div className="mt-6">
                <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    Match unlock
                  </div>
                  <div className="mt-2 text-3xl font-black text-white">
                    £3.99
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    Unlock this match prediction
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Access stays open until this game ends.
                  </div>
                </div>
              </div>

              {unlockReference && unlockValidation.error ? (
                <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                  {unlockValidation.error}
                </div>
              ) : null}

              {unlockReference && !unlockValidation.valid ? (
                <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                  This unlock reference is valid only for the match or basket
                  that was purchased. It does not unlock this fixture.
                </div>
              ) : null}

              <form
                action={`/predictions/${fixtureId}`}
                method="get"
                className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <input type="hidden" name="home" value={home} />
                <input type="hidden" name="away" value={away} />
                <input type="hidden" name="league" value={league} />
                <input type="hidden" name="date" value={date} />
                <input type="hidden" name="homeLogo" value={homeLogo} />
                <input type="hidden" name="awayLogo" value={awayLogo} />
                <input type="hidden" name="provider" value={provider} />

                <label
                  htmlFor="unlockReference"
                  className="block text-left text-xs font-black uppercase tracking-[0.2em] text-slate-400"
                >
                  Already paid? Enter unlock reference
                </label>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="unlockReference"
                    name="ref"
                    defaultValue={unlockReference}
                    placeholder="PFI_..."
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
                  />

                  <button
                    type="submit"
                    className="rounded-xl border border-emerald-400/30 bg-emerald-400 px-5 py-3 text-sm font-black text-[#08101c] transition hover:bg-emerald-300"
                  >
                    Validate
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href={checkoutUrl}
                  className="rounded-xl border border-[#f3d98b]/30 bg-[#d6a94f] px-6 py-3 text-sm font-black text-[#08101c] shadow-md shadow-black/30 transition hover:bg-[#c89635]"
                >
                  Unlock this match – £3.99
                </a>

                <Link
                  href="/predictions"
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  View all predictions
                </Link>
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                Fixture ID: {fixtureId}. Provider: {provider}.
              </p>
            </div>
          </section>
        )}

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#111827] p-4 text-xs leading-6 text-slate-400 sm:mt-6 sm:rounded-3xl sm:p-5">
          Predictions are for informational purposes only and do not guarantee
          outcomes. Please see the legal disclaimer before using the service.
        </section>
      </div>
    </main>
  );
}