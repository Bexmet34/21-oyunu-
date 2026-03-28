import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User, signInAnonymously, updateProfile, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Ensure user document exists in Firestore for stats
        const userRef = doc(db, 'users', u.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: u.displayName || 'İsimsiz',
              wins: 0,
              losses: 0,
              createdAt: serverTimestamp()
            });
          } else if (u.displayName && userSnap.data().displayName !== u.displayName) {
            // Keep Firestore display name in sync if it changed
            await updateDoc(userRef, { displayName: u.displayName });
          }
        } catch (e) {
          console.error("Auth state Firestore error:", e);
        }
      }
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (playerName: string) => {
    try {
      const { user: newUser } = await signInAnonymously(auth);
      const photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${playerName}`;
      await updateProfile(newUser, {
        displayName: playerName,
        photoURL: photoURL
      });

      // Create/Update user doc immediately
      const userRef = doc(db, 'users', newUser.uid);
      await setDoc(userRef, {
        displayName: playerName,
        wins: 0,
        losses: 0,
        createdAt: serverTimestamp()
      }, { merge: true });

      setUser({ ...newUser, displayName: playerName, photoURL: photoURL } as User);
    } catch (error: any) {
      console.error("Detailed Login Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, login, logout };
}
