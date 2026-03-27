import React, { useEffect } from 'react';
import { Room, Player } from '../hooks/useGame';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Home, RefreshCcw, Skull, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameOverProps {
  room: Room;
  players: Player[];
  me: Player | undefined;
  onLeave: () => void;
}

export function GameOver({ room, players, me, onLeave }: GameOverProps) {
  const loser = players.find(p => p.userId === room.loser);
  const amILoser = me?.userId === room.loser;

  useEffect(() => {
    if (!amILoser) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4f46e5', '#818cf8', '#c7d2fe']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4f46e5', '#818cf8', '#c7d2fe']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [amILoser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-slate-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-slate-900 p-8 shadow-2xl border border-slate-800 text-center"
      >
        <div className="mb-6 flex justify-center">
          {amILoser ? (
            <div className="rounded-full bg-red-950/50 p-6 text-red-500 border border-red-900/50 shadow-lg shadow-red-900/20">
              <Skull className="h-16 w-16" />
            </div>
          ) : (
            <div className="rounded-full bg-emerald-950/50 p-6 text-emerald-400 border border-emerald-900/50 shadow-lg shadow-emerald-900/20">
              <Trophy className="h-16 w-16" />
            </div>
          )}
        </div>

        <h1 className={`mb-2 text-4xl font-black tracking-tight ${amILoser ? 'text-red-400' : 'text-emerald-400'}`}>
          {amILoser ? "KAYBETTİN!" : "KAZANDIN!"}
        </h1>
        <p className="mb-8 text-slate-400 font-medium">
          {amILoser 
            ? "Sona kalan sen oldun ve mayına bastın." 
            : `${loser?.displayName || 'Biri'} sona kaldı ve kaybetti.`}
        </p>

        <div className="mb-8 rounded-2xl bg-slate-950 p-6 text-left border border-slate-800">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
            Herkesin Gizli Sayısı
          </h3>
          <div className="space-y-4">
            {players.map(p => (
              <div key={p.userId} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img src={p.photoURL || ''} alt="" className="h-10 w-10 rounded-full bg-slate-800" />
                  <span className={`font-bold ${p.userId === loser?.userId ? 'text-red-400' : 'text-slate-200'}`}>
                    {p.displayName} {p.userId === me?.userId && <span className="text-slate-500 font-normal">(Sen)</span>}
                  </span>
                </div>
                <span className="font-mono text-xl font-black text-white bg-slate-800 px-3 py-1 rounded-lg">
                  {p.secretNumber}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            className="flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700" 
            onClick={onLeave}
          >
            <Home className="mr-2 h-5 w-5" />
            Ana Sayfa
          </Button>
          <Button 
            className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20" 
            onClick={onLeave}
          >
            <RefreshCcw className="mr-2 h-5 w-5" />
            Yeni Oyun
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
