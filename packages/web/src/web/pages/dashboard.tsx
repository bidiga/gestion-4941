import { Link } from "wouter";
import { Building2, Route as RouteIcon, Users, UserRound, Plus, Map, Printer, ArrowUpRight, Sparkles } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { Card, Btn, Loading, Badge, TYPE_COLOR } from "../components/kit";
import { VillageMap } from "../components/village-map";
import { useI18n } from "../lib/i18n";
import { useStats, useBuildings, useSettings, useSeedDemo } from "../queries/registry";

export default function Dashboard() {
  const { t, l } = useI18n();
  const stats = useStats();
  const buildings = useBuildings();
  const settings = useSettings();
  const seed = useSeedDemo();
  const s = stats.data;
  const center: [number, number] = [Number(settings.data?.centerLat ?? 14.54694), Number(settings.data?.centerLng ?? -11.60694)];

  const cards = [
    { k: "statBuildings", v: s?.buildings, icon: Building2, tone: "bg-vert text-blanc" },
    { k: "statStreets", v: s?.streets, icon: RouteIcon, tone: "bg-or text-vert-deep" },
    { k: "statFamilies", v: s?.families, icon: Users, tone: "bg-terre text-blanc" },
    { k: "statMembers", v: s?.members, icon: UserRound, tone: "bg-vert-3 text-blanc" },
  ] as const;

  const quick = [
    { to: "/batiments?new=1", k: "addBuilding", sub: "addBuildingSub", icon: Plus },
    { to: "/carte", k: "map", sub: "mapSub", icon: Map },
    { to: "/familles", k: "families", sub: "familiesSub", icon: Users },
    { to: "/plaques", k: "plates", sub: "platesSub", icon: Printer },
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-0 bg-vert text-blanc">
        <div className="bogolan absolute inset-0 opacity-30" />
        <div className="absolute -right-20 -top-24 size-80 rounded-full bg-or/25 blur-3xl" />
        <div className="relative grid gap-6 p-7 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <span className="inline-flex rounded-full border border-or/50 bg-or/20 px-3 py-1 text-xs font-medium text-or-2">{settings.data?.commune ?? "Commune urbaine de Somankidy"}</span>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-5xl">{t("welcome")}</h1>
            <p className="mt-3 max-w-lg text-blanc/75 md:text-lg">{t("welcomeSub")}</p>
            {s && s.buildings === 0 && (
              <Btn variant="or" className="mt-6" loading={seed.isPending} onClick={() => seed.mutate({})}>
                <Sparkles className="size-4" />{t("loadDemo")}
              </Btn>
            )}
          </div>
          <div className="grid grid-cols-2 content-end gap-3">
            <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
              <div className="text-xs uppercase tracking-wider text-blanc/60">{t("avgFamily")}</div>
              <div className="tnum mt-1 font-display text-3xl text-or-2">{s?.avgFamilySize ?? "—"}</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
              <div className="text-xs uppercase tracking-wider text-blanc/60">GPS</div>
              <div className="tnum mt-1 font-display text-3xl text-or-2">{s ? `${s.located}/${s.buildings}` : "—"}</div>
            </div>
          </div>
        </div>
        <div className="stripe-or relative h-1.5" />
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Card key={c.k} delay={0.05 * i} className="p-5">
            <div className="flex items-start justify-between">
              <div className={`grid size-11 place-items-center rounded-xl ${c.tone}`}><c.icon className="size-5" /></div>
              <ArrowUpRight className="size-4 text-sable" />
            </div>
            <div className="tnum mt-5 font-display text-4xl font-semibold text-vert">{stats.isLoading ? "…" : (c.v ?? 0)}</div>
            <div className="mt-1 text-sm text-gris">{t(c.k)}</div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-semibold text-vert">{t("quickAccess")}</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quick.map((q, i) => (
            <Card key={q.to} delay={0.2 + 0.05 * i}>
              <Link to={q.to} className="group flex items-center gap-4 p-4 transition hover:bg-beige/40">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-sable bg-beige text-vert transition group-hover:bg-vert group-hover:text-or-2">
                  <q.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-vert">{t(q.k)}</div>
                  <div className="truncate text-xs text-gris">{t(q.sub)}</div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden" delay={0.3}>
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-display text-xl font-semibold text-vert">{t("map")}</h2>
            <Link to="/carte" className="text-sm font-medium text-or hover:underline">{t("mapSub")} →</Link>
          </div>
          <div className="px-5 pb-5">
            {settings.isLoading ? <Loading /> : <VillageMap center={center} zoom={Number(settings.data?.zoom ?? 16)} points={buildings.data ?? []} className="h-[380px]" />}
          </div>
        </Card>
        <Card className="p-5" delay={0.35}>
          <h2 className="font-display text-xl font-semibold text-vert">{t("byType")}</h2>
          {stats.isLoading ? <Loading /> : (
            <div className="flex items-center gap-4">
              <div className="h-[220px] w-1/2">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={s?.byType ?? []} dataKey="n" nameKey="k" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="none">
                      {(s?.byType ?? []).map((d) => <Cell key={d.k} fill={TYPE_COLOR[d.k] ?? "#999"} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, l("type", String(n))]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-2 text-sm">
                {(s?.byType ?? []).map((d) => (
                  <li key={d.k} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: TYPE_COLOR[d.k] }} />{l("type", d.k)}</span>
                    <span className="tnum font-semibold">{d.n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h3 className="mt-4 text-sm font-semibold text-vert">{t("ageGroups")}</h3>
          <div className="h-[150px]">
            <ResponsiveContainer>
              <BarChart data={s?.byAge ?? []}>
                <XAxis dataKey="k" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis hide />
                <Tooltip cursor={{ fill: "#f4ecdd" }} />
                <Bar dataKey="n" radius={[6, 6, 0, 0]} fill="#c9962b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card delay={0.4}>
        <div className="flex items-center justify-between p-5 pb-2">
          <h2 className="font-display text-xl font-semibold text-vert">{t("recent")}</h2>
          <Link to="/batiments" className="text-sm font-medium text-or hover:underline">{t("buildings")} →</Link>
        </div>
        <div className="divide-y divide-sable/70">
          {(s?.recent ?? []).map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-vert px-2.5 py-1 font-mono text-xs font-semibold text-or-2">{b.number}</span>
                <span className="text-sm">{b.ownerName ?? "—"}</span>
              </div>
              <Badge tone={b.status === "occupe" ? "vert" : b.status === "vacant" ? "gris" : "or"}>{l("status", b.status)}</Badge>
            </div>
          ))}
          {s && s.recent.length === 0 && <p className="px-5 pb-5 text-sm text-gris">{t("noData")}</p>}
        </div>
      </Card>
    </div>
  );
}
