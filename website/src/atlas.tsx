import { useCallback, useEffect, useRef, useState } from "react";
import { DataValue, PlannedAction, SectionLabel, Surface } from "./components/atlas-ui";

type User = { email: string; name: string };
type Planet = {
  name: string;
  host_star: string | null;
  radius_earth: number | null;
  mass_earth: number | null;
  orbital_period_days: number | null;
  equilibrium_temperature_kelvin: number | null;
  distance_parsecs: number | null;
  discovery_method: string | null;
  discovery_year: number | null;
};
type Page = { records: Planet[]; total: number; nextOffset: number | null };
type Sort = "name" | "distance" | "discovery" | "radius" | "temperature";
type Section = "atlas" | "explore" | "data" | "tools";
type Navigate = (path: string) => void;

const display = (value: number | null, suffix = "", digits = 1) =>
  value === null ? "—" : `${value.toLocaleString(undefined, { maximumFractionDigits: digits })}${suffix}`;

const navItems: { id: Section; label: string }[] = [
  { id: "atlas", label: "Atlas" },
  { id: "explore", label: "Explore" },
  { id: "data", label: "Data & methods" },
  { id: "tools", label: "Tools" },
];

const sectionForPath = (path: string): Section => path === "/explore" ? "explore" : path === "/data-methods" ? "data" : path === "/tools" ? "tools" : "atlas";
const pathForSection = (section: Section) => section === "atlas" ? "/atlas" : section === "data" ? "/data-methods" : `/${section}`;
const profileNameForPath = (path: string) => path.startsWith("/atlas/planet/") ? decodeURIComponent(path.slice("/atlas/planet/".length)) : null;

export function Atlas({ user, logout, path, navigate }: { user: User; logout: () => void; path: string; navigate: Navigate }) {
  const section = sectionForPath(path);
  const profileName = profileNameForPath(path);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071018] text-slate-100 selection:bg-cyan-200 selection:text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.12),transparent_24rem),radial-gradient(circle_at_85%_15%,rgba(45,212,191,0.08),transparent_26rem)]" />
      <Header active={section} navigate={navigate} user={user} logout={logout} />
      <div className="relative mx-auto w-full max-w-360 px-4 pb-16 sm:px-8 lg:px-12">
        {profileName ? <ProfileRoute name={profileName} navigate={navigate} /> : section === "atlas" && <AtlasHome path={path} navigate={navigate} setNotice={setNotice} />}
        {section === "explore" && <ExploreView setNotice={setNotice} />}
        {section === "data" && <DataView setNotice={setNotice} />}
        {section === "tools" && <ToolsView setNotice={setNotice} />}
      </div>
      {notice && <Notice message={notice} close={() => setNotice(null)} />}
    </main>
  );
}

function Header({ active, navigate, user, logout }: { active: Section; navigate: Navigate; user: User; logout: () => void }) {
  return (
    <header className="relative z-10 border-b border-white/10 bg-[#071018]/90 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-360 flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-8 lg:px-12">
        <button onClick={() => navigate("/atlas")} className="flex items-center gap-3 text-left">
          <span className="grid size-9 place-items-center rounded-full border border-cyan-200/50 bg-cyan-200/10 text-lg text-cyan-100">◌</span>
          <span><span className="block font-mono text-[10px] tracking-[0.24em] text-cyan-100">THE</span><span className="block text-sm font-semibold tracking-[0.16em]">PLANETARY ATLAS</span></span>
        </button>
        <nav aria-label="Workspace navigation" className="order-3 flex w-full gap-1 overflow-x-auto pb-1 text-sm sm:order-none sm:w-auto sm:pb-0">
          {navItems.map((item) => <button key={item.id} aria-current={active === item.id ? "page" : undefined} onClick={() => navigate(pathForSection(item.id))} className={`whitespace-nowrap rounded-full px-3 py-2 transition ${active === item.id ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/8 hover:text-white"}`}>{item.label}</button>)}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-right sm:block"><span className="block text-xs text-slate-300">{user.name}</span><span className="block font-mono text-[10px] text-slate-500">RESEARCHER</span></span>
          <button onClick={logout} className="rounded-full border border-white/15 px-3 py-2 font-mono text-[11px] text-slate-300 hover:border-cyan-200/60 hover:text-cyan-100">Sign out</button>
        </div>
      </div>
    </header>
  );
}

