import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Plus, Pencil, Trash2, Download, MapPin } from "lucide-react";
import { PageHeader, Card, Btn, IconBtn, Drawer, Field, Input, Select, Textarea, Table, Td, Badge, Loading, Empty, SearchBar, downloadCsv, TYPE_COLOR } from "../components/kit";
import { VillageMap } from "../components/village-map";
import { useI18n, LABELS } from "../lib/i18n";
import { useBuildings, useStreets, useSettings, useCreateBuilding, useUpdateBuilding, useRemoveBuilding } from "../queries/registry";

type Form = { id?: number; number: string; streetId: string; type: string; status: string; ownerName: string; phone: string; rooms: string; lat: string; lng: string; notes: string };
const empty: Form = { number: "", streetId: "", type: "habitation", status: "occupe", ownerName: "", phone: "", rooms: "", lat: "", lng: "", notes: "" };

export default function Buildings() {
  const { t, l, lang } = useI18n();
  const search = useSearch();
  const list = useBuildings();
  const streets = useStreets();
  const settings = useSettings();
  const create = useCreateBuilding();
  const update = useUpdateBuilding();
  const remove = useRemoveBuilding();
  const [q, setQ] = useState("");
  const [fType, setFType] = useState("");
  const [fStreet, setFStreet] = useState("");
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (new URLSearchParams(search).get("new")) setForm({ ...empty });
  }, [search]);

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return (list.data ?? []).filter(
      (b) =>
        (!fType || b.type === fType) &&
        (!fStreet || String(b.streetId) === fStreet) &&
        (!s || [b.number, b.ownerName, b.streetName, b.phone].some((x) => x?.toLowerCase().includes(s))),
    );
  }, [list.data, q, fType, fStreet]);

  const center: [number, number] = [Number(settings.data?.centerLat ?? 14.54694), Number(settings.data?.centerLng ?? -11.60694)];
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => f && { ...f, [k]: e.target.value });

  const submit = () => {
    if (!form) return;
    const payload = {
      number: form.number || null,
      streetId: form.streetId ? Number(form.streetId) : null,
      type: form.type,
      status: form.status,
      ownerName: form.ownerName || null,
      phone: form.phone || null,
      rooms: form.rooms ? Number(form.rooms) : null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      notes: form.notes || null,
    };
    const done = { onSuccess: () => setForm(null) };
    if (form.id) update.mutate({ id: form.id, ...payload }, done);
    else create.mutate(payload, done);
  };

  return (
    <div>
      <PageHeader
        title={t("buildings")}
        sub={`${list.data?.length ?? 0} ${t("buildings_n")}`}
        actions={
          <>
            <Btn variant="outline" onClick={() => downloadCsv("batiments", rows.map((b) => ({ numero: b.number, rue: b.streetName, type: l("type", b.type), statut: l("status", b.status), responsable: b.ownerName, telephone: b.phone, pieces: b.rooms, familles: b.familyCount, lat: b.lat, lng: b.lng })))}>
              <Download className="size-4" />{t("exportCsv")}
            </Btn>
            <Btn onClick={() => setForm({ ...empty })}><Plus className="size-4" />{t("addBuilding")}</Btn>
          </>
        }
      />
      <Card>
        <SearchBar value={q} onChange={setQ} placeholder={t("search")}>
          <Select value={fType} onChange={(e) => setFType(e.target.value)} className="w-auto">
            <option value="">{t("type")} : {t("all")}</option>
            {Object.entries(LABELS.type!).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
          </Select>
          <Select value={fStreet} onChange={(e) => setFStreet(e.target.value)} className="w-auto">
            <option value="">{t("street")} : {t("all")}</option>
            {(streets.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}
          </Select>
        </SearchBar>
        {list.isLoading ? <Loading /> : rows.length === 0 ? <Empty text={t("noData")} /> : (
          <Table head={[t("number"), t("street"), t("type"), t("owner"), t("families"), t("status"), "GPS", ""]}>
            {rows.map((b) => (
              <tr key={b.id} className="hover:bg-beige/40">
                <Td><span className="rounded-lg bg-vert px-2.5 py-1 font-mono text-xs font-semibold text-or-2">{b.number}</span></Td>
                <Td>{b.streetName ?? "—"}</Td>
                <Td><span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: TYPE_COLOR[b.type] }} />{l("type", b.type)}</span></Td>
                <Td><div className="font-medium">{b.ownerName ?? "—"}</div><div className="text-xs text-gris">{b.phone}</div></Td>
                <Td className="tnum">{b.familyCount}</Td>
                <Td><Badge tone={b.status === "occupe" ? "vert" : b.status === "vacant" ? "gris" : "or"}>{l("status", b.status)}</Badge></Td>
                <Td>{b.lat ? <MapPin className="size-4 text-vert-3" /> : <span className="text-gris">—</span>}</Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <IconBtn title={t("edit")} onClick={() => setForm({ id: b.id, number: b.number, streetId: b.streetId ? String(b.streetId) : "", type: b.type, status: b.status, ownerName: b.ownerName ?? "", phone: b.phone ?? "", rooms: b.rooms ? String(b.rooms) : "", lat: b.lat ? String(b.lat) : "", lng: b.lng ? String(b.lng) : "", notes: b.notes ?? "" })}><Pencil className="size-4" /></IconBtn>
                    <IconBtn title={t("delete")} onClick={() => confirm(t("confirmDelete")) && remove.mutate({ id: b.id })} className="hover:text-terre"><Trash2 className="size-4" /></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Drawer
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? `${t("edit")} · ${form.number}` : t("addBuilding")}
        footer={<><Btn variant="ghost" onClick={() => setForm(null)}>{t("cancel")}</Btn><Btn loading={create.isPending || update.isPending} onClick={submit}>{t("save")}</Btn></>}
      >
        {form && (
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("street")} className="col-span-2">
              <Select value={form.streetId} onChange={set("streetId")}>
                <option value="">—</option>
                {(streets.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}
              </Select>
            </Field>
            <Field label={t("number")} className="col-span-2">
              <Input value={form.number} onChange={set("number")} placeholder="Automatique (ex. SMK-R01-012)" />
            </Field>
            <Field label={t("type")}>
              <Select value={form.type} onChange={set("type")}>{Object.entries(LABELS.type!).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}</Select>
            </Field>
            <Field label={t("status")}>
              <Select value={form.status} onChange={set("status")}>{Object.entries(LABELS.status!).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}</Select>
            </Field>
            <Field label={t("owner")} className="col-span-2"><Input value={form.ownerName} onChange={set("ownerName")} /></Field>
            <Field label={t("phone")}><Input value={form.phone} onChange={set("phone")} placeholder="+223 …" /></Field>
            <Field label={t("rooms")}><Input type="number" min={0} value={form.rooms} onChange={set("rooms")} /></Field>
            <div className="col-span-2">
              <Field label={t("gps")}><span className="mb-2 block text-xs text-gris">{t("clickMap")}</span></Field>
              <VillageMap
                center={form.lat ? [Number(form.lat), Number(form.lng)] : center}
                zoom={17}
                points={(list.data ?? []).filter((b) => b.id !== form.id)}
                picked={form.lat ? [Number(form.lat), Number(form.lng)] : null}
                onPick={(lat, lng) => setForm((f) => f && { ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) })}
                className="h-64"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input value={form.lat} onChange={set("lat")} placeholder="Latitude" />
                <Input value={form.lng} onChange={set("lng")} placeholder="Longitude" />
              </div>
            </div>
            <Field label={t("notes")} className="col-span-2"><Textarea value={form.notes} onChange={set("notes")} /></Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}
