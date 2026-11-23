import { useEffect, useState } from "react";
import { Sparkles, Trash2, Check } from "lucide-react";
import { PageHeader, Card, Btn, Field, Input, Loading } from "../components/kit";
import { VillageMap } from "../components/village-map";
import { useI18n } from "../lib/i18n";
import { useSettings, useSaveSettings, useSeedDemo, useResetAll } from "../queries/registry";

const FIELDS: [string, string][] = [
  ["villageName", "Nom du village"],
  ["commune", "Commune"],
  ["cercle", "Cercle"],
  ["region", "Région"],
  ["chefVillage", "Chef de village"],
  ["platePrefix", "Préfixe des numéros (ex. SMK)"],
];

export default function SettingsPage() {
  const { t } = useI18n();
  const settings = useSettings();
  const save = useSaveSettings();
  const seed = useSeedDemo();
  const reset = useResetAll();
  const [v, setV] = useState<Record<string, string>>({});
  const [ok, setOk] = useState(false);
  useEffect(() => { if (settings.data) setV(settings.data); }, [settings.data]);
  if (settings.isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title={t("settings")} actions={<Btn loading={save.isPending} onClick={() => save.mutate(v, { onSuccess: () => { setOk(true); setTimeout(() => setOk(false), 2000); } })}>{ok ? <Check className="size-4" /> : null}{ok ? t("saved") : t("save")}</Btn>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-vert">Identité</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map(([k, label]) => <Field key={k} label={label}><Input value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></Field>)}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="mb-1 font-display text-lg font-semibold text-vert">Centre de la carte</h2>
          <p className="mb-4 text-sm text-gris">Cliquez sur l'image satellite pour recentrer le village.</p>
          <VillageMap center={[Number(v.centerLat || 14.54694), Number(v.centerLng || -11.60694)]} zoom={Number(v.zoom || 16)} picked={[Number(v.centerLat || 14.54694), Number(v.centerLng || -11.60694)]} onPick={(lat, lng) => setV({ ...v, centerLat: lat.toFixed(6), centerLng: lng.toFixed(6) })} className="h-64" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Input value={v.centerLat ?? ""} onChange={(e) => setV({ ...v, centerLat: e.target.value })} />
            <Input value={v.centerLng ?? ""} onChange={(e) => setV({ ...v, centerLng: e.target.value })} />
            <Input type="number" min={12} max={19} value={v.zoom ?? ""} onChange={(e) => setV({ ...v, zoom: e.target.value })} />
          </div>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-vert">Données</h2>
          <div className="flex flex-wrap gap-3">
            <Btn variant="or" loading={seed.isPending} onClick={() => seed.mutate({}, { onSuccess: (r) => alert(r.message) })}><Sparkles className="size-4" />{t("loadDemo")}</Btn>
            <Btn variant="danger" className="border border-terre/30" loading={reset.isPending} onClick={() => { const c = prompt("Tapez EFFACER pour supprimer toutes les rues, bâtiments, familles, membres et utilisateurs."); if (c === "EFFACER") reset.mutate({ confirm: "EFFACER" }); }}><Trash2 className="size-4" />Effacer toutes les données</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