function AtlasHome({ path, navigate, setNotice }: { path: string; navigate: Navigate; setNotice: (message: string) => void }) {
  const mode = path === "/atlas/catalogue" ? "catalogue" : "briefing";
  return <>
    <section className="grid gap-8 py-10 lg:grid-cols-[1.25fr_.75fr] lg:py-16">
      <div>
        <p className="font-mono text-xs tracking-[0.18em] text-cyan-200">EXOPLANET RESEARCH WORKSPACE / V1.0</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">A calmer way to navigate <em className="font-serif font-normal text-cyan-100">other worlds.</em></h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">Start with a question, then move from the catalogue to methods, observations, and the tools that make a result defensible.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => navigate("/atlas/catalogue")} className="rounded-full bg-cyan-200 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-100">Search the catalogue <span aria-hidden="true">→</span></button>
          <button onClick={() => navigate("/data-methods")} className="rounded-full border border-white/15 px-5 py-3 text-sm text-slate-200 hover:border-cyan-200/60">Understand the data</button>
        </div>
      </div>
      <aside className="relative overflow-hidden rounded-3xl border border-cyan-100/20 bg-[#0b1a25] p-6 shadow-2xl shadow-cyan-950/20">
        <div className="absolute -right-15 -top-18 size-64 rounded-full border border-cyan-100/15" /><div className="absolute -right-6 -top-8 size-38 rounded-full border border-cyan-100/25 bg-cyan-200/8" />
        <p className="relative font-mono text-[10px] tracking-[0.18em] text-cyan-200">TODAY IN THE ATLAS</p>
        <p className="relative mt-6 text-5xl font-semibold tracking-tight">6,336</p><p className="relative mt-1 text-sm text-slate-400">confirmed planets in the current local catalogue</p>
        <div className="relative mt-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm"><Metric label="Primary source" value="NASA Archive" /><Metric label="Refresh" value="Daily" /><Metric label="Record type" value="Composite" /><Metric label="Visual status" value="Modelled" /></div>
      </aside>
    </section>
    <div className="flex gap-5 border-b border-white/10 text-sm"><Tab active={mode === "briefing"} onClick={() => navigate("/atlas")}>Research briefing</Tab><Tab active={mode === "catalogue"} onClick={() => navigate("/atlas/catalogue")}>Catalogue</Tab></div>
    {mode === "briefing" ? <Briefing navigate={navigate} setNotice={setNotice} /> : <Catalogue navigate={navigate} />}
  </>;
}

function Briefing({ navigate, setNotice }: { navigate: Navigate; setNotice: (message: string) => void }) {
  return <section className="grid gap-5 py-8 lg:grid-cols-12">
    <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 lg:col-span-7"><p className="font-mono text-[10px] tracking-[0.18em] text-cyan-200">A GOOD PLACE TO BEGIN</p><h2 className="mt-4 text-2xl font-medium">One atlas. A clear route to evidence.</h2><p className="mt-3 max-w-xl leading-7 text-slate-400">The catalogue is intentionally separate from the interpretive work. Search a world first; use the provenance, source coverage, and analysis tools only when your question calls for them.</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><FlowCard number="01" title="Find" text="Search planets, stars, methods, and measurements." onClick={() => navigate("/atlas/catalogue")} /><FlowCard number="02" title="Assess" text="Read values alongside their limits and provenance." onClick={() => navigate("/data-methods")} /><FlowCard number="03" title="Work" text="Build a query, plot a population, or prepare an export." onClick={() => navigate("/tools")} /></div></article>
    <article className="rounded-2xl border border-white/10 bg-[#101b28] p-6 lg:col-span-5"><div className="flex items-center justify-between"><p className="font-mono text-[10px] tracking-[0.18em] text-cyan-200">RECENTLY ADDED</p><span className="rounded-full bg-cyan-200/10 px-2 py-1 font-mono text-[10px] text-cyan-100">MOCK BRIEFING</span></div><div className="mt-5 space-y-4"><News title="Atmospheres are not appearances" text="How to read a derived visual without mistaking it for a photograph." /><News title="Source-aware comparison" text="Keep composite values and reference-consistent records distinct." /><News title="From discovery to follow-up" text="A lightweight route through TESS, JWST, and archive products." /></div><button onClick={() => navigate("/explore")} className="mt-6 text-sm text-cyan-100 hover:text-cyan-200">Open research explorations →</button></article>
  </section>;
}

