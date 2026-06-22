import Image from "next/image";
import Link from "next/link";
import { formatUKDateTime } from "@/lib/utils/date";

type UnlockedPredictionCardProps = {
  fixtureId: string;
  home: string;
  away: string;
  league?: string;
  date?: string;
  homeLogo?: string;
  awayLogo?: string;
  unlockReference: string;
  individualPredictionUrl: string;
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
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
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

export default function UnlockedPredictionCard({
  fixtureId,
  home,
  away,
  league = "Purchased Prediction",
  date = "",
  homeLogo = "",
  awayLogo = "",
  unlockReference,
  individualPredictionUrl,
}: UnlockedPredictionCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 via-[#111827] to-emerald-400/5 shadow-2xl sm:rounded-[32px]">
      <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
          ✓ Prediction unlocked
        </div>

        <div className="mb-4 mt-4 flex min-w-0 flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="mt-2 text-lg font-black text-white">Home Win</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Probability
            </div>
            <div className="mt-2 text-lg font-black text-white">67%</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Confidence
            </div>
            <div className="mt-2 text-lg font-black text-white">High</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
            Unlock reference
          </p>
          <p className="mt-3 break-all font-mono text-sm font-black text-emerald-300">
            {unlockReference}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-slate-500">
            Fixture ID: {fixtureId}
          </p>

          <Link
            href={individualPredictionUrl}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-bold text-slate-200 transition hover:bg-white/10"
          >
            Open individual prediction
          </Link>
        </div>
      </div>
    </article>
  );
}