export const dynamic = "force-dynamic";

export default async function PrivateAccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
  }>;
}) {
  const params = await searchParams;

  const invalidPassword = params.error === "invalid";
  const configError = params.error === "config";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06101d] px-4 py-10 text-white">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-red-400/20 bg-gradient-to-br from-slate-950 via-[#0b1624] to-slate-950 shadow-2xl">
        <div className="border-b border-white/[0.07] px-6 py-8 text-center sm:px-10">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-red-300/20 bg-red-300/[0.08] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-red-200">
            <span className="h-2 w-2 rounded-full bg-red-300 shadow-[0_0_14px_rgba(252,165,165,0.9)]" />
            Private & Restricted Access
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">
            Pro Football Intel
          </h1>

          <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Authorised users only
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-10">
          <div className="rounded-3xl border border-red-300/20 bg-red-300/[0.06] p-5 sm:p-6">
            <h2 className="text-lg font-black text-red-200">
              Unauthorised access is prohibited
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                This website is private and is not intended for public access.
                Access is permitted only to persons who have received express
                written permission from the site owner.
              </p>

              <p>
                Any attempt to access this website without authorisation,
                including attempting to bypass, obtain, guess, share or misuse
                access credentials, is strictly prohibited.
              </p>

              <p>
                Any data, predictions, analysis, tools, content or information
                contained within this website is confidential and provided
                solely for authorised use.
              </p>

              <p>
                If you have not received written permission from the site owner,
                you must not proceed.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
            <p className="text-sm leading-7 text-amber-100/90">
              To the fullest extent permitted by law, the site owner accepts no
              responsibility for any unauthorised use, copying, redistribution,
              reliance upon or misuse of information obtained through unlawful
              or unauthorised access to this website.
            </p>
          </div>

          {invalidPassword ? (
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] px-4 py-3 text-center">
              <p className="text-sm font-bold text-rose-200">
                Incorrect private access password.
              </p>
            </div>
          ) : null}

          {configError ? (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-center">
              <p className="text-sm font-bold text-amber-200">
                Private access is not configured correctly.
              </p>
            </div>
          ) : null}

          <form
            action="/api/private-access/login"
            method="post"
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="password"
                className="text-xs font-black uppercase tracking-[0.16em] text-slate-400"
              >
                Private Access Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-base font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-cyan-300 px-6 py-4 text-base font-black text-cyan-950 transition hover:bg-cyan-200"
            >
              Enter Private Site
            </button>
          </form>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-center">
            <p className="text-xs leading-6 text-slate-500">
              By entering this site, you confirm that you have been expressly
              authorised by the site owner to access it.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}