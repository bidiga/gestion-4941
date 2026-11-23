import { X, Loader2, Inbox } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { cn } from "../lib/utils";

export function Logo({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect x="1" y="1" width="46" height="46" rx="12" fill={light ? "#fffdf8" : "#1e4d2b"} />
      <path d="M10 24 L24 12 L38 24" fill="none" stroke="#c9962b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 22 V36 H34 V22" fill="none" stroke={light ? "#1e4d2b" : "#fffdf8"} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M21 36 V28 a3 3 0 0 1 6 0 V36" fill="#c9962b" />
      <path d="M16 39 h16" stroke="#b4552d" strokeWidth="2" strokeDasharray="3 2" />
    </svg>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold text-vert md:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-gris">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn("rounded-2xl border border-sable bg-blanc", className)}
    >
      {children}
    </motion.div>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "or" | "ghost" | "danger" | "outline"; loading?: boolean };
export function Btn({ variant = "primary", loading, className, children, disabled, ...p }: BtnProps) {
  const v = {
    primary: "bg-vert text-blanc hover:bg-vert-2",
    or: "bg-or text-vert-deep hover:bg-or-2",
    ghost: "text-vert hover:bg-beige",
    outline: "border border-sable bg-blanc text-vert hover:border-vert-3",
    danger: "text-terre hover:bg-terre/10",
  }[variant];
  return (
    <button
      {...p}
      disabled={disabled || loading}
      className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50", v, className)}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function IconBtn({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={cn("grid size-9 place-items-center rounded-lg text-gris transition hover:bg-beige hover:text-vert", className)} />;
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gris">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-sable bg-blanc px-3.5 py-2.5 text-sm outline-none transition focus:border-or focus:ring-2 focus:ring-or/25";
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(inputCls, p.className)} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={3} {...p} className={cn(inputCls, p.className)} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cn(inputCls, "appearance-auto", p.className)} />;

export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <button type="button" aria-label="Fermer" className="absolute inset-0 cursor-default bg-vert-deep/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.aside
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative flex h-full w-full max-w-xl flex-col bg-blanc shadow-2xl"
      >
        <div className="stripe-or h-1.5" />
        <div className="flex items-center justify-between border-b border-sable px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-vert">{title}</h2>
          <IconBtn onClick={onClose}><X className="size-5" /></IconBtn>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-sable bg-beige/50 px-6 py-4">{footer}</div>}
      </motion.aside>
    </div>
  );
}

export function Badge({ children, tone = "vert" }: { children: React.ReactNode; tone?: "vert" | "or" | "terre" | "gris" }) {
  const t = { vert: "bg-vert/10 text-vert", or: "bg-or/15 text-[#8a6416]", terre: "bg-terre/12 text-terre", gris: "bg-sable/60 text-gris" }[tone];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", t)}>{children}</span>;
}

export function Loading() {
  return (
    <div className="grid place-items-center py-20 text-gris">
      <Loader2 className="size-7 animate-spin text-or" />
    </div>
  );
}

export function Empty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center text-gris">
      <div className="grid size-14 place-items-center rounded-2xl bg-beige"><Inbox className="size-6 text-or" /></div>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Table({ head, children }: { head: React.ReactNode[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="bg-beige/70 text-left text-xs uppercase tracking-wider text-gris">
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold first:pl-5 last:pr-5 last:text-right">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sable/70">{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={cn("px-4 py-3 first:pl-5 last:pr-5 last:text-right", className)}>{children}</td>
);

export function SearchBar({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-sable p-4">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="max-w-xs" />
      {children}
    </div>
  );
}

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]!);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + [keys.join(";"), ...rows.map((r) => keys.map((k) => esc(r[k])).join(";"))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `${name}.csv`;
  a.click();
}

export const TYPE_COLOR: Record<string, string> = {
  habitation: "#1e4d2b",
  commerce: "#c9962b",
  religieux: "#4f8a5b",
  education: "#2a6f8f",
  sante: "#b4552d",
  administratif: "#6b3e26",
  autre: "#6f6a5c",
};
