import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { Atlas } from "./atlas";
import "./styles.css";

type User = { email: string; name: string };
type AuthResponse = { user: User | null };

async function api(path: string, options: RequestInit = {}): Promise<AuthResponse> {
  const response = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function Brand() {
  return <a href="#top" className="flex items-center gap-2 font-mono text-xs font-bold tracking-[.18em] text-slate-100"><span className="text-3xl leading-none text-teal-200 drop-shadow-[0_0_9px_#7ee9d7]">◌</span>THE PLANETARY ATLAS</a>;
}

function Landing({ openAuth }: { openAuth: (mode: "register" | "login") => void }) {
  return <div id="top" className="min-h-screen overflow-hidden bg-[#071018] text-slate-100"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_4%,rgba(45,212,191,.15),transparent_28rem),radial-gradient(circle_at_0%_35%,rgba(56,189,248,.1),transparent_28rem)]" />
    <header className="relative mx-auto flex min-h-22 w-[min(100%-2rem,78rem)] items-center justify-between gap-5 py-4 sm:w-[min(100%-3rem,78rem)]"><Brand /><nav aria-label="Public navigation" className="hidden gap-7 text-xs text-slate-400 md:flex"><a className="hover:text-cyan-100" href="#atlas">Atlas</a><a className="hover:text-cyan-100" href="#evidence">Evidence standard</a><a className="hover:text-cyan-100" href="#sources">Sources</a></nav><div className="flex shrink-0 items-center gap-3"><button className="rounded-md px-2 py-2 font-mono text-xs text-slate-300 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200" onClick={() => openAuth("login")}>Sign in</button><button className="rounded-md bg-cyan-200 px-3 py-3 font-mono text-[.68rem] font-semibold text-slate-950 shadow-[0_0_24px_rgba(165,243,252,.18)] hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-50" onClick={() => openAuth("register")}>Join the atlas →</button></div></header>
    <main className="relative mx-auto w-[min(100%-2rem,78rem)] sm:w-[min(100%-3rem,78rem)]"><section className="grid items-center gap-12 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24"><div><p className="font-mono text-[.68rem] tracking-[.2em] text-cyan-200">THE PLANETARY ATLAS / RESEARCH WORKSPACE</p><h1 className="mt-5 max-w-2xl font-serif text-5xl leading-[.93] tracking-[-.06em] text-stone-100 sm:text-7xl">Evidence for <i className="font-normal text-cyan-100">worlds</i> beyond ours.</h1><p className="mt-7 max-w-xl leading-7 text-slate-300">A focused interface for navigating confirmed exoplanets, their host stars, discovery records, and the evidence needed to interpret them responsibly.</p><div className="mt-8 flex flex-wrap items-center gap-4"><button className="rounded-md bg-cyan-200 px-5 py-3 font-mono text-xs font-semibold text-slate-950 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-50" onClick={() => openAuth("register")}>Create a research account →</button><a href="#evidence" className="rounded-md px-2 py-3 font-mono text-xs text-slate-300 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200">How evidence is handled ↓</a></div><p className="mt-7 font-mono text-[.62rem] leading-5 text-slate-500">ACCESS TO THE CATALOGUE REQUIRES AN ACCOUNT. PUBLIC PAGES NEVER EXPOSE RESEARCH WORKSPACE DATA.</p></div><div className="relative mx-auto h-72 w-full max-w-md sm:h-96"><div className="absolute inset-4 rounded-full border border-cyan-100/15" /><div className="absolute inset-12 rounded-full border border-cyan-100/20" /><div className="absolute left-[51%] top-[14%] size-21 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff6bd,#f9bc71_25%,#cb5b48_68%,#742d42)] shadow-[0_0_50px_rgba(251,146,60,.35)]" /><div className="absolute bottom-[11%] left-[16%] size-40 rounded-full bg-[radial-gradient(circle_at_30%_22%,#d4f3e6,#629c9d_17%,#1d4a69_49%,#071322_72%)] shadow-[inset_-24px_-18px_30px_rgba(1,8,18,.8),0_0_40px_rgba(45,212,191,.2)]" /><p className="absolute bottom-0 right-3 font-mono text-[.62rem] text-slate-400">ILLUSTRATIVE CONTEXT / NOT OBSERVED IMAGERY</p></div></section>
      <section id="atlas" className="grid gap-6 border-y border-white/10 py-12 md:grid-cols-3"><div><p className="font-mono text-[.65rem] tracking-[.18em] text-cyan-200">THE ATLAS</p><h2 className="mt-3 font-serif text-3xl tracking-[-.04em]">Find the record. Follow the evidence.</h2></div><p className="text-sm leading-6 text-slate-400">Search the local confirmed-planet catalogue by planet, host star, discovery method, and available measured properties.</p><p className="text-sm leading-6 text-slate-400">Move deliberately from a catalogue value to its source, its limits, and—where possible—its mission context.</p></section>
      <section id="evidence" className="py-16"><p className="font-mono text-[.65rem] tracking-[.18em] text-cyan-200">EVIDENCE STANDARD</p><h2 className="mt-3 max-w-2xl font-serif text-4xl tracking-[-.05em]">A number is useful only when you know what it represents.</h2><div className="mt-8 grid gap-4 md:grid-cols-3"><InfoCard label="CATALOGUE VALUE" title="A useful starting point" text="Confirmed-planet parameters from a maintained archive, shown with their source context." /><InfoCard label="MEASURED / REPORTED" title="Evidence stays visible" text="Follow-up products and source-specific measurements belong alongside—not behind—the summary." /><InfoCard label="MODELLED" title="No imagined certainty" text="Visual interpretation is clearly labelled when it relies on inference, simulation, or artist collaboration." /></div></section>
      <section id="sources" className="mb-16 rounded-2xl border border-cyan-100/15 bg-cyan-100/[.04] p-6 sm:p-9"><p className="font-mono text-[.65rem] tracking-[.18em] text-cyan-200">CURRENT DATA FOUNDATION</p><div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto]"><div><h2 className="font-serif text-3xl tracking-[-.04em]">NASA Exoplanet Archive / PSCompPars</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">The local catalogue synchronizes daily from NASA’s composite confirmed-planet table. Composite values can originate in different publications; the Atlas treats them as an entry point, not a substitute for source-specific analysis.</p></div><button className="self-start rounded-md border border-cyan-100/30 px-4 py-3 font-mono text-xs text-cyan-100 hover:bg-cyan-100/10 focus:outline-none focus:ring-2 focus:ring-cyan-200" onClick={() => openAuth("register")}>Open the protected atlas →</button></div></section>
    </main></div>;
}

