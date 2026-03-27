import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useGame } from '../hooks/useGame';
import { useGameActions } from '../hooks/useGameActions';
import { Lobby } from './Lobby';
import { Game } from './Game';
import { GameOver } from './GameOver';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface RoomScreenProps {
  roomId: string;
  user: User;
  onLeave: () => void;
}

export function RoomScreen({ roomId, user, onLeave }: RoomScreenProps) {
  const { room, players, loading } = useGame(roomId, user.uid);
  const { joinRoom, setSecretNumber, startGame, makeGuess } = useGameActions(roomId, user.uid);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!loading && room && !hasJoined) {
      const me = players.find(p => p.userId === user.uid);
      if (!me) {
        joinRoom(user.displayName || 'Oyuncu', user.photoURL || '');
      }
      setHasJoined(true);
    }
  }, [loading, room, players, user, hasJoined, joinRoom]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Oda Bulunamadı</h2>
        <p className="mb-6 text-gray-500">Bu oda kodu geçersiz veya oyun sona ermiş olabilir.</p>
        <Button onClick={onLeave}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  const me = players.find(p => p.userId === user.uid);

  if (room.status === 'waiting') {
    return (
      <Lobby 
        room={room} 
        players={players} 
        me={me} 
        onSetSecretNumber={setSecretNumber} 
        onStartGame={() => startGame(players)} 
        onLeave={onLeave} 
      />
    );
  }

  if (room.status === 'playing') {
    return (
      <Game 
        room={room} 
        players={players} 
        me={me} 
        onMakeGuess={(guess) => makeGuess(guess, room, players)} 
        onLeave={onLeave} 
      />
    );
  }

  if (room.status === 'finished') {
    return (
      <GameOver 
        room={room} 
        players={players} 
        me={me} 
        onLeave={onLeave} 
      />
    );
  }

  return null;
}