function Catalogue({ navigate }: { navigate: Navigate }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("name");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [records, setRecords] = useState<Planet[]>([]);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);
  const request = useCallback(async (offset = 0) => {
    const params = new URLSearchParams({ query, sort, limit: "30", offset: String(offset) });
    const response = await fetch(`/api/planets?${params}`);
    if (!response.ok) throw new Error("Unable to load catalogue");
    return response.json() as Promise<Page>;
  }, [query, sort]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true); setError("");
      request().then((page) => { setRecords(page.records); setTotal(page.total); setNextOffset(page.nextOffset); })
        .catch(() => { setRecords([]); setTotal(0); setError("The catalogue is temporarily unavailable. Try again shortly."); })
        .finally(() => setLoading(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [request]);
  const more = useCallback(() => { if (nextOffset === null || loading || error) return; request(nextOffset).then((page) => { setRecords((current) => [...current, ...page.records]); setNextOffset(page.nextOffset); }).catch(() => setError("More records could not be loaded. Try changing the search.")); }, [error, nextOffset, loading, request]);
  useEffect(() => { const target = sentinel.current; if (!target) return; const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) more(); }, { rootMargin: "500px" }); observer.observe(target); return () => observer.disconnect(); }, [more]);
  return <section className="py-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><Eyebrow>CONFIRMED PLANETS</Eyebrow><h2 className="mt-2 text-2xl font-medium">Find a world, then follow the evidence.</h2></div><p className="font-mono text-xs text-slate-500">{loading ? "LOADING" : `${total.toLocaleString()} RECORDS`} / {records.length.toLocaleString()} LOADED</p></div><div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-3"><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#071018] px-4 py-4 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-200/60" placeholder="Search a planet, host star, or discovery method" /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="rounded-lg border border-white/10 bg-[#101b28] px-3 py-2 text-sm text-slate-200"><option value="name">Sort: name</option><option value="distance">Sort: distance</option><option value="discovery">Sort: discovery date</option><option value="radius">Sort: radius</option><option value="temperature">Sort: temperature</option></select><PlannedAction className="px-3 py-2">Advanced search</PlannedAction></div><div className="flex rounded-lg border border-white/10 p-1 text-xs"><button onClick={() => setView("cards")} className={`rounded px-3 py-2 ${view === "cards" ? "bg-cyan-200 text-slate-950" : "text-slate-400"}`}>Cards</button><button onClick={() => setView("table")} className={`rounded px-3 py-2 ${view === "table" ? "bg-cyan-200 text-slate-950" : "text-slate-400"}`}>Table</button></div></div></div>{error ? <p role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-950/40 p-4 text-sm text-rose-100">{error}</p> : records.length === 0 && !loading ? <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm text-slate-400">No confirmed planets match this search. Try a planet name, host star, or discovery method.</p> : view === "cards" ? <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{records.map((planet) => <PlanetCard key={planet.name} planet={planet} select={() => navigate(`/atlas/planet/${encodeURIComponent(planet.name)}`)} />)}</div> : <PlanetTable records={records} select={(planet) => navigate(`/atlas/planet/${encodeURIComponent(planet.name)}`)} />}<div ref={sentinel} className="grid h-24 place-items-center font-mono text-xs text-slate-500">{loading ? "LOADING RECORDS" : nextOffset === null && records.length > 0 ? "END OF CATALOGUE" : error ? "CATALOGUE LOAD PAUSED" : "LOADING MORE RECORDS"}</div></section>;
}

