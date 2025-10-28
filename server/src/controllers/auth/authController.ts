import type { Request, Response } from 'express';
import { sbAdmin } from '../../utils/lib/supabse';
import { ProfileModel } from '../../models/userProfile/userProfile';


const redirectTo = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/auth/callback`;

export const AuthController = {
  // POST /auth/signup
  signup: async (req: Request, res: Response) => {
    try {
      const { email, password, fullName } = req.body as { email: string; password: string; fullName?: string };

      // 1) Create user pending confirmation
      const { data, error } = await sbAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name: fullName ?? '' },
        app_metadata: { provider: 'email' }
      });
      if (error) return res.status(400).json({ error: error.message });

      // 2) Send confirmation/invite email
      const { error: inviteErr } = await sbAdmin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (inviteErr) console.warn('inviteUserByEmail error:', inviteErr.message);

      // (optional) If you want to proactively ensure profile exists (trigger also does it)
      try {
        if (data.user?.id) {
          await ProfileModel.upsert({
            id: data.user.id,
            email: data.user.email ?? email,
            full_name: (data.user.user_metadata as any)?.full_name ?? fullName ?? ''
          });
        }
      } catch (e) {
        // safe to ignore due to trigger + on conflict
        console.warn('profile upsert warn:', (e as any)?.message);
      }

      return res.status(201).json({
        userId: data.user?.id,
        message: 'Signup started. Please check your email to confirm your account.'
      });
    } catch (e: any) {
      console.error('signup error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // POST /auth/login (checks confirmation state only)
  login: async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email: string; password: string };

      const { data: list, error: listErr } = await sbAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (listErr) return res.status(400).json({ error: listErr.message });

      const user = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

      if (!user.email_confirmed_at) {
        return res.status(403).json({ error: 'Please confirm your email before logging in.' });
      }

      // Let frontend do: supabase.auth.signInWithPassword({ email, password })
      return res.status(200).json({ ok: true, message: 'Email confirmed. Use frontend login to create a session.' });
    } catch (e: any) {
      console.error('login error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // POST /auth/resend
  resend: async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email: string };

      const { data: list, error: listErr } = await sbAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (listErr) return res.status(400).json({ error: listErr.message });

      const user = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(200).json({ message: 'If the account exists, a confirmation email will be sent.' });
      }

      if (user.email_confirmed_at) {
        return res.status(200).json({ message: 'Email already confirmed. You can log in.' });
      }

      const { error } = await sbAdmin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (error) return res.status(400).json({ error: error.message });

      return res.status(200).json({ message: 'Confirmation email sent.' });
    } catch (e: any) {
      console.error('resend error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // GET /auth/me  (demo: reads x-user-id header)
  me: async (req: Request, res: Response) => {
    try {
      const userId = String(req.header('x-user-id') || '');
      if (!userId) return res.status(401).json({ error: 'Missing user id.' });

      const { data: userRes, error: userErr } = await sbAdmin.auth.admin.getUserById(userId);
      if (userErr || !userRes.user) return res.status(404).json({ error: 'User not found.' });

      const profile = await ProfileModel.getById(userId);
      return res.json({ user: userRes.user, profile: profile ?? null });
    } catch (e: any) {
      console.error('me error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};
