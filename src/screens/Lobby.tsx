import React, { useState } from 'react';
import { Room, Player } from '../hooks/useGame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, Play, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface LobbyProps {
  room: Room;
  players: Player[];
  me: Player | undefined;
  onSetSecretNumber: (num: number) => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export function Lobby({ room, players, me, onSetSecretNumber, onStartGame, onLeave }: LobbyProps) {
  const [secretInput, setSecretInput] = useState('');
  const [copied, setCopied] = useState(false);

  const isHost = room.hostId === me?.userId;
  const allReady = players.length > 1 && players.every(p => p.secretNumber !== null);

  const handleCopy = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetSecret = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(secretInput, 10);
    if (!isNaN(num) && num >= 1 && num <= room.maxNumber) {
      onSetSecretNumber(num);
    } else {
      alert(`Lütfen 1 ile ${room.maxNumber} arasında bir sayı girin.`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4 pt-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onLeave}>
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-700">
            <span className="text-sm font-medium">Oda Kodu:</span>
            <span className="font-mono text-lg font-bold tracking-wider">{room.id}</span>
            <button onClick={handleCopy} className="ml-1 text-blue-500 hover:text-blue-700">
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="mb-2 text-xl font-bold text-gray-900">Gizli Sayını Seç</h2>
          <p className="mb-4 text-sm text-gray-500">
            1 ile {room.maxNumber} arasında kimsenin bilmediği bir sayı seç.
          </p>
          
          {me?.secretNumber ? (
            <div className="flex items-center justify-between rounded-xl bg-green-50 p-4 border border-green-100">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Sayın kaydedildi!</span>
              </div>
              <span className="font-mono text-xl font-bold text-green-800">{me.secretNumber}</span>
            </div>
          ) : (
            <form onSubmit={handleSetSecret} className="flex gap-2">
              <Input
                type="number"
                min={1}
                max={room.maxNumber}
                placeholder={`1 - ${room.maxNumber}`}
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                className="text-lg"
              />
              <Button type="submit" disabled={!secretInput}>
                Kaydet
              </Button>
            </form>
          )}
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Users className="h-5 w-5 text-gray-500" />
              Oyuncular
            </h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {players.length} Kişi
            </span>
          </div>
          
          <div className="space-y-3">
            {players.map(p => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={p.userId} 
                className="flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <img src={p.photoURL || ''} alt="" className="h-8 w-8 rounded-full" />
                  <span className="font-medium text-gray-900">
                    {p.displayName} {p.userId === me?.userId && "(Sen)"}
                  </span>
                </div>
                {p.secretNumber ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Hazır
                  </span>
                ) : (
                  <span className="text-xs font-medium text-orange-500">Sayı Seçiyor...</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {isHost ? (
          <Button 
            className="w-full py-6 text-lg" 
            size="lg"
            onClick={onStartGame} 
            disabled={!allReady}
          >
            <Play className="mr-2 h-5 w-5" />
            {allReady ? 'Oyunu Başlat' : 'Herkesin Hazır Olması Bekleniyor'}
          </Button>
        ) : (
          <div className="rounded-xl bg-blue-50 p-4 text-center border border-blue-100">
            <p className="text-sm font-medium text-blue-800">
              Kurucunun oyunu başlatması bekleniyor...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