function InfoCard({ label, title, text }: { label: string; title: string; text: string }) { return <article className="rounded-xl border border-white/10 bg-white/[.025] p-5"><p className="font-mono text-[.6rem] tracking-[.15em] text-cyan-200">{label}</p><h3 className="mt-6 text-lg font-medium text-slate-100">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>; }

const isWorkspacePath = (path: string) => path === "/atlas" || path.startsWith("/atlas/") || path === "/explore" || path === "/data-methods" || path === "/tools";

function useBrowserPath() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);
  const navigate = useCallback((nextPath: string) => {
    if (window.location.pathname === nextPath) return;
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }, []);
  return { path, navigate };
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const { path, navigate } = useBrowserPath();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { api("/api/auth/me").then(({ user }) => setUser(user)).catch(() => setUser(null)); }, []);
  useEffect(() => { if (user && !isWorkspacePath(path)) navigate("/atlas"); }, [path, navigate, user]);
  const registering = path === "/join";
  const authenticating = path === "/sign-in" || path === "/join" || isWorkspacePath(path);
  const openAuth = (mode: "register" | "login") => navigate(mode === "register" ? "/join" : "/sign-in");
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); setError(""); try { const data = await api(`/api/auth/${registering ? "register" : "login"}`, { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); setUser(data.user); if (!isWorkspacePath(path)) navigate("/atlas"); } catch (reason) { setError(reason instanceof Error ? reason.message : "Something went wrong."); } finally { setSaving(false); } };
  const logout = async () => { await api("/api/auth/logout", { method: "POST" }); setUser(null); navigate("/"); };
  if (user) return <Atlas user={user} logout={logout} path={path} navigate={navigate} />;
  if (!authenticating) return <Landing openAuth={openAuth} />;
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_80%_10%,#1c2d61_0%,transparent_40rem),#070b1a] p-6 text-slate-100"><section className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/90 p-9 shadow-2xl"><button className="mb-6 font-mono text-xs text-teal-200" onClick={() => navigate("/")}>← Back</button><p className="font-mono text-[.68rem] tracking-[.17em] text-teal-200">THE PLANETARY ATLAS</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{registering ? "Start exploring." : "Welcome back."}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{registering ? "Create your account. Your email address will be your user ID." : "Sign in to your research workspace."}</p>{isWorkspacePath(path) && <p className="mt-4 rounded-lg border border-cyan-200/20 bg-cyan-200/5 p-3 text-sm text-cyan-100">Sign in to continue to your requested workspace page.</p>}<form className="mt-7 grid gap-4" onSubmit={submit}>{registering && <label className="grid gap-2 text-sm font-medium">Name<input className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200" name="name" minLength={2} required /></label>}<label className="grid gap-2 text-sm font-medium">Email<input className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200" name="email" type="email" required /></label><label className="grid gap-2 text-sm font-medium">Password<input className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200" name="password" type="password" minLength={8} required /></label>{error && <p className="rounded-lg bg-rose-950 p-3 text-sm text-rose-200">{error}</p>}<button disabled={saving} className="rounded-lg bg-teal-200 p-3 font-semibold text-slate-950">{saving ? "Please wait…" : registering ? "Create account" : "Sign in"}</button></form><p className="mt-6 text-sm text-slate-400">{registering ? "Already have an account?" : "New here?"} <button className="text-teal-200 underline" onClick={() => openAuth(registering ? "login" : "register")}>{registering ? "Sign in" : "Create an account"}</button></p></section></main>;
}

const root = document.getElementById("root");
if (!root) throw new Error("The root element is missing.");
createRoot(root).render(<App />);
