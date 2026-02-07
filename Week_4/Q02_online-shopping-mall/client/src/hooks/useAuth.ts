import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useAuth() {
  const { user, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();

    // Sync user to Supabase via our server
    await api.post(
      '/auth/sync',
      {
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setAuth(
      {
        id: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || undefined,
      },
      token,
    );

    navigate('/');
  }, [setAuth, navigate]);

  const logout = useCallback(async () => {
    await signOut(auth);
    clearAuth();
    navigate('/');
  }, [clearAuth, navigate]);

  return { user, loginWithGoogle, logout, isLoggedIn: !!user };
}
