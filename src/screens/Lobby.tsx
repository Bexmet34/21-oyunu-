import React, { useState } from 'react';
import { Room, Player } from '../hooks/useGame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, Play, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
  const [showSecret, setShowSecret] = useState(false);
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
    <div className="flex min-h-[100dvh] flex-col bg-slate-950 p-4 pt-8 text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onLeave} className="text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-4 py-2">
            <span className="text-[13px] font-medium text-slate-400">Oda Kodu:</span>
            <span className="font-mono text-[15px] font-bold tracking-wider text-white">{room.id}</span>
            <button onClick={handleCopy} className="ml-1 text-indigo-400 hover:text-indigo-300 transition-colors">
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border-4 border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-2 text-[20px] font-bold tracking-tight text-white">Gizli Sayını Seç</h2>
          <p className="mb-5 text-[14px] text-slate-400">
            1 ile {room.maxNumber} arasında kimsenin bilmediği bir sayı seç.
          </p>
          
          {me?.secretNumber ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-950/30 p-4 border-2 border-emerald-500/50">
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Sayın kaydedildi!</span>
              </div>
              <span className="font-mono text-2xl font-bold text-emerald-400">**</span>
            </div>
          ) : (
            <form onSubmit={handleSetSecret} className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showSecret ? "number" : "password"}
                  min={1}
                  max={room.maxNumber}
                  placeholder={`1 - ${room.maxNumber}`}
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  className="text-center font-mono text-lg h-12 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowSecret(!showSecret)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showSecret ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
              <Button type="submit" disabled={!secretInput} className="px-6 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                Kaydet
              </Button>
            </form>
          )}
        </div>

        <div className="mb-8 rounded-3xl border-4 border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[17px] font-bold text-white">
              <Users className="h-5 w-5 text-indigo-400" />
              Oyuncular
            </h2>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[12px] font-semibold text-slate-300 border border-slate-700">
              {players.length} Kişi
            </span>
          </div>
          
          <div className="space-y-3">
            {players.map(p => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={p.userId} 
                className="flex items-center justify-between rounded-xl bg-slate-800 p-3 border border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <img src={p.photoURL || ''} alt="" className="h-10 w-10 rounded-full bg-slate-700 shadow-sm" />
                  <span className="font-medium text-white text-[15px]">
                    {p.displayName} {p.userId === me?.userId && <span className="text-slate-500 font-normal">(Sen)</span>}
                  </span>
                </div>
                {p.secretNumber ? (
                  <span className="flex items-center gap-1 text-[13px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                    <CheckCircle2 className="h-4 w-4" />
                    Hazır
                  </span>
                ) : (
                  <span className="text-[13px] font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">Seçiyor...</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {isHost ? (
          <Button 
            className={`w-full rounded-xl py-6 text-lg font-bold transition-all ${
              allReady 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1' 
                : 'bg-slate-800 text-slate-500 border-b-4 border-slate-900 cursor-not-allowed'
            }`}
            onClick={onStartGame} 
            disabled={!allReady}
          >
            {players.length < 2 
              ? `En az 2 kişi gerekli` 
              : allReady 
                ? 'Oyunu Başlat' 
                : 'Herkesin Hazır Olması Bekleniyor'}
          </Button>
        ) : (
          <div className="w-full bg-slate-800 text-slate-400 border-b-4 border-slate-900 rounded-xl py-4 text-center font-bold">
            Kurucunun Başlatması Bekleniyor
          </div>
        )}
      </div>
    </div>
  );
}
