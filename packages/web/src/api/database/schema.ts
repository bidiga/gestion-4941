import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());

export const streets = sqliteTable("streets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  quartier: text("quartier"),
  description: text("description"),
  createdAt: createdAt(),
});

export const buildings = sqliteTable("buildings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number").notNull(),
  streetId: integer("street_id"),
  type: text("type").notNull().default("habitation"),
  status: text("status").notNull().default("occupe"),
  ownerName: text("owner_name"),
  phone: text("phone"),
  rooms: integer("rooms"),
  lat: real("lat"),
  lng: real("lng"),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const families = sqliteTable("families", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  headName: text("head_name").notNull(),
  headPhone: text("head_phone"),
  buildingId: integer("building_id"),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  familyId: integer("family_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  sex: text("sex").notNull().default("M"),
  birthYear: integer("birth_year"),
  relation: text("relation").notNull().default("enfant"),
  occupation: text("occupation"),
  phone: text("phone"),
  createdAt: createdAt(),
});

export const agents = sqliteTable("agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull().default("agent"),
  phone: text("phone"),
  email: text("email"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