function ProfileRoute({ name, navigate }: { name: string; navigate: Navigate }) {
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  useEffect(() => {
    setState("loading");
    fetch(`/api/planets?${new URLSearchParams({ query: name, sort: "name", limit: "30", offset: "0" })}`)
      .then(async (response) => { if (!response.ok) throw new Error("Unable to load planet profile"); return response.json() as Promise<Page>; })
      .then((page) => { const match = page.records.find((record) => record.name === name); if (!match) throw new Error("Planet not found"); setPlanet(match); setState("ready"); })
      .catch(() => setState("error"));
  }, [name]);
  if (state === "loading") return <section className="grid min-h-96 place-items-center py-10"><p className="font-mono text-xs tracking-[0.16em] text-cyan-100">LOADING PLANET PROFILE</p></section>;
  if (state === "error" || !planet) return <section className="py-10"><Eyebrow>PROFILE UNAVAILABLE</Eyebrow><h1 className="mt-3 text-3xl font-medium">We could not find that planet.</h1><p className="mt-3 text-slate-400">The requested catalogue record may have changed since this link was created.</p><button onClick={() => navigate("/atlas/catalogue")} className="mt-6 rounded-full border border-cyan-200/40 px-5 py-3 text-sm text-cyan-100">Return to catalogue</button></section>;
  return <section className="py-10"><button onClick={() => navigate("/atlas/catalogue")} className="mb-6 font-mono text-xs text-cyan-100">← Back to catalogue</button><PlanetProfile planet={planet} /></section>;
}

function ExploreView({ setNotice }: { setNotice: (message: string) => void }) {
  const [metric, setMetric] = useState("Radius × orbit");
  return <section className="py-10"><Eyebrow>EXPLORE / POPULATION CONTEXT</Eyebrow><h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Ask the catalogue a visual question.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-400">Explorations give a population-level starting point. They are deliberately separate from individual planet profiles and preserve the route back to the underlying records.</p><div className="mt-8 grid gap-5 xl:grid-cols-[1fr_19rem]"><article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-medium">Discovery landscape</h2><p className="mt-1 text-sm text-slate-500">Interactive preview / representative marks</p></div><div className="flex gap-1 rounded-lg border border-white/10 p-1">{["Radius × orbit", "Distance × year", "Temperature × radius"].map((item) => <button key={item} onClick={() => setMetric(item)} className={`rounded px-3 py-2 text-xs ${metric === item ? "bg-cyan-200 text-slate-950" : "text-slate-400"}`}>{item}</button>)}</div></div><div className="relative mt-8 h-80 overflow-hidden rounded-xl border border-white/10 bg-[#071018] p-5"><div className="absolute inset-x-5 top-1/4 border-t border-dashed border-white/10" /><div className="absolute inset-x-5 top-1/2 border-t border-dashed border-white/10" /><div className="absolute inset-x-5 top-3/4 border-t border-dashed border-white/10" /><div className="absolute bottom-5 left-1/4 top-5 border-l border-dashed border-white/10" /><div className="absolute bottom-5 left-1/2 top-5 border-l border-dashed border-white/10" /><div className="absolute bottom-5 left-3/4 top-5 border-l border-dashed border-white/10" /><div className="absolute left-[12%] top-[70%] size-3 rounded-full bg-cyan-200 shadow-[0_0_20px_rgba(103,232,249,.8)]" /><div className="absolute left-[28%] top-[52%] size-2 rounded-full bg-teal-300" /><div className="absolute left-[40%] top-[64%] size-4 rounded-full bg-sky-300" /><div className="absolute left-[52%] top-[32%] size-3 rounded-full bg-cyan-100" /><div className="absolute left-[67%] top-[46%] size-2 rounded-full bg-teal-200" /><div className="absolute left-[77%] top-[22%] size-4 rounded-full border border-cyan-100 bg-cyan-200/30" /><div className="absolute left-[84%] top-[58%] size-2 rounded-full bg-sky-200" /><span className="absolute bottom-4 left-5 font-mono text-[10px] text-slate-500">SHORTER ORBIT</span><span className="absolute bottom-4 right-5 font-mono text-[10px] text-slate-500">LONGER ORBIT</span><span className="absolute left-5 top-4 font-mono text-[10px] text-slate-500">{metric.toUpperCase()}</span></div></article><aside className="rounded-2xl border border-white/10 bg-[#101b28] p-6"><Eyebrow>MAKE THIS USEFUL</Eyebrow><div className="mt-5 space-y-5"><Option title="Constrain the sample" text="Choose discovery method, catalogue date, or measurement completeness." /><Option title="Inspect a region" text="Select points to open a comparison tray with source links." /><Option title="Carry it forward" text="Save the selection to a query or export it for analysis." /></div><button onClick={() => setNotice("Saved explorations are the next interaction to wire up.")} className="mt-8 w-full rounded-lg border border-cyan-200/40 py-3 text-sm text-cyan-100 hover:bg-cyan-200/10">Save this exploration</button></aside></div><div className="mt-5 grid gap-5 md:grid-cols-3"><Insight value="75%" label="of local records have a reported radius" /><Insight value="Transit" label="dominates the present discovery sample" /><Insight value="Source aware" label="each future mark will preserve its origin" /></div></section>;
}

