import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, Card, Btn, IconBtn, Drawer, Field, Input, Textarea, Loading, Empty } from "../components/kit";
import { useI18n } from "../lib/i18n";
import { useStreets, useCreateStreet, useUpdateStreet, useRemoveStreet } from "../queries/registry";

type Form = { id?: number; code: string; name: string; quartier: string; description: string };

export default function Streets() {
  const { t } = useI18n();
  const list = useStreets();
  const create = useCreateStreet();
  const update = useUpdateStreet();
  const remove = useRemoveStreet();
  const [form, setForm] = useState<Form | null>(null);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => f && { ...f, [k]: e.target.value });
  const nextCode = `R${String((list.data?.length ?? 0) + 1).padStart(2, "0")}`;
  const submit = () => {
    if (!form) return;
    const p = { code: form.code, name: form.name, quartier: form.quartier || null, description: form.description || null };
    const done = { onSuccess: () => setForm(null) };
    if (form.id) update.mutate({ id: form.id, ...p }, done);
    else create.mutate(p, done);
  };
  const max = Math.max(1, ...(list.data ?? []).map((s) => s.buildingCount));

  return (
    <div>
      <PageHeader title={t("streets")} sub={`${list.data?.length ?? 0} ${t("statStreets").toLowerCase()}`} actions={<Btn onClick={() => setForm({ code: nextCode, name: "", quartier: "", description: "" })}><Plus className="size-4" />{t("add")}</Btn>} />
      {list.isLoading ? <Loading /> : !list.data?.length ? <Card><Empty text={t("noData")} /></Card> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.data.map((s, i) => (
            <Card key={s.id} delay={i * 0.03} className="group relative overflow-hidden p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-xl border-2 border-or bg-vert px-3 py-2 text-center">
                  <div className="text-[9px] uppercase tracking-widest text-or-2">{t("street")}</div>
                  <div className="font-display text-xl font-semibold text-blanc">{s.code}</div>
                </div>
                <div className="flex gap-1 opacity-60 transition group-hover:opacity-100">
                  <IconBtn onClick={() => setForm({ id: s.id, code: s.code, name: s.name, quartier: s.quartier ?? "", description: s.description ?? "" })}><Pencil className="size-4" /></IconBtn>
                  <IconBtn className="hover:text-terre" onClick={() => confirm(t("confirmDelete")) && remove.mutate({ id: s.id })}><Trash2 className="size-4" /></IconBtn>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-vert">{s.name}</h3>
              <p className="text-sm text-gris">{s.quartier ?? "—"}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-beige"><div className="h-full rounded-full bg-or" style={{ width: `${(s.buildingCount / max) * 100}%` }} /></div>
                <span className="tnum text-sm font-semibold">{s.buildingCount} {t("buildings_n")}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Drawer open={!!form} onClose={() => setForm(null)} title={form?.id ? t("edit") : t("add")} footer={<><Btn variant="ghost" onClick={() => setForm(null)}>{t("cancel")}</Btn><Btn loading={create.isPending || update.isPending} disabled={!form?.name || !form?.code} onClick={submit}>{t("save")}</Btn></>}>
        {form && (
          <div className="grid grid-cols-3 gap-4">
            <Field label={t("code")}><Input value={form.code} onChange={set("code")} /></Field>
            <Field label={t("name")} className="col-span-2"><Input value={form.name} onChange={set("name")} placeholder="Rue du Marché" /></Field>
            <Field label={t("quartier")} className="col-span-3"><Input value={form.quartier} onChange={set("quartier")} /></Field>
            <Field label={t("description")} className="col-span-3"><Textarea value={form.description} onChange={set("description")} /></Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}
