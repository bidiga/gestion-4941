import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, CartesianGrid } from "recharts";
import { Printer } from "lucide-react";
import { PageHeader, Card, Btn, Loading, TYPE_COLOR } from "../components/kit";
import { useI18n } from "../lib/i18n";
import { useStats, useSettings } from "../queries/registry";

export default function Reports() {
  const { t, l } = useI18n();
  const stats = useStats();
  const settings = useSettings();
  const s = stats.data;
  if (stats.isLoading || !s) return <Loading />;
  const sexData = s.bySex.map((x) => ({ ...x, label: l("sex", x.k) }));
  const statusColor: Record<string, string> = { occupe: "#1e4d2b", vacant: "#e6d8bf", construction: "#c9962b" };

  const kpis = [
    [t("statBuildings"), s.buildings],
    [t("statFamilies"), s.families],
    [t("statMembers"), s.members],
    [t("avgFamily"), s.avgFamilySize],
  ] as const;

  return (
    <div className="print-area">
      <PageHeader title={t("reports")} sub={`${settings.data?.commune ?? ""} · ${new Date().toLocaleDateString("fr-FR")}`} actions={<Btn variant="outline" className="no-print" onClick={() => window.print()}><Printer className="size-4" />{t("print")}</Btn>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(([k, v], i) => (
          <Card key={k} delay={i * 0.05} className="p-5">
            <div className="text-sm text-gris">{k}</div>
            <div className="tnum mt-2 font-display text-4xl font-semibold text-vert">{v}</div>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-vert">{t("ageGroups")}</h2>
          <div className="h-64"><ResponsiveContainer><BarChart data={s.byAge}><CartesianGrid vertical={false} stroke="#e6d8bf" /><XAxis dataKey="k" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={30} /><Tooltip cursor={{ fill: "#f4ecdd" }} /><Bar dataKey="n" radius={[8, 8, 0, 0]} fill="#1e4d2b" /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-vert">{t("male")} / {t("female")}</h2>
          <div className="flex h-64 items-center">
            <ResponsiveContainer width="55%"><PieChart><Pie data={sexData} dataKey="n" nameKey="label" innerRadius={60} outerRadius={100} stroke="none">{sexData.map((d) => <Cell key={d.k} fill={d.k === "F" ? "#b4552d" : "#1e4d2b"} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            <div className="space-y-4">
              {sexData.map((d) => (
                <div key={d.k}><div className="text-sm text-gris">{d.label}</div><div className="tnum font-display text-3xl" style={{ color: d.k === "F" ? "#b4552d" : "#1e4d2b" }}>{d.n}<span className="ml-2 text-base text-gris">{s.members ? Math.round((d.n / s.members) * 100) : 0}%</span></div></div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-vert">{t("byStreet")}</h2>
          <div className="h-72"><ResponsiveContainer><BarChart data={s.byStreet} layout="vertical" margin={{ left: 10 }}><XAxis type="number" hide /><YAxis type="category" dataKey="k" width={170} tickLine={false} axisLine={false} fontSize={12} /><Tooltip cursor={{ fill: "#f4ecdd" }} /><Bar dataKey="n" radius={[0, 8, 8, 0]} fill="#c9962b" /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-vert">{t("byType")} · {t("byStatus")}</h2>
          <div className="grid h-72 grid-cols-2">
            <ResponsiveContainer><PieChart><Pie data={s.byType} dataKey="n" nameKey="k" outerRadius={90} stroke="#fffdf8">{s.byType.map((d) => <Cell key={d.k} fill={TYPE_COLOR[d.k]} />)}</Pie><Tooltip formatter={(v, n) => [v, l("type", String(n))]} /></PieChart></ResponsiveContainer>
            <div className="flex flex-col justify-center gap-3">
              {s.byStatus.map((d) => (
                <div key={d.k}>
                  <div className="flex justify-between text-sm"><span>{l("status", d.k)}</span><b className="tnum">{d.n}</b></div>
                  <div className="mt-1 h-2 rounded-full bg-beige"><div className="h-full rounded-full" style={{ width: `${(d.n / Math.max(1, s.buildings)) * 100}%`, background: statusColor[d.k] ?? "#6f6a5c" }} /></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