function DataView({ setNotice }: { setNotice: (message: string) => void }) {
  return <section className="py-10"><Eyebrow>DATA & METHODS / PROVENANCE FIRST</Eyebrow><h1 className="mt-3 max-w-4xl text-4xl font-medium tracking-tight sm:text-5xl">The record is not the observation.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-400">This workspace should make it easy to distinguish direct measurements, catalogue values, calculated fields, and illustrative modelling assumptions.</p><div className="mt-8 grid gap-5 lg:grid-cols-3"><SourceCard badge="CONNECTED" title="NASA Exoplanet Archive" text="Confirmed planets, composite parameters, discovery records, stellar properties." action="Browse fields" onClick={() => setNotice("Field-level provenance will open here.")} /><SourceCard badge="PLANNED" title="JWST archive products" text="Spectroscopy and observation context, brought in only when a target requires it." action="View integration plan" onClick={() => setNotice("JWST source integration is a planned connection.")} /><SourceCard badge="PLANNED" title="TESS & follow-up" text="Candidate, ephemeris, and follow-up context kept distinct from confirmed worlds." action="View integration plan" onClick={() => setNotice("TESS follow-up is a planned connection.")} /></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><article className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"><Eyebrow>HOW TO READ A PLANET PROFILE</Eyebrow><div className="mt-5 divide-y divide-white/10"><MethodRow label="Observed / reported" text="Values reported by a source, with uncertainty and citation where available." /><MethodRow label="Catalogue composite" text="Best available values may originate in different publications; useful for discovery and population work." /><MethodRow label="Calculated" text="Quantities derived from reported values must identify the calculation and inputs." /><MethodRow label="Modelled appearance" text="A scientific illustration constrained by known data, never an observed photograph." /></div></article><article className="rounded-2xl border border-cyan-100/15 bg-cyan-200/5 p-6"><Eyebrow>VISUALIZATION STANDARD</Eyebrow><h2 className="mt-4 text-xl font-medium">Human-led, data-constrained, plainly labelled.</h2><p className="mt-3 leading-7 text-slate-300">A future planet rendering will state exactly what was measured, what was inferred, and what is unknown. AI can assist production, but it cannot turn missing observations into evidence.</p><button onClick={() => setNotice("The local planet-specifications.md is the rendering handoff document.")} className="mt-6 text-sm text-cyan-100 hover:text-cyan-200">Open visual model specification →</button></article></div></section>;
}

