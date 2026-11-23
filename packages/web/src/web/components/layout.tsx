import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard, Building2, Map, Route as RouteIcon, Users, UserRound, Printer, BarChart3, ShieldCheck, Settings, Menu, X, Languages,
} from "lucide-react";
import { Logo } from "./kit";
import { useI18n, type TKey } from "../lib/i18n";
import { useSettings } from "../queries/registry";
import { cn } from "../lib/utils";

const NAV: { section: TKey; items: { to: string; key: TKey; icon: typeof Map }[] }[] = [
  { section: "sectionRegistry", items: [
    { to: "/", key: "dashboard", icon: LayoutDashboard },
    { to: "/batiments", key: "buildings", icon: Building2 },
    { to: "/carte", key: "map", icon: Map },
    { to: "/rues", key: "streets", icon: RouteIcon },
  ] },
  { section: "sectionPeople", items: [
    { to: "/familles", key: "families", icon: Users },
    { to: "/membres", key: "members", icon: UserRound },
  ] },
  { section: "sectionOutput", items: [
    { to: "/plaques", key: "plates", icon: Printer },
    { to: "/rapports", key: "reports", icon: BarChart3 },
  ] },
  { section: "sectionAdmin", items: [
    { to: "/utilisateurs", key: "users", icon: ShieldCheck },
    { to: "/parametres", key: "settings", icon: Settings },
  ] },
];

function LangSwitch({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full p-1 text-xs font-semibold", dark ? "bg-white/10" : "border border-sable bg-blanc")}>
      <Languages className={cn("mx-1 size-3.5", dark ? "text-or-2" : "text-or")} />
      {(["fr", "son"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-full px-3 py-1 transition",
            lang === l ? "bg-or text-vert-deep" : dark ? "text-blanc/70 hover:text-blanc" : "text-gris hover:text-vert",
          )}
        >
          {l === "fr" ? "Français" : "Soninké"}
        </button>
      ))}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const { t, lang } = useI18n();
  const settings = useSettings();
  const village = settings.data?.villageName ?? "Somankidy";
  const today = new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-vert text-blanc">
      <div className="bogolan pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex items-center gap-3 px-6 pb-6 pt-7">
        <Logo light size={44} />
        <div>
          <div className="font-display text-2xl font-semibold leading-none tracking-tight">{village.toLowerCase()}</div>
          <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-or-2">{t("appTag")}</div>
        </div>
      </div>
      <div className="stripe-or relative mx-6 h-1 rounded-full opacity-80" />
      <nav className="relative mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {NAV.map((g) => (
          <div key={g.section}>
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blanc/45">{t(g.section)}</div>
            {g.items.map((it) => {
              const active = it.to === "/" ? loc === "/" : loc.startsWith(it.to);
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition",
                    active ? "bg-blanc text-vert shadow-sm" : "text-blanc/80 hover:bg-white/8 hover:text-blanc",
                  )}
                >
                  {active && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r bg-or" />}
                  <Icon className={cn("size-[18px]", active ? "text-or" : "text-or-2/80")} />
                  {t(it.key)}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="relative border-t border-white/10 p-5">
        <LangSwitch dark />
        <p className="mt-3 text-[11px] text-blanc/45">{settings.data?.cercle ?? "Cercle de Kayes"} · {settings.data?.region ?? "Région de Kayes"}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-[272px]">
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-[272px] lg:block">{sidebar}</aside>
      {open && (
        <div className="no-print fixed inset-0 z-[900] lg:hidden">
          <button type="button" aria-label="Fermer le menu" className="absolute inset-0 cursor-default bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-[280px]">{sidebar}</div>
          <button aria-label="Fermer" onClick={() => setOpen(false)} className="absolute left-[292px] top-5 grid size-10 place-items-center rounded-full bg-blanc text-vert"><X className="size-5" /></button>
        </div>
      )}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-sable/80 bg-beige/85 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl bg-vert text-blanc lg:hidden"><Menu className="size-5" /></button>
          <div className="flex items-center gap-2 lg:hidden"><Logo size={30} /><span className="font-display text-lg font-semibold text-vert">{village.toLowerCase()}</span></div>
          <div className="hidden text-sm capitalize text-gris lg:block">{today}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block"><LangSwitch /></div>
          <div className="grid size-9 place-items-center rounded-full bg-or font-semibold text-vert-deep">A</div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
