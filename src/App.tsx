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
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = error.message || "Bilinmeyen bir hata oluştu.";
      
      // Check if it's a JSON error from handleFirestoreError
      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.error && parsedError.operationType) {
          errorMessage = `Veritabanı hatası (${parsedError.operationType}): ${parsedError.error}`;
        }
      } catch (e) {
        // Not a JSON error, keep original message
      }

      alert(`Giriş yapılamadı: ${errorMessage}\n\nEğer sorun devam ederse, Firebase konsolundan 'Anonymous' (Anonim) girişin açık olduğundan emin olun.`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 p-8 shadow-2xl border border-slate-800 text-center">
          <h1 className="mb-2 text-4xl font-black tracking-tight text-white">MAYIN TARLASI</h1>
          <p className="mb-8 text-slate-400">Gizli sayını seç, söylenen sayılardan kaç, sona kalan kaybeder!</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Oyundaki Adın"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="text-center text-lg h-14 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-indigo-500"
            />
            <Button
              type="submit"
              disabled={!playerName.trim() || isLoggingIn}
              className="w-full py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
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
