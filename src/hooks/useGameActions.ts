import { db } from '../firebase';
import { doc, setDoc, updateDoc, writeBatch, serverTimestamp, deleteDoc, increment } from 'firebase/firestore';
import { Room, Player } from './useGame';

export function useGameActions(roomId: string, userId: string) {
  const joinRoom = async (displayName: string, photoURL: string) => {
    try {
      const pRef = doc(db, 'rooms', roomId, 'players', userId);
      await setDoc(pRef, {
        userId,
        displayName,
        photoURL,
        secretNumber: null,
        isEliminated: false,
        joinedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Join room error:", error);
      throw error;
    }
  };

  const leaveRoom = async (isHost: boolean) => {
    try {
      if (isHost) {
        // If host leaves, close the room
        const rRef = doc(db, 'rooms', roomId);
        await updateDoc(rRef, { status: 'closed' });
      } else {
        // If normal player leaves, remove them from players collection
        const pRef = doc(db, 'rooms', roomId, 'players', userId);
        await deleteDoc(pRef);
      }
    } catch (error) {
      console.error("Leave room error:", error);
      throw error;
    }
  };

  const setSecretNumber = async (num: number) => {
    try {
      const pRef = doc(db, 'rooms', roomId, 'players', userId);
      await updateDoc(pRef, { secretNumber: num });
    } catch (error) {
      console.error("Set secret number error:", error);
      throw error;
    }
  };

  const startGame = async (players: Player[]) => {
    try {
      const rRef = doc(db, 'rooms', roomId);
      const turnOrder = players.map(p => p.userId);
      await updateDoc(rRef, {
        status: 'playing',
        turnOrder,
        turn: turnOrder[0],
        guesses: []
      });
    } catch (error) {
      console.error("Start game error:", error);
      throw error;
    }
  };

  const makeGuess = async (guess: number, room: Room, players: Player[]) => {
    try {
      const batch = writeBatch(db);
      const rRef = doc(db, 'rooms', roomId);
      
      const newGuesses = [...(room.guesses || []), guess];
      
      const eliminatedThisTurn: string[] = [];
      players.forEach(p => {
        if (p.secretNumber === guess && !p.isEliminated) {
          eliminatedThisTurn.push(p.userId);
          const pRef = doc(db, 'rooms', roomId, 'players', p.userId);
          batch.update(pRef, { isEliminated: true });
        }
      });

      const activePlayers = players.filter(p => !p.isEliminated && !eliminatedThisTurn.includes(p.userId));
      
      let nextStatus = room.status;
      let loser = room.loser;
      let nextTurn = room.turn;

      if (activePlayers.length <= 1) {
        nextStatus = 'finished';
        loser = activePlayers.length === 1 ? activePlayers[0].userId : null;
      } else {
        const currentIndex = room.turnOrder.indexOf(room.turn);
        for (let i = 1; i <= room.turnOrder.length; i++) {
          const nextIndex = (currentIndex + i) % room.turnOrder.length;
          const nextUserId = room.turnOrder[nextIndex];
          if (activePlayers.find(p => p.userId === nextUserId)) {
            nextTurn = nextUserId;
            break;
          }
        }
      }

      batch.update(rRef, {
        guesses: newGuesses,
        status: nextStatus,
        turn: nextTurn,
        loser
      });

      await batch.commit();
    } catch (error) {
      console.error("Make guess error:", error);
      throw error;
    }
  };

  return { joinRoom, leaveRoom, setSecretNumber, startGame, makeGuess };
}
