import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, setDoc, updateDoc, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Room {
  id: string;
  hostId: string;
  maxNumber: number;
  requiredPlayers: number;
  status: RoomStatus;
  turn: string;
  turnOrder: string[];
  guesses: number[];
  loser: string | null;
  createdAt: any;
}

export interface Player {
  userId: string;
  displayName: string;
  photoURL: string;
  secretNumber: number | null;
  isEliminated: boolean;
  joinedAt: any;
}

export function useGame(roomId: string | null, userId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setPlayers([]);
      setLoading(false);
      return;
    }

    const roomRef = doc(db, 'rooms', roomId);
    const playersRef = collection(db, 'rooms', roomId, 'players');

    const unsubRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoom({ id: snapshot.id, ...snapshot.data() } as Room);
      } else {
        setRoom(null);
      }
      setLoading(false);
    });

    const unsubPlayers = onSnapshot(playersRef, (snapshot) => {
      const p = snapshot.docs.map(d => ({ userId: d.id, ...d.data() } as Player));
      p.sort((a, b) => {
        const timeA = a.joinedAt?.toMillis ? a.joinedAt.toMillis() : Date.now();
        const timeB = b.joinedAt?.toMillis ? b.joinedAt.toMillis() : Date.now();
        return timeA - timeB;
      });
      setPlayers(p);
    });

    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [roomId]);

  return { room, players, loading };
}