function ToolsView({ setNotice }: { setNotice: (message: string) => void }) {
  return <section className="py-10"><Eyebrow>TOOLS & SERVICES / WORK WITH DATA</Eyebrow><h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Leave the browser with a better question.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-400">A focused toolkit for exploration, reproducible selection, and handoff—without turning the home page into a control panel.</p><div className="mt-8 grid gap-5 md:grid-cols-2"><ToolCard number="01" title="Query builder" text="Compose a filter across planet, host, discovery, and completeness fields." action="Start a query" onClick={() => setNotice("Query builder is a polished mock screen for now.")} /><ToolCard number="02" title="Population plotter" text="Choose axes, filter a sample, and retain every selection in the result." action="Open plotter" onClick={() => setNotice("The population plotter will be connected to the catalogue next.")} /><ToolCard number="03" title="Target briefing" text="Collect a readable planet profile, evidence trail, and visualization constraints." action="Create briefing" onClick={() => setNotice("Target briefings are planned for the next build.")} /><ToolCard number="04" title="Exports & API" text="Move a reproducible result into a notebook or external workflow." action="Review formats" onClick={() => setNotice("Exports and API tokens are not enabled in this mock workspace.")} /></div><article className="mt-5 flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-[#101b28] p-6 sm:flex-row sm:items-center"><div><Eyebrow>WORKSPACE PRINCIPLE</Eyebrow><p className="mt-3 text-lg">Every tool begins with a human-readable question and ends with a traceable result.</p></div><button onClick={() => setNotice("Workspace history is the next planned service.")} className="rounded-full border border-white/15 px-5 py-3 text-sm text-slate-200 hover:border-cyan-200/60">View workspace history</button></article></section>;
}

function PlanetCard({ planet, select }: { planet: Planet; select: () => void }) { return <button onClick={select} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-cyan-100/[0.06]"><div className="flex items-start justify-between gap-4"><span className="font-mono text-[10px] tracking-[0.12em] text-cyan-200">{planet.discovery_method ?? "METHOD UNKNOWN"}</span><span className="text-slate-500 transition group-hover:text-cyan-100">↗</span></div><h3 className="mt-8 text-lg font-medium">{planet.name}</h3><p className="mt-1 text-sm text-slate-500">{planet.host_star ?? "Host star not recorded"}</p><div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4"><Metric label="Radius" value={display(planet.radius_earth, " R⊕")} /><Metric label="Distance" value={display(planet.distance_parsecs, " pc")} /></div></button>; }
function PlanetTable({ records, select }: { records: Planet[]; select: (planet: Planet) => void }) { return <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-210 text-left text-sm"><thead className="bg-white/[0.035] font-mono text-[10px] tracking-[0.12em] text-slate-500"><tr><th className="p-4 font-normal">PLANET</th><th className="p-4 font-normal">HOST STAR</th><th className="p-4 font-normal">RADIUS</th><th className="p-4 font-normal">DISTANCE</th><th className="p-4 font-normal">METHOD</th></tr></thead><tbody>{records.map((planet) => <tr key={planet.name} onClick={() => select(planet)} className="cursor-pointer border-t border-white/8 transition hover:bg-cyan-100/[0.06]"><td className="p-4 font-medium">{planet.name}</td><td className="p-4 text-slate-400">{planet.host_star ?? "—"}</td><td className="p-4">{display(planet.radius_earth, " R⊕")}</td><td className="p-4">{display(planet.distance_parsecs, " pc")}</td><td className="p-4 text-slate-400">{planet.discovery_method ?? "—"}</td></tr>)}</tbody></table></div>; }
function PlanetProfile({ planet }: { planet: Planet }) {
  const keplerFamily = /^(Kepler|K2)-/i.test(planet.name);
  return <article className="w-full rounded-3xl border border-cyan-100/30 bg-[#101b28] p-6 shadow-2xl"><Eyebrow>{keplerFamily ? "TARGET & MISSION CONTEXT / KEPLER-K2" : "PLANET PROFILE / CATALOGUE VIEW"}</Eyebrow><h1 className="mt-3 text-3xl font-medium">{planet.name}</h1><p className="mt-1 text-slate-400">Host star: {planet.host_star ?? "not recorded"}</p><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"><ValueBlock label="Radius" value={display(planet.radius_earth, " R⊕")} /><ValueBlock label="Mass" value={display(planet.mass_earth, " M⊕")} /><ValueBlock label="Equilibrium" value={display(planet.equilibrium_temperature_kelvin, " K", 0)} /><ValueBlock label="Orbit" value={display(planet.orbital_period_days, " d")} /></div>{keplerFamily ? <MissionContext planet={planet} /> : <div className="mt-6 rounded-xl border border-cyan-100/15 bg-cyan-200/5 p-4"><p className="font-mono text-[10px] tracking-[0.14em] text-cyan-200">WHAT THIS MEANS</p><p className="mt-2 text-sm leading-6 text-slate-300">This is the first layer: catalogue values for orientation. A future detail view will add citations, uncertainties, source-specific measurements, and explicitly-labelled visualization constraints.</p></div>}</article>;
}
function PlanetSheet({ planet, close }: { planet: Planet; close: () => void }) {
  const keplerFamily = /^(Kepler|K2)-/i.test(planet.name);
  return <div className="fixed inset-0 z-30 overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"><article className="mx-auto my-6 w-full max-w-3xl rounded-3xl border border-cyan-100/30 bg-[#101b28] p-6 shadow-2xl"><button onClick={close} className="float-right rounded-full border border-white/10 px-3 py-1 text-sm text-slate-400 hover:text-white">Close</button><Eyebrow>{keplerFamily ? "TARGET & MISSION CONTEXT / KEPLER-K2" : "PLANET PROFILE / CATALOGUE VIEW"}</Eyebrow><h2 className="mt-3 text-3xl font-medium">{planet.name}</h2><p className="mt-1 text-slate-400">Host star: {planet.host_star ?? "not recorded"}</p><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"><ValueBlock label="Radius" value={display(planet.radius_earth, " R⊕")} /><ValueBlock label="Mass" value={display(planet.mass_earth, " M⊕")} /><ValueBlock label="Equilibrium" value={display(planet.equilibrium_temperature_kelvin, " K", 0)} /><ValueBlock label="Orbit" value={display(planet.orbital_period_days, " d")} /></div>{keplerFamily ? <MissionContext planet={planet} /> : <div className="mt-6 rounded-xl border border-cyan-100/15 bg-cyan-200/5 p-4"><p className="font-mono text-[10px] tracking-[0.14em] text-cyan-200">WHAT THIS MEANS</p><p className="mt-2 text-sm leading-6 text-slate-300">This is the first layer: catalogue values for orientation. A future detail view will add citations, uncertainties, source-specific measurements, and explicitly-labelled visualization constraints.</p></div>}</article></div>;
}
function MissionContext({ planet }: { planet: Planet }) { return <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_.95fr]"><div className="overflow-hidden rounded-2xl border border-cyan-100/20 bg-[#071018]"><div className="relative h-42 overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_72%_38%,rgba(253,224,71,.95),rgba(253,224,71,.15)_4%,transparent_5%),radial-gradient(circle_at_35%_75%,rgba(8,145,178,.8),rgba(8,145,178,.12)_18%,transparent_20%),linear-gradient(135deg,#081624,#172c3c)]"><div className="absolute -right-10 -top-20 size-72 rounded-full border border-cyan-100/15" /><div className="absolute -right-3 -top-5 size-44 rounded-full border border-cyan-100/20" /><p className="absolute bottom-4 left-5 max-w-64 font-mono text-[10px] leading-4 tracking-[0.12em] text-cyan-50">CONCEPT PREVIEW / NOT OBSERVED IMAGERY</p></div><div className="p-5"><p className="font-mono text-[10px] tracking-[0.16em] text-cyan-200">KEPLER / K2 MISSION</p><h3 className="mt-2 text-lg font-medium">From target to evidence trail.</h3><p className="mt-2 text-sm leading-6 text-slate-400">This target belongs in a mission-aware view: what Kepler measured, which archive products exist, and where NASA has published a specific artist concept.</p></div></div><div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="font-mono text-[10px] tracking-[0.16em] text-cyan-200">DRILL DOWN</p><div className="mt-4 space-y-3"><a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm hover:border-cyan-200/50">NASA Archive target products <span className="text-cyan-100">↗</span></a><a href="https://science.nasa.gov/mission/kepler/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm hover:border-cyan-200/50">Kepler & K2 mission context <span className="text-cyan-100">↗</span></a><a href="https://science.nasa.gov/photojournal/keplers-planetary-systems-in-motion-artist-concept/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm hover:border-cyan-200/50">NASA artist concepts & media <span className="text-cyan-100">↗</span></a></div></div><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 lg:col-span-2"><p className="font-mono text-[10px] tracking-[0.16em] text-cyan-200">PROFILE ROADMAP</p><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><p className="font-medium">1. Catalogue</p><p className="mt-1 leading-5 text-slate-500">Core parameters and discovery record.</p></div><div><p className="font-medium">2. Evidence</p><p className="mt-1 leading-5 text-slate-500">Light curves, publications, source values, and uncertainty.</p></div><div><p className="font-medium">3. Interpretation</p><p className="mt-1 leading-5 text-slate-500">Mission concepts and a clearly labelled visual model.</p></div></div></div></section>; }
function Metric({ label, value }: { label: string; value: string }) { return <DataValue label={label} value={value} />; }
function ValueBlock({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#071018] p-4"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-2 font-medium text-cyan-100">{value}</p></div>; }
function Eyebrow({ children }: { children: string }) { return <SectionLabel>{children}</SectionLabel>; }
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) { return <button onClick={onClick} className={`border-b-2 px-1 pb-3 transition ${active ? "border-cyan-200 text-cyan-100" : "border-transparent text-slate-500 hover:text-slate-200"}`}>{children}</button>; }
function FlowCard({ number, title, text, onClick }: { number: string; title: string; text: string; onClick: () => void }) { return <button onClick={onClick} className="rounded-xl border border-white/10 p-4 text-left hover:border-cyan-200/40 hover:bg-cyan-200/5"><span className="font-mono text-[10px] text-cyan-200">{number}</span><p className="mt-4 font-medium">{title}</p><p className="mt-1 text-sm leading-5 text-slate-500">{text}</p></button>; }
function News({ title, text }: { title: string; text: string }) { return <div><p className="text-sm font-medium text-slate-200">{title}</p><p className="mt-1 text-sm leading-5 text-slate-500">{text}</p></div>; }
function Option({ title, text }: { title: string; text: string }) { return <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-sm leading-5 text-slate-500">{text}</p></div>; }
function Insight({ value, label }: { value: string; label: string }) { return <Surface className="rounded-xl bg-white/[0.025] p-5"><p className="text-2xl font-medium text-cyan-100">{value}</p><p className="mt-2 text-sm leading-5 text-slate-500">{label}</p></Surface>; }
function SourceCard({ badge, title, text, action }: { badge: string; title: string; text: string; action: string; onClick?: () => void }) { return <Surface className="p-6"><span className={`rounded-full px-2 py-1 font-mono text-[10px] ${badge === "CONNECTED" ? "bg-cyan-200/15 text-cyan-100" : "bg-white/8 text-slate-400"}`}>{badge}</span><h2 className="mt-6 text-xl font-medium">{title}</h2><p className="mt-3 min-h-18 text-sm leading-6 text-slate-400">{text}</p>{badge === "CONNECTED" ? <a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm text-cyan-100 hover:text-cyan-200">{action} ↗</a> : <PlannedAction className="mt-6">{action}</PlannedAction>}</Surface>; }
function MethodRow({ label, text }: { label: string; text: string }) { return <div className="grid gap-2 py-4 sm:grid-cols-[11rem_1fr]"><p className="text-sm font-medium text-slate-200">{label}</p><p className="text-sm leading-6 text-slate-500">{text}</p></div>; }
function ToolCard({ number, title, text, action }: { number: string; title: string; text: string; action: string; onClick?: () => void }) { return <Surface className="p-6"><span className="font-mono text-[10px] tracking-[0.16em] text-cyan-200">{number}</span><h2 className="mt-7 text-xl font-medium">{title}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{text}</p><PlannedAction className="mt-8">{action}</PlannedAction></Surface>; }
function Notice({ message, close }: { message: string; close: () => void }) { return <div className="fixed bottom-5 left-1/2 z-40 flex w-[min(100%-2rem,34rem)] -translate-x-1/2 items-center justify-between gap-4 rounded-xl border border-cyan-100/25 bg-[#101b28] p-4 shadow-2xl"><p className="text-sm text-slate-200">{message}</p><button onClick={close} className="text-sm text-cyan-100">Dismiss</button></div>; }
