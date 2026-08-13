import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Atlas } from "./atlas";

type User = { email: string; name: string };
type AuthResponse = { user: User | null };
type Planet = {
  name: string;
  star: string;
  score: number;
  method: string;
  distance: number;
  habitable: boolean;
  year: number;
  radius: number;
  period: number;
};

const planets: Planet[] = [
  {
    name: "Kepler-442 b",
    star: "Kepler-442",
    score: 84,
    method: "Transit",
    distance: 1190,
    habitable: true,
    year: 2015,
    radius: 1.34,
    period: 112.3,
  },
  {
    name: "TOI-700 d",
    star: "TOI-700",
    score: 79,
    method: "Transit",
    distance: 101,
    habitable: true,
    year: 2020,
    radius: 1.19,
    period: 37.4,
  },
  {
    name: "TRAPPIST-1 e",
    star: "TRAPPIST-1",
    score: 86,
    method: "Transit",
    distance: 40,
    habitable: true,
    year: 2017,
    radius: 0.92,
    period: 6.1,
  },
  {
    name: "LHS 1140 b",
    star: "LHS 1140",
    score: 72,
    method: "Transit",
    distance: 49,
    habitable: true,
    year: 2017,
    radius: 1.73,
    period: 24.7,
  },
  {
    name: "K2-18 b",
    star: "K2-18",
    score: 65,
    method: "Transit",
    distance: 124,
    habitable: false,
    year: 2015,
    radius: 2.61,
    period: 32.9,
  },
  {
    name: "Proxima Centauri b",
    star: "Proxima Centauri",
    score: 68,
    method: "Radial velocity",
    distance: 4.2,
    habitable: true,
    year: 2016,
    radius: 1.07,
    period: 11.2,
  },
  {
    name: "Kepler-186 f",
    star: "Kepler-186",
    score: 77,
    method: "Transit",
    distance: 582,
    habitable: true,
    year: 2014,
    radius: 1.11,
    period: 129.9,
  },
  {
    name: "Ross 128 b",
    star: "Ross 128",
    score: 74,
    method: "Radial velocity",
    distance: 11,
    habitable: true,
    year: 2017,
    radius: 1.35,
    period: 9.9,
  },
];

