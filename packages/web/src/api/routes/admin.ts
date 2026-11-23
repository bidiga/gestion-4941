import { z } from "zod";
import { sql } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";

export const DEFAULT_SETTINGS: Record<string, string> = {
  villageName: "Somankidy",
  commune: "Commune urbaine de Somankidy",
  cercle: "Cercle de Kayes",
  region: "Région de Kayes",
  chefVillage: "",
  platePrefix: "SMK",
  centerLat: "14.54694",
  centerLng: "-11.60694",
  zoom: "16",
};

async function getSettings() {
  const rows = await db.select().from(s.settings);
  const out = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export const settings = {
  get: base.handler(getSettings),
  save: base.input(z.record(z.string(), z.string())).handler(async ({ input }) => {
    for (const [key, value] of Object.entries(input)) {
      await db
        .insert(s.settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: s.settings.key, set: { value } });
    }
    return getSettings();
  }),
};

const count = async (t: typeof s.buildings | typeof s.streets | typeof s.families | typeof s.members) => {
  const [r] = await db.select({ n: sql<number>`count(*)` }).from(t);
  return Number(r?.n ?? 0);
};

export const stats = {
  overview: base.handler(async () => {
    const [buildings, streets, families, members] = await Promise.all([
      count(s.buildings),
      count(s.streets),
      count(s.families),
      count(s.members),
    ]);
    const byType = await db
      .select({ k: s.buildings.type, n: sql<number>`count(*)` })
      .from(s.buildings)
      .groupBy(s.buildings.type);
    const byStatus = await db
      .select({ k: s.buildings.status, n: sql<number>`count(*)` })
      .from(s.buildings)
      .groupBy(s.buildings.status);
    const bySex = await db
      .select({ k: s.members.sex, n: sql<number>`count(*)` })
      .from(s.members)
      .groupBy(s.members.sex);
    const years = await db.select({ y: s.members.birthYear }).from(s.members);
    const now = new Date().getFullYear();
    const bands = [
      { k: "0-5", min: 0, max: 5 },
      { k: "6-14", min: 6, max: 14 },
      { k: "15-24", min: 15, max: 24 },
      { k: "25-39", min: 25, max: 39 },
      { k: "40-59", min: 40, max: 59 },
      { k: "60+", min: 60, max: 200 },
    ].map((b) => ({
      k: b.k,
      n: years.filter((r) => r.y && now - r.y >= b.min && now - r.y <= b.max).length,
    }));
    const byStreet = await db
      .select({ k: s.streets.name, n: sql<number>`count(${s.buildings.id})` })
      .from(s.streets)
      .leftJoin(s.buildings, sql`${s.buildings.streetId} = ${s.streets.id}`)
      .groupBy(s.streets.id);
    const recent = await db
      .select()
      .from(s.buildings)
      .orderBy(sql`created_at desc`)
      .limit(6);
    const located = await db
      .select({ n: sql<number>`count(*)` })
      .from(s.buildings)
      .where(sql`lat is not null`);
    const norm = (a: { k: string | null; n: number }[]) => a.map((x) => ({ k: x.k ?? "—", n: Number(x.n) }));
    return {
      buildings,
      streets,
      families,
      members,
      located: Number(located[0]?.n ?? 0),
      avgFamilySize: families ? Math.round((members / families) * 10) / 10 : 0,
      byType: norm(byType),
      byStatus: norm(byStatus),
      bySex: norm(bySex),
      byAge: bands,
      byStreet: norm(byStreet),
      recent,
    };
  }),
};

// ---------- démonstration ----------
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const NOMS = ["Soumaré", "Diakité", "Sylla", "Camara", "Doucouré", "Traoré", "Sissoko", "Konaté", "Dramé", "Cissé", "Tandia", "Bathily", "Kanouté", "Diawara", "Gandega", "Sakho", "Niakaté", "Touré", "Fofana", "Diallo"];
const HOMMES = ["Mamadou", "Moussa", "Siré", "Bakary", "Samba", "Ousmane", "Demba", "Hamady", "Boubacar", "Ibrahima", "Sékou", "Kalidou", "Djibril", "Mahamadou", "Abdoulaye"];
const FEMMES = ["Fatoumata", "Aminata", "Mariam", "Kadiatou", "Hawa", "Djeneba", "Coumba", "Assa", "Sira", "Ramata", "Diaba", "Oumou", "Khadija"];
const METIERS = ["Cultivateur", "Éleveur", "Commerçant", "Ménagère", "Élève", "Enseignant", "Maçon", "Pêcheur", "Couturière", "Infirmier", null];

