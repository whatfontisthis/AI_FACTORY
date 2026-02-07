import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../config/supabase';

export const authRoutes = Router();

// Sync Firebase user to Supabase
authRoutes.post('/sync', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { uid, email } = req;
    const { displayName, photoURL } = req.body;

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          firebase_uid: uid,
          email,
          display_name: displayName,
          photo_url: photoURL,
        },
        { onConflict: 'firebase_uid' },
      )
      .select()
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Get current user profile
authRoutes.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', req.uid)
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});
