import type { ComponentProps, ReactNode } from "react";

type SurfaceTone = "default" | "quiet" | "accent";

const surfaceToneClasses: Record<SurfaceTone, string> = {
  default: "border border-white/10 bg-white/[0.035]",
  quiet: "border border-white/10 bg-[#101b28]",
  accent: "border border-cyan-100/15 bg-cyan-200/5",
};

export function Surface({ children, className = "", tone = "default" }: { children: ReactNode; className?: string; tone?: SurfaceTone }) {
  return <article className={`rounded-2xl ${surfaceToneClasses[tone]} ${className}`}>{children}</article>;
}

export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`font-mono text-[10px] tracking-[0.18em] text-cyan-200 ${className}`}>{children}</p>;
}

export function DataValue({ label, value }: { label: string; value: string }) {
  return <span><span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</span><span className="mt-1 block text-sm text-slate-200">{value}</span></span>;
}

export function SecondaryAction({ className = "", ...props }: ComponentProps<"button">) {
  return <button className={`rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-200/50 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200 ${className}`} {...props} />;
}

export function PlannedAction({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <button type="button" disabled aria-disabled="true" className={`cursor-not-allowed rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-500 ${className}`}>{children}<span className="ml-2 font-mono text-[10px] tracking-[0.12em]">PLANNED</span></button>;
}