export const admin = {
  seedDemo: base.handler(async () => {
    const existing = await count(s.buildings);
    if (existing > 0) return { ok: false, message: "Des données existent déjà" };
    const r = rng(42);
    const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]!;
    const streetsData = [
      { code: "R01", name: "Rue de la Grande Mosquée", quartier: "Centre" },
      { code: "R02", name: "Rue du Marché", quartier: "Centre" },
      { code: "R03", name: "Avenue du Fleuve Sénégal", quartier: "Bord du fleuve" },
      { code: "R04", name: "Rue de l'École", quartier: "Nord" },
      { code: "R05", name: "Rue du Centre de Santé", quartier: "Est" },
      { code: "R06", name: "Rue Siré Soumaré", quartier: "Ouest" },
      { code: "R07", name: "Rue des Jardins", quartier: "Sud" },
    ];
    const st = await db.insert(s.streets).values(streetsData).returning();
    const types = ["habitation", "habitation", "habitation", "habitation", "habitation", "commerce", "commerce", "religieux", "education", "sante", "administratif"];
    const statuses = ["occupe", "occupe", "occupe", "occupe", "vacant", "construction"];
    const cLat = 14.54694;
    const cLng = -11.60694;
    const seq = new Map<number, number>();
    const bVals = [];
    for (let i = 0; i < 42; i++) {
      const street = st[i % st.length]!;
      const n = (seq.get(street.id) ?? 0) + 1;
      seq.set(street.id, n);
      const type = i < 3 ? ["religieux", "education", "sante"][i]! : pick(types);
      bVals.push({
        number: `SMK-${street.code}-${String(n).padStart(3, "0")}`,
        streetId: street.id,
        type,
        status: type === "habitation" ? pick(statuses) : "occupe",
        ownerName: `${pick(HOMMES)} ${pick(NOMS)}`,
        phone: `+223 7${Math.floor(r() * 10)} ${Math.floor(10 + r() * 89)} ${Math.floor(10 + r() * 89)} ${Math.floor(10 + r() * 89)}`,
        rooms: 2 + Math.floor(r() * 8),
        lat: cLat + (r() - 0.5) * 0.008,
        lng: cLng + (r() - 0.5) * 0.01,
      });
    }
    const bs = await db.insert(s.buildings).values(bVals).returning();
    const homes = bs.filter((b) => b.type === "habitation" && b.status === "occupe");
    const now = new Date().getFullYear();
    for (const home of homes) {
      const nf = r() > 0.75 ? 2 : 1;
      for (let k = 0; k < nf; k++) {
        const nom = pick(NOMS);
        const chef = pick(HOMMES);
        const [fam] = await db
          .insert(s.families)
          .values({ name: nom, headName: `${chef} ${nom}`, headPhone: home.phone, buildingId: home.id })
          .returning();
        const mems: (typeof s.members.$inferInsert)[] = [
          { familyId: fam!.id, firstName: chef, lastName: nom, sex: "M", birthYear: now - 40 - Math.floor(r() * 30), relation: "chef", occupation: "Cultivateur", phone: home.phone },
          { familyId: fam!.id, firstName: pick(FEMMES), lastName: pick(NOMS), sex: "F", birthYear: now - 25 - Math.floor(r() * 25), relation: "epouse", occupation: "Ménagère" },
        ];
        const kids = 2 + Math.floor(r() * 6);
        for (let c = 0; c < kids; c++) {
          const f = r() > 0.5;
          mems.push({ familyId: fam!.id, firstName: f ? pick(FEMMES) : pick(HOMMES), lastName: nom, sex: f ? "F" : "M", birthYear: now - Math.floor(r() * 24), relation: "enfant", occupation: pick(METIERS) });
        }
        if (r() > 0.7) mems.push({ familyId: fam!.id, firstName: pick(FEMMES), lastName: nom, sex: "F", birthYear: now - 65 - Math.floor(r() * 15), relation: "parent" });
        await db.insert(s.members).values(mems);
      }
    }
    await db.insert(s.agents).values([
      { name: "Siré Soumaré", role: "admin", phone: "+223 76 00 00 01" },
      { name: "Aminata Diakité", role: "agent", phone: "+223 76 00 00 02" },
      { name: "Moussa Camara", role: "lecteur", phone: "+223 76 00 00 03" },
    ]);
    return { ok: true, message: "Données de démonstration chargées" };
  }),
  resetAll: base.input(z.object({ confirm: z.literal("EFFACER") })).handler(async () => {
    await db.delete(s.members);
    await db.delete(s.families);
    await db.delete(s.buildings);
    await db.delete(s.streets);
    await db.delete(s.agents);
    return { ok: true };
  }),
};
