import { useMemo, useState } from "react";
import { Printer, CheckSquare, Square } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PageHeader, Card, Btn, Select, Loading, Empty, Input } from "../components/kit";
import { useI18n } from "../lib/i18n";
import { useBuildings, useStreets, useSettings } from "../queries/registry";
import { cn } from "../lib/utils";

type B = NonNullable<ReturnType<typeof useBuildings>["data"]>[number];

function Plate({ b, village, qr, style }: { b: B; village: string; qr: boolean; style: "vert" | "blanc" }) {
  const seq = b.number.split("-").pop();
  const dark = style === "vert";
  return (
    <div className={cn("relative flex aspect-[2/1] w-full break-inside-avoid flex-col overflow-hidden rounded-[18px] border-[5px] p-[4%]", dark ? "border-or bg-vert text-blanc" : "border-vert bg-blanc text-vert")}>
      <div className={cn("absolute inset-[6px] rounded-[12px] border", dark ? "border-or/50" : "border-vert/30")} />
      <div className="relative flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em]">
        <span className={dark ? "text-or-2" : "text-or"}>{village}</span>
        <span className="opacity-70">{b.streetCode ?? ""}</span>
      </div>
      <div className="relative flex flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-[56px] font-bold leading-none tracking-tight">{seq}</div>
          <div className={cn("mt-1 truncate text-sm font-medium", dark ? "text-blanc/85" : "text-vert/80")}>{b.streetName ?? "—"}</div>
        </div>
        {qr && (
          <div className="shrink-0 rounded-lg bg-blanc p-1.5"><QRCodeSVG value={`${b.number}${b.lat ? ` ${b.lat.toFixed(6)},${b.lng?.toFixed(6)}` : ""}`} size={64} fgColor="#1e4d2b" /></div>
        )}
      </div>
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wider opacity-80">{b.number}</span>
        <span className="stripe-or h-1.5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export default function Plates() {
  const { t } = useI18n();
  const list = useBuildings();
  const streets = useStreets();
  const settings = useSettings();
  const [street, setStreet] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<number[]>([]);
  const [qr, setQr] = useState(true);
  const [style, setStyle] = useState<"vert" | "blanc">("vert");
  const rows = useMemo(() => (list.data ?? []).filter((b) => (!street || String(b.streetId) === street) && (!q || b.number.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => a.number.localeCompare(b.number)), [list.data, street, q]);
  const chosen = rows.filter((b) => sel.includes(b.id));
  const toPrint = chosen.length ? chosen : rows;
  const village = settings.data?.villageName ?? "Somankidy";
  const allSel = rows.length > 0 && rows.every((r) => sel.includes(r.id));

  return (
    <div>
      <div className="no-print">
        <PageHeader title={t("plates")} sub={`${toPrint.length} ${t("buildings_n")} · A4, 2 × 4`} actions={<Btn variant="or" onClick={() => window.print()} disabled={!toPrint.length}><Printer className="size-4" />{t("print")} ({toPrint.length})</Btn>} />
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="flex max-h-[75vh] flex-col">
            <div className="space-y-3 border-b border-sable p-4">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} />
              <Select value={street} onChange={(e) => setStreet(e.target.value)}>
                <option value="">{t("street")} : {t("all")}</option>
                {(streets.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}
              </Select>
              <div className="flex gap-2">
                <Select value={style} onChange={(e) => setStyle(e.target.value as "vert" | "blanc")}><option value="vert">Vert & or</option><option value="blanc">Blanc & vert</option></Select>
                <Select value={qr ? "1" : "0"} onChange={(e) => setQr(e.target.value === "1")}><option value="1">QR code</option><option value="0">Sans QR</option></Select>
              </div>
              <button onClick={() => setSel(allSel ? [] : rows.map((r) => r.id))} className="flex items-center gap-2 text-sm font-medium text-vert">
                {allSel ? <CheckSquare className="size-4 text-or" /> : <Square className="size-4" />}{t("selectAll")} · {chosen.length} {t("selected")}
              </button>
            </div>
            <div className="flex-1 divide-y divide-sable/60 overflow-y-auto">
              {rows.map((b) => {
                const on = sel.includes(b.id);
                return (
                  <button key={b.id} onClick={() => setSel((s) => (on ? s.filter((x) => x !== b.id) : [...s, b.id]))} className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm", on && "bg-or/10")}>
                    {on ? <CheckSquare className="size-4 shrink-0 text-or" /> : <Square className="size-4 shrink-0 text-sable" />}
                    <span className="font-mono text-xs font-semibold text-vert">{b.number}</span>
                    <span className="truncate text-gris">{b.ownerName}</span>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card className="bogolan-dark p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gris">{t("platePreview")}</h3>
            {list.isLoading ? <Loading /> : !toPrint.length ? <Empty text={t("noData")} /> : (
              <div className="grid gap-5 sm:grid-cols-2">{toPrint.slice(0, 8).map((b) => <Plate key={b.id} b={b} village={village} qr={qr} style={style} />)}</div>
            )}
            {toPrint.length > 8 && <p className="mt-4 text-center text-sm text-gris">+ {toPrint.length - 8}</p>}
          </Card>
        </div>
      </div>
      <div className="print-area hidden print:block">
        <div className="grid grid-cols-2 gap-[6mm]">{toPrint.map((b) => <Plate key={b.id} b={b} village={village} qr={qr} style={style} />)}</div>
      </div>
    </div>
  );
}
