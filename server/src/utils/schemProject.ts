// src/schemas/project.schema.ts
import { z } from "zod";

/** Allowed work types (matches DB enum) */
export const WorkTypeEnum = z.enum([
  "renovation",
  "new_build",
  "maintenance",
  "electrical",
  "plumbing",
  "masonry",
  "other"
]);

/** ISO date string YYYY-MM-DD (kept as string for DB insert) */
export const IsoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected ISO date string (YYYY-MM-DD)");

/** data:image/<type>;base64,<payload> */
export const DataUrlImage = z
  .string()
  .regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/, "Expected image data URL");

/** Team member snapshot coming from UI */
export const TeamMemberDto = z.object({
  id: z.string(), // client-side/mock id
  fullName: z.string().min(1, "Full name is required"),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  userId: z.string().optional() // external system id if any
});

/** Create Project payload from frontend */
export const CreateProjectDto = z.object({
  name: z.string().min(2, "Project name must be at least 2 chars"),
  location: z.string().min(2, "Location must be at least 2 chars"),
  projectId: z.string().min(6, "Project ID must be at least 6 chars"),

  startDate: IsoDateString.optional(),
  endDate: IsoDateString.optional(),

  supervisor: z.string().optional(),
  workType: WorkTypeEnum.optional(),
  notes: z.string().optional(),

  planImageDataUrl: DataUrlImage.optional(),

  allowGps: z.boolean().default(false),
  clientName: z.string().optional(),
  budgetEUR: z.number().nonnegative().optional(),

  teamMembers: z.array(TeamMemberDto).optional()
});

/** Inferred types */
export type WorkType = z.infer<typeof WorkTypeEnum>;
export type TeamMemberInput = z.infer<typeof TeamMemberDto>;
export type CreateProjectInput = z.infer<typeof CreateProjectDto>;
