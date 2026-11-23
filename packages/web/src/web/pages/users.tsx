import { useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { PageHeader, Card, Btn, IconBtn, Drawer, Field, Input, Select, Table, Td, Loading, Empty, Badge } from "../components/kit";
import { useI18n, LABELS } from "../lib/i18n";
import { useAgents, useCreateAgent, useUpdateAgent, useRemoveAgent } from "../queries/registry";

type Form = { id?: number; name: string; role: string; phone: string; email: string; active: boolean };

export default function UsersPage() {
  const { t, l, lang } = useI18n();
  const list = useAgents();
  const create = useCreateAgent();
  const update = useUpdateAgent();
  const remove = useRemoveAgent();
  const [form, setForm] = useState<Form | null>(null);
  const submit = () => {
    if (!form) return;
    const p = { name: form.name, role: form.role, phone: form.phone || null, email: form.email || null, active: form.active };
    const done = { onSuccess: () => setForm(null) };
    if (form.id) update.mutate({ id: form.id, ...p }, done);
    else create.mutate(p, done);
  };
  return (
    <div>
      <PageHeader title={t("users")} sub={`${list.data?.length ?? 0}`} actions={<Btn onClick={() => setForm({ name: "", role: "agent", phone: "", email: "", active: true })}><Plus className="size-4" />{t("add")}</Btn>} />
      <Card>
        {list.isLoading ? <Loading /> : !list.data?.length ? <Empty text={t("noData")} /> : (
          <Table head={[t("name"), t("role"), t("phone"), "E-mail", t("active"), ""]}>
            {list.data.map((a) => (
              <tr key={a.id} className="hover:bg-beige/40">
                <Td><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-vert font-semibold text-or-2">{a.name.slice(0, 1)}</div><span className="font-medium">{a.name}</span></div></Td>
                <Td><Badge tone={a.role === "admin" ? "or" : a.role === "agent" ? "vert" : "gris"}>{a.role === "admin" && <ShieldCheck className="mr-1 size-3" />}{l("role", a.role)}</Badge></Td>
                <Td>{a.phone ?? "—"}</Td>
                <Td className="text-gris">{a.email ?? "—"}</Td>
                <Td>{a.active ? <Badge>✓</Badge> : <Badge tone="gris">—</Badge>}</Td>
                <Td><div className="flex justify-end gap-1"><IconBtn onClick={() => setForm({ id: a.id, name: a.name, role: a.role, phone: a.phone ?? "", email: a.email ?? "", active: a.active })}><Pencil className="size-4" /></IconBtn><IconBtn className="hover:text-terre" onClick={() => confirm(t("confirmDelete")) && remove.mutate({ id: a.id })}><Trash2 className="size-4" /></IconBtn></div></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Drawer open={!!form} onClose={() => setForm(null)} title={form?.id ? t("edit") : t("add")} footer={<><Btn variant="ghost" onClick={() => setForm(null)}>{t("cancel")}</Btn><Btn loading={create.isPending || update.isPending} disabled={!form?.name} onClick={submit}>{t("save")}</Btn></>}>
        {form && (
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("name")} className="col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label={t("role")}><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{Object.entries(LABELS.role!).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}</Select></Field>
            <Field label={t("active")}><Select value={form.active ? "1" : "0"} onChange={(e) => setForm({ ...form, active: e.target.value === "1" })}><option value="1">Oui</option><option value="0">Non</option></Select></Field>
            <Field label={t("phone")}><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="E-mail"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}
