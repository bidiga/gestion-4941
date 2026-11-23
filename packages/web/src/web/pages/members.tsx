import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { PageHeader, Card, Btn, IconBtn, Drawer, Field, Input, Select, Table, Td, Loading, Empty, Badge, SearchBar, downloadCsv } from "../components/kit";
import { useI18n, LABELS } from "../lib/i18n";
import { useMembers, useFamilies, useCreateMember, useUpdateMember, useRemoveMember } from "../queries/registry";
import { toPayload } from "./families";

export type MemberFormValue = { id?: number; familyId: string; firstName: string; lastName: string; sex: string; birthYear: string; relation: string; occupation: string; phone: string };
export const emptyMember: MemberFormValue = { familyId: "", firstName: "", lastName: "", sex: "M", birthYear: "", relation: "enfant", occupation: "", phone: "" };

export function MemberForm({ value, onChange, families }: { value: MemberFormValue; onChange: (v: MemberFormValue) => void; families: { id: number; name: string; headName: string }[] }) {
  const { t, lang } = useI18n();
  const set = (k: keyof MemberFormValue) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid grid-cols-2 gap-4">
      {families.length > 0 && (
        <Field label={t("family")} className="col-span-2">
          <Select value={value.familyId} onChange={(e) => { const f = families.find((x) => String(x.id) === e.target.value); onChange({ ...value, familyId: e.target.value, lastName: value.lastName || f?.name || "" }); }}>
            <option value="">—</option>
            {families.map((f) => <option key={f.id} value={f.id}>{f.name} · {f.headName}</option>)}
          </Select>
        </Field>
      )}
      <Field label={t("firstName")}><Input value={value.firstName} onChange={set("firstName")} /></Field>
      <Field label={t("lastName")}><Input value={value.lastName} onChange={set("lastName")} /></Field>
      <Field label={t("sex")}>
        <Select value={value.sex} onChange={set("sex")}>{Object.entries(LABELS.sex!).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}</Select>
      </Field>
      <Field label={t("birthYear")}><Input type="number" value={value.birthYear} onChange={set("birthYear")} placeholder="1990" /></Field>
      <Field label={t("relation")}>
        <Select value={value.relation} onChange={set("relation")}>{Object.entries(LABELS.relation!).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}</Select>
      </Field>
      <Field label={t("occupation")}><Input value={value.occupation} onChange={set("occupation")} /></Field>
      <Field label={t("phone")} className="col-span-2"><Input value={value.phone} onChange={set("phone")} /></Field>
    </div>
  );
}

export default function Members() {
  const { t, l, lang } = useI18n();
  const list = useMembers();
  const families = useFamilies();
  const create = useCreateMember();
  const update = useUpdateMember();
  const remove = useRemoveMember();
  const [q, setQ] = useState("");
  const [fSex, setFSex] = useState("");
  const [fRel, setFRel] = useState("");
  const [form, setForm] = useState<MemberFormValue | null>(null);
  const year = new Date().getFullYear();
  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return (list.data ?? []).filter((m) => (!fSex || m.sex === fSex) && (!fRel || m.relation === fRel) && (!s || [m.firstName, m.lastName, m.familyName, m.occupation].some((x) => x?.toLowerCase().includes(s))));
  }, [list.data, q, fSex, fRel]);
  const submit = () => {
    if (!form) return;
    const done = { onSuccess: () => setForm(null) };
    if (form.id) update.mutate({ id: form.id, ...toPayload(form) }, done);
    else create.mutate(toPayload(form), done);
  };

  return (
    <div>
      <PageHeader
        title={t("members")}
        sub={`${list.data?.length ?? 0} ${t("members_n")}`}
        actions={<>
          <Btn variant="outline" onClick={() => downloadCsv("membres", rows.map((m) => ({ prenom: m.firstName, nom: m.lastName, sexe: m.sex, naissance: m.birthYear, lien: l("relation", m.relation), famille: m.familyName, activite: m.occupation, telephone: m.phone })))}><Download className="size-4" />{t("exportCsv")}</Btn>
          <Btn onClick={() => setForm({ ...emptyMember })}><Plus className="size-4" />{t("add")}</Btn>
        </>}
      />
      <Card>
        <SearchBar value={q} onChange={setQ} placeholder={t("search")}>
          <Select value={fSex} onChange={(e) => setFSex(e.target.value)} className="w-auto"><option value="">{t("sex")} : {t("all")}</option>{Object.entries(LABELS.sex!).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}</Select>
          <Select value={fRel} onChange={(e) => setFRel(e.target.value)} className="w-auto"><option value="">{t("relation")} : {t("all")}</option>{Object.entries(LABELS.relation!).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}</Select>
          <span className="ml-auto text-sm text-gris">{rows.length}</span>
        </SearchBar>
        {list.isLoading ? <Loading /> : !rows.length ? <Empty text={t("noData")} /> : (
          <Table head={[t("name"), t("family"), t("sex"), "Âge", t("relation"), t("occupation"), ""]}>
            {rows.slice(0, 300).map((m) => (
              <tr key={m.id} className="hover:bg-beige/40">
                <Td><span className="font-medium">{m.firstName} {m.lastName}</span></Td>
                <Td>{m.familyName}</Td>
                <Td><Badge tone={m.sex === "F" ? "terre" : "vert"}>{l("sex", m.sex)}</Badge></Td>
                <Td className="tnum">{m.birthYear ? year - m.birthYear : "—"}</Td>
                <Td>{m.relation === "chef" ? <Badge tone="or">{l("relation", m.relation)}</Badge> : l("relation", m.relation)}</Td>
                <Td className="text-gris">{m.occupation ?? "—"}</Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <IconBtn onClick={() => setForm({ id: m.id, familyId: String(m.familyId), firstName: m.firstName, lastName: m.lastName, sex: m.sex, birthYear: m.birthYear ? String(m.birthYear) : "", relation: m.relation, occupation: m.occupation ?? "", phone: m.phone ?? "" })}><Pencil className="size-4" /></IconBtn>
                    <IconBtn className="hover:text-terre" onClick={() => confirm(t("confirmDelete")) && remove.mutate({ id: m.id })}><Trash2 className="size-4" /></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Drawer open={!!form} onClose={() => setForm(null)} title={form?.id ? t("edit") : t("add")} footer={<><Btn variant="ghost" onClick={() => setForm(null)}>{t("cancel")}</Btn><Btn loading={create.isPending || update.isPending} disabled={!form?.familyId || !form?.firstName || !form?.lastName} onClick={submit}>{t("save")}</Btn></>}>
        {form && <MemberForm value={form} onChange={setForm} families={families.data ?? []} />}
      </Drawer>
    </div>
  );
}
