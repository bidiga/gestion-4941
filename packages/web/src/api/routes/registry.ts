import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";

const opt = z.string().trim().optional().nullable();

const streetInput = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  quartier: opt,
  description: opt,
});

export const streets = {
  list: base.handler(async () => {
    const rows = await db.select().from(s.streets).orderBy(s.streets.code);
    const counts = await db
      .select({ streetId: s.buildings.streetId, n: sql<number>`count(*)` })
      .from(s.buildings)
      .groupBy(s.buildings.streetId);
    const map = new Map(counts.map((c) => [c.streetId, Number(c.n)]));
    return rows.map((r) => ({ ...r, buildingCount: map.get(r.id) ?? 0 }));
  }),
  create: base.input(streetInput).handler(async ({ input }) => {
    const [row] = await db.insert(s.streets).values(input).returning();
    return row;
  }),
  update: base
    .input(streetInput.extend({ id: z.number() }))
    .handler(async ({ input: { id, ...v } }) => {
      const [row] = await db.update(s.streets).set(v).where(eq(s.streets.id, id)).returning();
      return row;
    }),
  remove: base.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    await db.update(s.buildings).set({ streetId: null }).where(eq(s.buildings.streetId, input.id));
    await db.delete(s.streets).where(eq(s.streets.id, input.id));
    return { ok: true };
  }),
};

const buildingInput = z.object({
  number: opt,
  streetId: z.number().nullable().optional(),
  type: z.string().default("habitation"),
  status: z.string().default("occupe"),
  ownerName: opt,
  phone: opt,
  rooms: z.number().int().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  notes: opt,
});

async function nextNumber(streetId: number | null | undefined) {
  const [pref] = await db.select().from(s.settings).where(eq(s.settings.key, "platePrefix"));
  const prefix = pref?.value || "SMK";
  let code = "00";
  if (streetId) {
    const [st] = await db.select().from(s.streets).where(eq(s.streets.id, streetId));
    if (st) code = st.code;
  }
  const [c] = await db
    .select({ n: sql<number>`count(*)` })
    .from(s.buildings)
    .where(streetId ? eq(s.buildings.streetId, streetId) : sql`street_id is null`);
  const seq = String(Number(c?.n ?? 0) + 1).padStart(3, "0");
  return `${prefix}-${code}-${seq}`;
}

export const buildings = {
  list: base.handler(async () => {
    const rows = await db
      .select({
        b: s.buildings,
        streetName: s.streets.name,
        streetCode: s.streets.code,
      })
      .from(s.buildings)
      .leftJoin(s.streets, eq(s.buildings.streetId, s.streets.id))
      .orderBy(desc(s.buildings.createdAt));
    const fam = await db
      .select({ buildingId: s.families.buildingId, n: sql<number>`count(*)` })
      .from(s.families)
      .groupBy(s.families.buildingId);
    const fm = new Map(fam.map((f) => [f.buildingId, Number(f.n)]));
    return rows.map((r) => ({
      ...r.b,
      streetName: r.streetName,
      streetCode: r.streetCode,
      familyCount: fm.get(r.b.id) ?? 0,
    }));
  }),
  create: base.input(buildingInput).handler(async ({ input }) => {
    const number = input.number || (await nextNumber(input.streetId));
    const [row] = await db.insert(s.buildings).values({ ...input, number }).returning();
    return row;
  }),
  update: base
    .input(buildingInput.extend({ id: z.number() }))
    .handler(async ({ input: { id, ...v } }) => {
      const number = v.number || (await nextNumber(v.streetId));
      const [row] = await db
        .update(s.buildings)
        .set({ ...v, number })
        .where(eq(s.buildings.id, id))
        .returning();
      if (!row) throw new ORPCError("NOT_FOUND");
      return row;
    }),
  remove: base.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    await db.update(s.families).set({ buildingId: null }).where(eq(s.families.buildingId, input.id));
    await db.delete(s.buildings).where(eq(s.buildings.id, input.id));
    return { ok: true };
  }),
};

const familyInput = z.object({
  name: z.string().trim().min(1),
  headName: z.string().trim().min(1),
  headPhone: opt,
  buildingId: z.number().nullable().optional(),
  notes: opt,
});

export const families = {
  list: base.handler(async () => {
    const rows = await db
      .select({ f: s.families, buildingNumber: s.buildings.number })
      .from(s.families)
      .leftJoin(s.buildings, eq(s.families.buildingId, s.buildings.id))
      .orderBy(s.families.name);
    const cnt = await db
      .select({ familyId: s.members.familyId, n: sql<number>`count(*)` })
      .from(s.members)
      .groupBy(s.members.familyId);
    const cm = new Map(cnt.map((c) => [c.familyId, Number(c.n)]));
    return rows.map((r) => ({ ...r.f, buildingNumber: r.buildingNumber, memberCount: cm.get(r.f.id) ?? 0 }));
  }),
  create: base.input(familyInput).handler(async ({ input }) => {
    const [row] = await db.insert(s.families).values(input).returning();
    await db.insert(s.members).values({
      familyId: row.id,
      firstName: input.headName.split(" ")[0] ?? input.headName,
      lastName: input.name,
      relation: "chef",
      phone: input.headPhone,
    });
    return row;
  }),
  update: base
    .input(familyInput.extend({ id: z.number() }))
    .handler(async ({ input: { id, ...v } }) => {
      const [row] = await db.update(s.families).set(v).where(eq(s.families.id, id)).returning();
      return row;
    }),
  remove: base.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    await db.delete(s.members).where(eq(s.members.familyId, input.id));
    await db.delete(s.families).where(eq(s.families.id, input.id));
    return { ok: true };
  }),
};

const memberInput = z.object({
  familyId: z.number(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  sex: z.enum(["M", "F"]),
  birthYear: z.number().int().nullable().optional(),
  relation: z.string().default("enfant"),
  occupation: opt,
  phone: opt,
});

export const members = {
  list: base.handler(async () => {
    const rows = await db
      .select({ m: s.members, familyName: s.families.name })
      .from(s.members)
      .leftJoin(s.families, eq(s.members.familyId, s.families.id))
      .orderBy(s.members.lastName, s.members.firstName);
    return rows.map((r) => ({ ...r.m, familyName: r.familyName }));
  }),
  create: base.input(memberInput).handler(async ({ input }) => {
    const [row] = await db.insert(s.members).values(input).returning();
    return row;
  }),
  update: base
    .input(memberInput.extend({ id: z.number() }))
    .handler(async ({ input: { id, ...v } }) => {
      const [row] = await db.update(s.members).set(v).where(eq(s.members.id, id)).returning();
      return row;
    }),
  remove: base.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    await db.delete(s.members).where(eq(s.members.id, input.id));
    return { ok: true };
  }),
};

const agentInput = z.object({
  name: z.string().trim().min(1),
  role: z.string(),
  phone: opt,
  email: opt,
  active: z.boolean().default(true),
});

export const agents = {
  list: base.handler(() => db.select().from(s.agents).orderBy(s.agents.name)),
  create: base.input(agentInput).handler(async ({ input }) => {
    const [row] = await db.insert(s.agents).values(input).returning();
    return row;
  }),
  update: base
    .input(agentInput.extend({ id: z.number() }))
    .handler(async ({ input: { id, ...v } }) => {
      const [row] = await db.update(s.agents).set(v).where(eq(s.agents.id, id)).returning();
      return row;
    }),
  remove: base.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    await db.delete(s.agents).where(and(eq(s.agents.id, input.id)));
    return { ok: true };
  }),
};

export const registry = { streets, buildings, families, members, agents };
