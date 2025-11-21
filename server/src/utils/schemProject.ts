// utils/schemProject.ts
import { z } from "zod";

// ✅ Team Member Schema
export const TeamMemberDto = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  avatarPreview: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  role: z.enum(["owner", "admin", "supervisor", "member", "viewer"]),
  status: z.enum(["invited", "active", "suspended"]).optional(),
  invitedBy: z.string().nullable().optional(),
  workplaceId: z.string().nullable().optional(),
});

// ✅ Project Schema
export const CreateProjectDto = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters long"),
  location: z.string().min(2, "Location must be at least 2 characters long"),
  projectId: z.string().min(6, "Project ID must be at least 6 characters long"),

  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  supervisor: z.string().optional().nullable(),
  workType: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  planImageDataUrl: z.string().optional().nullable(),

  allowGps: z.boolean().optional().default(false),
  clientName: z.string().optional().nullable(),
  budgetEUR: z.number().nonnegative().optional().nullable(),

  teamMembers: z.array(TeamMemberDto).optional(),
});

// ✅ Type Inference
export type TeamMember = z.infer<typeof TeamMemberDto>;
export type CreateProjectInput = z.infer<typeof CreateProjectDto>;
