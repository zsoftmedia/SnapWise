import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  APP_ORIGIN: z.string().default("http://localhost:3000"),

  SUPABASE_URL: z.string().url({ message: "Missing SUPABASE_URL (set it in server/.env)" }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { message: "Missing SUPABASE_SERVICE_ROLE_KEY (set it in server/.env)" }),
  SUPABASE_BUCKET: z.string().default("project-plans")
});

export const env = EnvSchema.parse(process.env);
