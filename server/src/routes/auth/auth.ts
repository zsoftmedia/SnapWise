import { Router } from "express";
import { z } from "zod";
import { AuthController } from "../../controllers/auth/authController";
import { requireAuth } from "../../utils/middleware/requireAuth";

function validate(schema: z.ZodSchema<any>) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      return res.status(400).json({ ok: false, error: err.errors });
    }
  };
}

const router = Router();

/* ========= Schemas ========= */
const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const ResendSchema = z.object({
  email: z.string().email(),
});

/* 🚀 FIX: ADD THIS MISSING SCHEMA */
const CompleteInviteSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(6),
});

/* ========= Routes ========= */

// Public
router.post("/signup", validate(SignUpSchema), AuthController.signup);
router.post("/login", validate(LoginSchema), AuthController.login);
router.post("/resend", validate(ResendSchema), AuthController.resend);

// Invitation Flow
router.get("/invite/:token", AuthController.verifyInviteToken);
router.post("/invite/complete", validate(CompleteInviteSchema), AuthController.completeInvite);

// Protected
router.get("/me", requireAuth, AuthController.me);

export default router;
