import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Users, Home, Phone, UserPlus } from "lucide-react";
import { PageHeader, Card, Btn, IconBtn, Drawer, Field, Input, Select, Textarea, Loading, Empty, Badge, SearchBar } from "../components/kit";
import { MemberForm, type MemberFormValue, emptyMember } from "./members";
import { useI18n } from "../lib/i18n";
import { useFamilies, useBuildings, useMembers, useCreateFamily, useUpdateFamily, useRemoveFamily, useCreateMember } from "../queries/registry";

type Form = { id?: number; name: string; headName: string; headPhone: string; buildingId: string; notes: string };

export default function Families() {
  const { t, l } = useI18n();
  const list = useFamilies();
  const buildings = useBuildings();
  const members = useMembers();
  const create = useCreateFamily();
  const update = useUpdateFamily();
  const remove = useRemoveFamily();
  const addMember = useCreateMember();
  const [q, setQ] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [newMember, setNewMember] = useState<MemberFormValue | null>(null);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => f && { ...f, [k]: e.target.value });

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return (list.data ?? []).filter((f) => !s || [f.name, f.headName, f.buildingNumber].some((x) => x?.toLowerCase().includes(s)));
  }, [list.data, q]);
  const fam = list.data?.find((f) => f.id === openId);
  const famMembers = (members.data ?? []).filter((m) => m.familyId === openId);

  const submit = () => {
    if (!form) return;
    const p = { name: form.name, headName: form.headName, headPhone: form.headPhone || null, buildingId: form.buildingId ? Number(form.buildingId) : null, notes: form.notes || null };
    const done = { onSuccess: () => setForm(null) };
    if (form.id) update.mutate({ id: form.id, ...p }, done);
    else create.mutate(p, done);
  };

  return (
    <div>
      <PageHeader title={t("families")} sub={`${list.data?.length ?? 0} ${t("families_n")}`} actions={<Btn onClick={() => setForm({ name: "", headName: "", headPhone: "", buildingId: "", notes: "" })}><Plus className="size-4" />{t("add")}</Btn>} />
      <Card className="mb-4"><SearchBar value={q} onChange={setQ} placeholder={t("search")} /></Card>
      {list.isLoading ? <Loading /> : !rows.length ? <Card><Empty text={t("noData")} /></Card> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((f, i) => (
            <Card key={f.id} delay={Math.min(i, 12) * 0.03} className="group cursor-pointer p-5 transition hover:border-or" >
              <button type="button" className="block w-full text-left" onClick={() => setOpenId(f.id)}>
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-terre/10 font-display text-xl font-semibold text-terre">{f.name.slice(0, 1)}</div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-widest text-gris">{t("family")}</div>
                    <h3 className="truncate font-display text-xl font-semibold text-vert">{f.name}</h3>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2"><Users className="size-4 text-or" />{t("head")} : <b className="font-medium">{f.headName}</b></div>
                  <div className="flex items-center gap-2"><Home className="size-4 text-or" />{f.buildingNumber ?? "—"}</div>
                  {f.headPhone && <div className="flex items-center gap-2"><Phone className="size-4 text-or" />{f.headPhone}</div>}
                </div>
              </button>
              <div className="mt-4 flex items-center justify-between border-t border-sable pt-3">
                <Badge tone="or">{f.memberCount} {t("members_n")}</Badge>
                <div className="flex gap-1">
                  <IconBtn onClick={() => setForm({ id: f.id, name: f.name, headName: f.headName, headPhone: f.headPhone ?? "", buildingId: f.buildingId ? String(f.buildingId) : "", notes: f.notes ?? "" })}><Pencil className="size-4" /></IconBtn>
                  <IconBtn className="hover:text-terre" onClick={() => confirm(t("confirmDelete")) && remove.mutate({ id: f.id })}><Trash2 className="size-4" /></IconBtn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={!!form} onClose={() => setForm(null)} title={form?.id ? t("edit") : `${t("add")} · ${t("family")}`} footer={<><Btn variant="ghost" onClick={() => setForm(null)}>{t("cancel")}</Btn><Btn loading={create.isPending || update.isPending} disabled={!form?.name || !form?.headName} onClick={submit}>{t("save")}</Btn></>}>
        {form && (
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("lastName")}><Input value={form.name} onChange={set("name")} placeholder="Soumaré" /></Field>
            <Field label={t("head")}><Input value={form.headName} onChange={set("headName")} placeholder="Siré Soumaré" /></Field>
            <Field label={t("phone")}><Input value={form.headPhone} onChange={set("headPhone")} /></Field>
            <Field label={t("building")}>
              <Select value={form.buildingId} onChange={set("buildingId")}>
                <option value="">—</option>
                {(buildings.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.number} {b.ownerName ? `· ${b.ownerName}` : ""}</option>)}
              </Select>
            </Field>
            <Field label={t("notes")} className="col-span-2"><Textarea value={form.notes} onChange={set("notes")} /></Field>
          </div>
        )}
      </Drawer>

      <Drawer open={!!fam} onClose={() => { setOpenId(null); setNewMember(null); }} title={fam ? `${t("family")} ${fam.name}` : ""}>
        {fam && (
          <div>
            <div className="mb-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-beige p-3"><div className="tnum font-display text-2xl text-vert">{famMembers.length}</div><div className="text-xs text-gris">{t("members_n")}</div></div>
              <div className="rounded-xl bg-beige p-3"><div className="tnum font-display text-2xl text-vert">{famMembers.filter((m) => m.sex === "M").length}</div><div className="text-xs text-gris">{t("male")}</div></div>
              <div className="rounded-xl bg-beige p-3"><div className="tnum font-display text-2xl text-vert">{famMembers.filter((m) => m.sex === "F").length}</div><div className="text-xs text-gris">{t("female")}</div></div>
            </div>
            <div className="relative space-y-2 pl-5 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-0.5 before:bg-sable">
              {famMembers.sort((a, b) => (a.relation === "chef" ? -1 : b.relation === "chef" ? 1 : (a.birthYear ?? 0) - (b.birthYear ?? 0))).map((m) => (
                <div key={m.id} className="relative flex items-center justify-between rounded-xl border border-sable bg-blanc px-4 py-3">
                  <span className={`absolute -left-[18px] size-3 rounded-full ring-4 ring-blanc ${m.relation === "chef" ? "bg-or" : m.sex === "F" ? "bg-terre" : "bg-vert"}`} />
                  <div>
                    <div className="font-medium">{m.firstName} {m.lastName}</div>
                    <div className="text-xs text-gris">{l("relation", m.relation)} · {m.birthYear ? `${new Date().getFullYear() - m.birthYear} ans` : "—"} {m.occupation ? `· ${m.occupation}` : ""}</div>
                  </div>
                  <Badge tone={m.sex === "F" ? "terre" : "vert"}>{m.sex}</Badge>
                </div>
              ))}
            </div>
            {newMember ? (
              <div className="mt-5 rounded-2xl border border-or/50 bg-beige/40 p-4">
                <MemberForm value={newMember} onChange={setNewMember} families={[]} />
                <div className="mt-3 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setNewMember(null)}>{t("cancel")}</Btn>
                  <Btn loading={addMember.isPending} disabled={!newMember.firstName} onClick={() => addMember.mutate({ ...toPayload(newMember), familyId: fam.id }, { onSuccess: () => setNewMember(null) })}>{t("save")}</Btn>
                </div>
              </div>
            ) : (
              <Btn variant="outline" className="mt-5 w-full" onClick={() => setNewMember({ ...emptyMember, lastName: fam.name, familyId: String(fam.id) })}><UserPlus className="size-4" />{t("add")}</Btn>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

export function toPayload(m: MemberFormValue) {
  return {
    familyId: Number(m.familyId),
    firstName: m.firstName,
    lastName: m.lastName,
    sex: m.sex as "M" | "F",
    birthYear: m.birthYear ? Number(m.birthYear) : null,
    relation: m.relation,
    occupation: m.occupation || null,
    phone: m.phone || null,
  };
}
