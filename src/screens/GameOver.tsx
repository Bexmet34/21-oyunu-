import { useEffect } from 'react';
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
          colors: ['#2563eb', '#3b82f6', '#60a5fa']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#2563eb', '#3b82f6', '#60a5fa']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [amILoser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center"
      >
        <div className="mb-6 flex justify-center">
          {amILoser ? (
            <div className="rounded-full bg-red-100 p-6 text-red-600">
              <Skull className="h-16 w-16" />
            </div>
          ) : (
            <div className="rounded-full bg-blue-100 p-6 text-blue-600">
              <Trophy className="h-16 w-16" />
            </div>
          )}
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {amILoser ? "Kaybettin!" : "Kazandın!"}
        </h1>
        <p className="mb-8 text-gray-500">
          {amILoser 
            ? "Sona kalan sen oldun ve mayına bastın." 
            : `${loser?.displayName || 'Biri'} sona kaldı ve kaybetti.`}
        </p>

        <div className="mb-8 rounded-xl bg-gray-50 p-6 text-left border border-gray-100">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
            Herkesin Gizli Sayısı
          </h3>
          <div className="space-y-3">
            {players.map(p => (
              <div key={p.userId} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img src={p.photoURL || ''} alt="" className="h-8 w-8 rounded-full" />
                  <span className={`font-medium ${p.userId === loser?.userId ? 'text-red-600' : 'text-gray-900'}`}>
                    {p.displayName} {p.userId === me?.userId && "(Sen)"}
                  </span>
                </div>
                <span className="font-mono text-lg font-bold text-gray-700">
                  {p.secretNumber}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            className="flex-1 py-6" 
            variant="outline"
            onClick={onLeave}
          >
            <Home className="mr-2 h-5 w-5" />
            Ana Sayfa
          </Button>
          <Button 
            className="flex-1 py-6" 
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
