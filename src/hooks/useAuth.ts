import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User, signInAnonymously, updateProfile, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
      try {
        await setDoc(userRef, {
          displayName: playerName,
          wins: 0,
          losses: 0,
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${newUser.uid}`);
      }

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
