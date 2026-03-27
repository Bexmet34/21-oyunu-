import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Plus, LogIn } from 'lucide-react';

interface HomeProps {
  user: User;
  onJoinRoom: (roomId: string) => void;
  onLogout: () => void;
}

export function Home({ user, onJoinRoom, onLogout }: HomeProps) {
  const [joinCode, setJoinCode] = useState('');
  const [maxNumber, setMaxNumber] = useState(21);
  const [loading, setLoading] = useState(false);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    const roomId = generateRoomId();
    try {
      await setDoc(doc(db, 'rooms', roomId), {
        id: roomId,
        hostId: user.uid,
        maxNumber,
        status: 'waiting',
        turn: '',
        turnOrder: [],
        guesses: [],
        loser: null,
        createdAt: serverTimestamp()
      });
      onJoinRoom(roomId);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Oda oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length > 0) {
      onJoinRoom(joinCode.trim().toUpperCase());
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-4 pt-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={user.photoURL || ''} alt="Profile" className="h-10 w-10 rounded-full" />
            <div>
              <p className="text-sm text-gray-500">Hoş geldin,</p>
              <p className="font-semibold text-gray-900">{user.displayName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Oda Oluştur</h2>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Oyun Bitiş Sayısı</label>
              <div className="flex gap-2">
                {[21, 31, 41, 51].map(num => (
                  <button
                    key={num}
                    onClick={() => setMaxNumber(num)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                      maxNumber === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleCreateRoom} 
              disabled={loading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Oyun Kur
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">veya</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Odaya Katıl</h2>
            <form onSubmit={handleJoinRoom} className="flex gap-2">
              <Input
                placeholder="Oda Kodu (örn: A1B2C3)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="uppercase"
                maxLength={6}
              />
              <Button type="submit" disabled={!joinCode.trim()}>
                <LogIn className="mr-2 h-4 w-4" />
                Katıl
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
