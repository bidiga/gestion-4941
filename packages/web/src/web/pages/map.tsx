import { useMemo, useState } from "react";
import { PageHeader, Card, Input, Loading, TYPE_COLOR } from "../components/kit";
import { VillageMap } from "../components/village-map";
import { useI18n, LABELS } from "../lib/i18n";
import { useBuildings, useSettings } from "../queries/registry";
import { cn } from "../lib/utils";

export default function MapPage() {
  const { t, l, lang } = useI18n();
  const list = useBuildings();
  const settings = useSettings();
  const [q, setQ] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [focus, setFocus] = useState<[number, number] | null>(null);
  const pts = useMemo(() => (list.data ?? []).filter((b) => !hidden.includes(b.type)), [list.data, hidden]);
  const found = useMemo(() => {
    const s = q.toLowerCase();
    return pts.filter((b) => b.lat && (!s || [b.number, b.ownerName, b.streetName].some((x) => x?.toLowerCase().includes(s)))).slice(0, 40);
  }, [pts, q]);
  if (settings.isLoading) return <Loading />;
  const center: [number, number] = [Number(settings.data!.centerLat), Number(settings.data!.centerLng)];

  return (
    <div>
      <PageHeader title={t("map")} sub={`${pts.filter((p) => p.lat).length} ${t("buildings_n")} ${t("located")}`} />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="flex max-h-[72vh] flex-col">
          <div className="border-b border-sable p-4">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(LABELS.type!).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]))}
                  className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition", hidden.includes(k) ? "border-sable text-gris line-through opacity-60" : "border-transparent bg-beige text-encre")}
                >
                  <span className="size-2 rounded-full" style={{ background: TYPE_COLOR[k] }} />{v[lang]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 divide-y divide-sable/60 overflow-y-auto">
            {found.map((b) => (
              <button key={b.id} aria-label={b.number} onClick={() => setFocus([b.lat!, b.lng!])} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-beige/50">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: TYPE_COLOR[b.type] }} />
                <div className="min-w-0">
                  <div className="font-mono text-xs font-semibold text-vert">{b.number}</div>
                  <div className="truncate text-sm">{b.ownerName ?? l("type", b.type)}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
        {list.isLoading ? <Loading /> : <VillageMap center={center} zoom={Number(settings.data!.zoom)} points={pts} focus={focus} className="h-[72vh]" />}
      </div>
    </div>
  );
}
