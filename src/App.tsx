import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Home } from './screens/Home';
import { RoomScreen } from './screens/RoomScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setIsLoggingIn(true);
    try {
      await login(playerName.trim());
    } catch (error) {
      console.error("Login error:", error);
      alert("Giriş yapılamadı. Firebase konsolundan 'Anonymous' (Anonim) girişin açık olduğundan emin olun.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Mayın Tarlası</h1>
          <p className="mb-8 text-gray-500">Gizli sayını seç, söylenen sayılardan kaç, sona kalan kaybeder!</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Oyundaki Adın"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="text-center text-lg h-12"
            />
            <Button
              type="submit"
              disabled={!playerName.trim() || isLoggingIn}
              className="w-full py-6 text-lg"
            >
              {isLoggingIn ? "Giriş Yapılıyor..." : "Oyuna Gir"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (roomId) {
    return <RoomScreen roomId={roomId} user={user} onLeave={() => setRoomId(null)} />;
  }

  return <Home user={user} onJoinRoom={setRoomId} onLogout={logout} />;
}