async function api(
  path: string,
  options: RequestInit = {},
): Promise<AuthResponse> {
  const response = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
const Brand = () => (
  <a
    href="#top"
    className="flex items-center gap-2 font-mono text-xs font-bold tracking-[.18em] text-slate-100"
  >
    <span className="text-3xl leading-none text-teal-200 drop-shadow-[0_0_9px_#7ee9d7]">
      ◌
    </span>
    THE PLANETARY ATLAS
  </a>
);

function Landing({
  openAuth,
}: {
  openAuth: (mode: "register" | "login") => void;
}) {
  return (
    <div
      id="top"
      className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_78%_25%,#334e69_0%,#132036_35%,#080d18_72%)] text-slate-100"
    >
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(#c9d9dc_1px,transparent_1px),radial-gradient(#8eb1c7_1px,transparent_1px)] [background-position:20px_20px,70px_100px] [background-size:120px_120px,173px_173px]" />
      <header className="relative mx-auto flex h-22 w-[min(100%-3rem,78rem)] items-center justify-between">
        <Brand />
        <nav className="hidden gap-8 text-xs text-slate-400 sm:flex">
          <a href="#atlas">Atlas</a>
          <a href="#mission">Mission</a>
          <a href="#data">Data</a>
        </nav>
        <div className="flex items-center gap-4">
          <button
            className="font-mono text-xs text-slate-300"
            onClick={() => openAuth("login")}
          >
            Sign in
          </button>
          <button
            className="rounded-md border border-teal-100 bg-teal-200 px-4 py-3 font-mono text-[.68rem] font-semibold text-slate-950 shadow-[0_0_24px_#83d5c328]"
            onClick={() => openAuth("register")}
          >
            Join the atlas <span className="ml-2">→</span>
          </button>
        </div>
      </header>
      <main className="relative mx-auto grid min-h-[calc(100vh-5.5rem)] w-[min(100%-3rem,78rem)] items-center lg:grid-cols-2">
        <section className="py-16 lg:py-0">
          <p className="mb-4 font-mono text-[.68rem] tracking-[.17em] text-teal-200">
            THE EXOPLANET ATLAS / EST. 2026
          </p>
          <h1 className="font-serif text-6xl leading-[.88] tracking-[-.07em] text-stone-100 sm:text-7xl lg:text-8xl">
            Evidence for
            <br />
            <i className="font-normal text-teal-200">worlds</i> beyond ours.
          </h1>
          <p className="mt-7 max-w-md leading-7 text-slate-300">
            A focused research interface for examining the measured properties,
            orbits, and discovery records of confirmed exoplanets.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <button
              className="rounded-md bg-teal-200 px-5 py-3 font-mono text-xs font-semibold text-slate-950"
              onClick={() => openAuth("register")}
            >
              Open the catalogue <span className="ml-2">→</span>
            </button>
            <a href="#atlas" className="font-mono text-xs text-slate-300">
              Explore the dataset <span className="ml-2 text-teal-200">↓</span>
            </a>
          </div>
          <div className="mt-15 flex gap-6 font-mono text-[.58rem] uppercase text-slate-400 sm:gap-9">
            <span>
              <b className="mb-1 block font-sans text-sm font-medium normal-case text-slate-100">
                6,000+
              </b>
              confirmed worlds
            </span>
            <span>
              <b className="mb-1 block font-sans text-sm font-medium normal-case text-slate-100">
                4,500
              </b>
              star systems
            </span>
            <span className="hidden sm:block">
              <b className="mb-1 block font-sans text-sm font-medium normal-case text-slate-100">
                32
              </b>
              years of discovery
            </span>
          </div>
        </section>
        <section className="relative h-80 lg:h-[36rem]">
          <div className="absolute left-[57%] top-[17%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_36%_34%,#fff6bd,#f9bc71_24%,#df644e_67%,#80334a)] shadow-[0_0_30px_#ffc17680,0_0_90px_#ff8a4b50]" />
          <div className="absolute left-[7%] top-[11%] h-72 w-[37rem] rotate-[-25deg] rounded-[50%] border border-teal-100/30" />
          <div className="absolute left-[22%] top-[31%] h-44 w-96 rotate-[22deg] rounded-[50%] border border-sky-100/20" />
          <div className="absolute left-[35%] top-[47%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_30%_25%,#f2e6b8_0_3%,#a6bfad_8%,#315d6c_27%,#142b48_62%,#071328)] shadow-[inset_-28px_-20px_36px_#030b1c99,0_0_50px_#76c8d344]" />
          <p className="absolute bottom-[5%] left-[36%] font-mono text-xs text-slate-100">
            TOI-700 d{" "}
            <span className="mt-1 block text-[.6rem] text-slate-400">
              101 light years away
            </span>
          </p>
        </section>
      </main>
      <section
        id="atlas"
        className="relative mx-auto w-[min(100%-3rem,78rem)] border-t border-slate-200/15 py-16"
      >
        <p className="font-mono text-[.68rem] tracking-[.17em] text-teal-200">
          A QUIET VIEW OF THE COSMOS
        </p>
        <h2 className="mt-2 font-serif text-4xl tracking-[-.05em] text-stone-100">
          One atlas. <i className="font-normal text-teal-200">Every</i>{" "}
          discovery.
        </h2>
        <p className="mt-4 max-w-lg text-slate-400">
          Search and compare the worlds that are reshaping our idea of home.
        </p>
      </section>
    </div>
  );
}

function Dashboard({ user, logout }: { user: User; logout: () => void }) {
  const [query, setQuery] = useState("");
  const [habitable, setHabitable] = useState(false);
  const [selected, setSelected] = useState<Planet | null>(null);
  const visible = useMemo(
    () =>
      planets.filter(
        (planet) =>
          `${planet.name} ${planet.star}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (!habitable || planet.habitable),
      ),
    [query, habitable],
  );
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_50%_-20%,#1a3452_0%,#0d172a_47%,#080d18_100%)] text-slate-100">
      <header className="mx-auto flex h-20 w-[min(100%-2rem,78rem)] items-center justify-between border-b border-slate-200/10">
        <Brand />
        <div className="flex items-center gap-4">
          <button className="font-mono text-xs text-slate-400">EN ⌄</button>
          <button
            title="Sign out"
            onClick={logout}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-600 font-mono text-xs"
          >
            {user.name[0]?.toUpperCase()}
          </button>
        </div>
      </header>
      <main className="mx-auto w-[min(100%-2rem,78rem)]">
        <section className="py-16">
          <p className="font-mono text-[.68rem] tracking-[.17em] text-teal-200">
            EXOPLANET ATLAS / 06,000 WORLDS
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[.9] tracking-[-.07em] sm:text-7xl">
            Find a world
            <br />
            <i className="font-normal text-teal-200">worth knowing.</i>
          </h1>
          <p className="mt-5 max-w-sm text-slate-400">
            A living catalogue for surveying the planets beyond our solar
            system.
          </p>
        </section>
        <section className="grid gap-2 rounded-xl border border-slate-200/15 bg-slate-900/80 p-3 backdrop-blur lg:grid-cols-[1.5fr_1fr]">
          <label className="flex items-center gap-3 rounded-lg bg-slate-950 px-4 text-slate-400">
            <span className="text-xl">⌕</span>
            <input
              className="w-full bg-transparent py-4 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search planet or star system"
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setHabitable(!habitable)}
              className={`rounded-lg border px-4 font-mono text-[.65rem] ${habitable ? "border-teal-300/60 bg-teal-300/10 text-teal-100" : "border-slate-600 bg-slate-800 text-slate-300"}`}
            >
              ● Habitability {habitable ? "On" : "Any"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-600 px-3 font-mono text-[.65rem] text-teal-200"
            >
              Advanced search
            </button>
            <button
              onClick={() => {
                setQuery("");
                setHabitable(false);
              }}
              className="rounded-lg px-3 font-mono text-[.65rem] text-slate-400"
            >
              Reset
            </button>
          </div>
        </section>
        <section className="py-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-mono text-[.68rem] tracking-[.17em] text-teal-200">
                DISCOVERIES
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {visible.length.toLocaleString()} worlds in view
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Earth similarity ↕
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((planet) => (
              <article
                key={planet.name}
                className={`overflow-hidden rounded-xl border bg-slate-900/70 transition hover:-translate-y-1 hover:border-teal-200/50 ${selected?.name === planet.name ? "border-teal-200/70 sm:col-span-2" : "border-slate-700"}`}
              >
                <button
                  onClick={() =>
                    setSelected(selected?.name === planet.name ? null : planet)
                  }
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#e7fff8,#60b7b3_26%,#1b3657_67%)] text-xl">
                      ◌
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 font-mono text-[.55rem] ${planet.habitable ? "border-teal-300/50 text-teal-200" : "border-slate-600 text-slate-400"}`}
                    >
                      {planet.habitable
                        ? "Potentially habitable"
                        : "Confirmed planet"}
                    </span>
                  </div>
                  <h3 className="mt-7 text-base font-semibold">
                    {planet.name}
                  </h3>
                  <p className="mt-1 font-mono text-[.65rem] text-slate-400">
                    {planet.star}
                  </p>
                  <div className="mt-5 flex gap-6 border-t border-slate-700 pt-4">
                    <div>
                      <strong className="block text-sm">
                        {planet.score}
                        <small className="text-teal-200">%</small>
                      </strong>
                      <span className="font-mono text-[.55rem] uppercase text-slate-500">
                        Earth similarity
                      </span>
                    </div>
                    <div>
                      <strong className="block text-sm">{planet.method}</strong>
                      <span className="font-mono text-[.55rem] uppercase text-slate-500">
                        Discovery method
                      </span>
                    </div>
                  </div>
                  <span className="mt-5 block font-mono text-[.65rem] text-teal-200">
                    {selected?.name === planet.name
                      ? "Close details"
                      : "View details"}{" "}
                    →
                  </span>
                </button>
                {selected?.name === planet.name && (
                  <div className="border-t border-slate-700 p-5">
                    <div className="flex justify-between font-mono text-[.63rem] text-slate-400">
                      <span>
                        ORBITAL PROFILE
                        <br />
                        <b className="font-sans text-sm text-slate-100">
                          {planet.period} day year
                        </b>
                      </span>
                      <span>
                        DISTANCE
                        <br />
                        <b className="font-sans text-sm text-slate-100">
                          {planet.distance} ly
                        </b>
                      </span>
                    </div>
                    <svg className="my-4 h-24 w-full" viewBox="0 0 280 100">
                      <path
                        d="M8 76 C50 70 55 20 102 48 S165 92 205 43 S248 35 273 13"
                        fill="none"
                        stroke="#82ddd0"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 88H273"
                        stroke="#334155"
                        strokeDasharray="4 5"
                      />
                      <circle cx="102" cy="48" r="4" fill="#82ddd0" />
                      <circle cx="205" cy="43" r="4" fill="#82ddd0" />
                    </svg>
                    <div className="flex flex-wrap gap-6 font-mono text-[.6rem] text-slate-400">
                      <span>
                        Radius{" "}
                        <b className="text-slate-100">{planet.radius} R⊕</b>
                      </span>
                      <span>
                        Found <b className="text-slate-100">{planet.year}</b>
                      </span>
                      <span>
                        System <b className="text-slate-100">{planet.star}</b>
                      </span>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<"landing" | "register" | "login">(
    "landing",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api("/api/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null));
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await api(`/api/auth/${screen}`, {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget)),
        ),
      });
      setUser(data.user);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };
  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    setScreen("landing");
  };
  if (user) return <Atlas user={user} logout={logout} />;
  if (screen === "landing") return <Landing openAuth={setScreen} />;
  const registering = screen === "register";
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_80%_10%,#1c2d61_0%,transparent_40rem),#070b1a] p-6 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/90 p-9 shadow-2xl">
        <button
          className="mb-6 font-mono text-xs text-teal-200"
          onClick={() => setScreen("landing")}
        >
          ← Back
        </button>
        <p className="font-mono text-[.68rem] tracking-[.17em] text-teal-200">
          PLANETS
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {registering ? "Start exploring." : "Welcome back."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {registering
            ? "Create your account. Your email address will be your user ID."
            : "Sign in to your planet dashboard."}
        </p>
        <form className="mt-7 grid gap-4" onSubmit={submit}>
          {registering && (
            <label className="grid gap-2 text-sm font-medium">
              Name
              <input
                className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200"
                name="name"
                minLength={2}
                required
              />
            </label>
          )}
          <label className="grid gap-2 text-sm font-medium">
            Email{" "}
            <input
              className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200"
              name="email"
              type="email"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password{" "}
            <input
              className="rounded-lg border border-slate-600 bg-slate-950 p-3 outline-none focus:border-teal-200"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </label>
          {error && (
            <p className="rounded-lg bg-rose-950 p-3 text-sm text-rose-200">
              {error}
            </p>
          )}
          <button
            disabled={saving}
            className="rounded-lg bg-teal-200 p-3 font-semibold text-slate-950"
          >
            {saving
              ? "Please wait…"
              : registering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          {registering ? "Already have an account?" : "New here?"}{" "}
          <button
            className="text-teal-200 underline"
            onClick={() => setScreen(registering ? "login" : "register")}
          >
            {registering ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}
const root = document.getElementById("root");
if (!root) throw new Error("The root element is missing.");
createRoot(root).render(<App />);
