import { useEffect, useState, type FormEvent } from "react";
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
  return <div id="top" className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_78%_25%,#334e69_0%,#132036_35%,#080d18_72%)] text-slate-100">
    <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(#c9d9dc_1px,transparent_1px),radial-gradient(#8eb1c7_1px,transparent_1px)] [background-position:20px_20px,70px_100px] [background-size:120px_120px,173px_173px]" />
    <header className="relative mx-auto flex h-22 w-[min(100%-3rem,78rem)] items-center justify-between"><Brand /><nav className="hidden gap-8 text-xs text-slate-400 sm:flex"><a href="#atlas">Atlas</a><a href="#mission">Mission</a><a href="#data">Data</a></nav><div className="flex items-center gap-4"><button className="font-mono text-xs text-slate-300" onClick={() => openAuth("login")}>Sign in</button><button className="rounded-md border border-teal-100 bg-teal-200 px-4 py-3 font-mono text-[.68rem] font-semibold text-slate-950 shadow-[0_0_24px_#83d5c328]" onClick={() => openAuth("register")}>Join the atlas <span className="ml-2">→</span></button></div></header>
    <main className="relative mx-auto grid min-h-[calc(100vh-5.5rem)] w-[min(100%-3rem,78rem)] items-center lg:grid-cols-2"><section className="py-16 lg:py-0"><p className="mb-4 font-mono text-[.68rem] tracking-[.17em] text-teal-200">THE EXOPLANET ATLAS / EST. 2026</p><h1 className="font-serif text-6xl leading-[.88] tracking-[-.07em] text-stone-100 sm:text-7xl lg:text-8xl">Evidence for<br /><i className="font-normal text-teal-200">worlds</i> beyond ours.</h1><p className="mt-7 max-w-md leading-7 text-slate-300">A focused research interface for examining the measured properties, orbits, and discovery records of confirmed exoplanets.</p><div className="mt-8 flex items-center gap-6"><button className="rounded-md bg-teal-200 px-5 py-3 font-mono text-xs font-semibold text-slate-950" onClick={() => openAuth("register")}>Open the catalogue <span className="ml-2">→</span></button><a href="#atlas" className="font-mono text-xs text-slate-300">Explore the dataset <span className="ml-2 text-teal-200">↓</span></a></div><div className="mt-15 flex gap-6 font-mono text-[.58rem] uppercase text-slate-400 sm:gap-9"><span><b className="mb-1 block font-sans text-sm font-medium normal-case text-slate-100">6,000+</b>confirmed worlds</span><span><b className="mb-1 block font-sans text-sm font-medium normal-case text-slate-100">4,500</b>star systems</span><span className="hidden sm:block"><b className="mb-1 block font-sans text-sm font-medium normal-case text-slate-100">32</b>years of discovery</span></div></section><section className="relative h-80 lg:h-[36rem]"><div className="absolute left-[57%] top-[17%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_36%_34%,#fff6bd,#f9bc71_24%,#df644e_67%,#80334a)] shadow-[0_0_30px_#ffc17680,0_0_90px_#ff8a4b50]" /><div className="absolute left-[7%] top-[11%] h-72 w-[37rem] rotate-[-25deg] rounded-[50%] border border-teal-100/30" /><div className="absolute left-[22%] top-[31%] h-44 w-96 rotate-[22deg] rounded-[50%] border border-sky-100/20" /><div className="absolute left-[35%] top-[47%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_30%_25%,#f2e6b8_0_3%,#a6bfad_8%,#315d6c_27%,#142b48_62%,#071328)] shadow-[inset_-28px_-20px_36px_#030b1c99,0_0_50px_#76c8d344]" /><p className="absolute bottom-[5%] left-[36%] font-mono text-xs text-slate-100">TOI-700 d <span className="mt-1 block text-[.6rem] text-slate-400">101 light years away</span></p></section></main>
    <section id="atlas" className="relative mx-auto w-[min(100%-3rem,78rem)] border-t border-slate-200/15 py-16"><p className="font-mono text-[.68rem] tracking-[.17em] text-teal-200">A QUIET VIEW OF THE COSMOS</p><h2 className="mt-2 font-serif text-4xl tracking-[-.05em] text-stone-100">One atlas. <i className="font-normal text-teal-200">Every</i> discovery.</h2><p className="mt-4 max-w-lg text-slate-400">Search and compare the worlds that are reshaping our idea of home.</p></section>
  </div>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<"landing" | "register" | "login">("landing");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { api("/api/auth/me").then(({ user }) => setUser(user)).catch(() => setUser(null)); }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); setError(""); try { const data = await api(`/api/auth/${screen}`, { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); setUser(data.user); } catch (reason) { setError(reason instanceof Error ? reason.message : "Something went wrong."); } finally { setSaving(false); } };
  const logout = async () => { await api("/api/auth/logout", { method: "POST" }); setUser(null); setScreen("landing"); };
  if (user) return <Atlas user={user} logout={logout} />;
  if (screen === "landing") return <Landing openAuth={setScreen} />;
  const registering = screen === "register";
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_80%_10%,#1c2d61_0%,transparent_40rem),#070b1a] p-6 text-slate-100"><section className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/90 p-9 shadow-2xl"><button className="mb-6 font-mono text-xs text-teal-200" onClick={() => setScreen("landing")}>← Back</button><p className="font-mono text-[.68rem] tracking-[.17em] text-teal-200">THE PLANETARY ATLAS</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{registering ? "Start exploring." : "Welcome back."}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{registering ? "Create your account. Your email address will be your user ID." : "Sign in to your research workspace."}</p><form className="mt-7 grid gap-4" onSubmit={submit}>{registering && <label className="grid gap-2 text-sm font-medium">Name<input className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200" name="name" minLength={2} required /></label>}<label className="grid gap-2 text-sm font-medium">Email<input className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200" name="email" type="email" required /></label><label className="grid gap-2 text-sm font-medium">Password<input className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200" name="password" type="password" minLength={8} required /></label>{error && <p className="rounded-lg bg-rose-950 p-3 text-sm text-rose-200">{error}</p>}<button disabled={saving} className="rounded-lg bg-teal-200 p-3 font-semibold text-slate-950">{saving ? "Please wait…" : registering ? "Create account" : "Sign in"}</button></form><p className="mt-6 text-sm text-slate-400">{registering ? "Already have an account?" : "New here?"} <button className="text-teal-200 underline" onClick={() => setScreen(registering ? "login" : "register")}>{registering ? "Sign in" : "Create an account"}</button></p></section></main>;
}

const root = document.getElementById("root");
if (!root) throw new Error("The root element is missing.");
createRoot(root).render(<App />);
