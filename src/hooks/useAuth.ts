import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { User, signInAnonymously, updateProfile, signOut } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (playerName: string) => {
    const { user: newUser } = await signInAnonymously(auth);
    await updateProfile(newUser, {
      displayName: playerName,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${playerName}`
    });
    // Force refresh of user state to get the new displayName
    setUser({ ...newUser, displayName: playerName, photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${playerName}` } as User);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, login, logout };
}
