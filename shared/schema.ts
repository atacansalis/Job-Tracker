import { pgTable, serial, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const STATUSES = [
  "Bookmarked",
  "Applied",
  "Phone Screen",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export const INTEREST_LEVELS = ["High", "Medium", "Low"] as const;
export const WORK_MODES = ["Remote", "Hybrid", "On-site"] as const;

export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  jobUrl: text("job_url"),
  status: text("status").notNull().default("Bookmarked"),
  interestLevel: text("interest_level").notNull().default("Medium"),
  targetSalary: numeric("target_salary", { precision: 12, scale: 2 }),
  jobLocation: text("job_location"),
  workMode: text("work_mode"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  status: z.enum(STATUSES).default("Bookmarked"),
  interestLevel: z.enum(INTEREST_LEVELS).default("Medium"),
  targetSalary: z.string().optional().nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) => val === null || val === undefined || /^\d+(\.\d{1,2})?$/.test(val),
      { message: "Target salary must be a valid number" }
    ),
  jobUrl: z.string().optional().nullable(),
  jobLocation: z.string().optional().nullable()
    .transform((val) => (val === "" ? null : val?.trim() || null)),
  workMode: z.string().optional().nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) => val === null || val === undefined || WORK_MODES.includes(val as (typeof WORK_MODES)[number]),
      { message: `Work mode must be one of: ${WORK_MODES.join(", ")}` }
    ),
  notes: z.string().optional().nullable(),
});

export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;
