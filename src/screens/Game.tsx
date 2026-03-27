import React, { useState } from 'react';
import { Room, Player } from '../hooks/useGame';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Skull, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface GameProps {
  room: Room;
  players: Player[];
  me: Player | undefined;
  onMakeGuess: (guess: number) => void;
  onLeave: () => void;
}

export function Game({ room, players, me, onMakeGuess, onLeave }: GameProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const isMyTurn = room.turn === me?.userId;
  const amIEliminated = me?.isEliminated;

  const handleGuess = () => {
    if (selectedNumber !== null && isMyTurn && !amIEliminated) {
      onMakeGuess(selectedNumber);
      setSelectedNumber(null);
    }
  };

  const activePlayers = players.filter(p => !p.isEliminated);
  const eliminatedPlayers = players.filter(p => p.isEliminated);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 p-4 pt-8 text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onLeave} className="text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-4 py-1.5">
            <span className="text-sm font-medium text-slate-400">Oda:</span>
            <span className="font-mono text-lg font-bold tracking-wider text-white">{room.id}</span>
          </div>
        </div>

        {amIEliminated && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-center gap-4 rounded-2xl bg-red-950/50 p-5 border border-red-900/50 text-red-200 shadow-lg"
          >
            <div className="bg-red-900/50 p-3 rounded-full">
              <Skull className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="font-black text-xl text-red-400">ELENDİN!</p>
              <p className="text-sm opacity-80">Biri senin gizli sayını ({me.secretNumber}) söyledi.</p>
            </div>
          </motion.div>
        )}

        {!amIEliminated && (
          <div className="mb-8 flex items-center justify-between rounded-2xl bg-slate-900 p-5 shadow-lg border border-slate-800">
            <div className="flex items-center gap-3 text-slate-400">
              <AlertCircle className="h-6 w-6 text-indigo-400" />
              <span className="text-sm font-bold uppercase tracking-wider">Gizli Sayın</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-black text-white">
                {showSecret ? me?.secretNumber : '**'}
              </span>
              <button 
                onClick={() => setShowSecret(!showSecret)} 
                className="text-slate-400 hover:text-white transition-colors"
                title={showSecret ? "Gizle" : "Göster"}
              >
                {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-3xl bg-slate-900 p-6 shadow-xl border border-slate-800">
          <h2 className={`mb-6 text-center text-xl font-black uppercase tracking-wider ${isMyTurn ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isMyTurn ? "Sıra Sende!" : `${players.find(p => p.userId === room.turn)?.displayName} Seçiyor...`}
          </h2>
          
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
            {Array.from({ length: room.maxNumber }, (_, i) => i + 1).map(num => {
              const isGuessed = room.guesses?.includes(num);
              const isSelected = selectedNumber === num;
              const isMySecret = num === me?.secretNumber;
              
              return (
                <button
                  key={num}
                  disabled={isGuessed || !isMyTurn || amIEliminated}
                  onClick={() => {
                    if (!isMySecret) {
                      setSelectedNumber(num);
                    }
                  }}
                  className={`flex h-12 w-full items-center justify-center rounded-xl font-mono text-lg font-bold transition-all ${
                    isGuessed
                      ? 'bg-slate-950 text-slate-700 border border-slate-800 cursor-not-allowed'
                      : isSelected
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 scale-110 z-10'
                      : isMyTurn && !amIEliminated
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-105 border border-slate-700'
                      : 'bg-slate-800/50 text-slate-500 border border-slate-800/50 cursor-default'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {isMyTurn && !amIEliminated && (
            <Button 
              className={`mt-8 w-full py-6 text-lg font-bold rounded-xl transition-all ${
                selectedNumber !== null 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              onClick={handleGuess} 
              disabled={selectedNumber === null}
            >
              {selectedNumber !== null ? `${selectedNumber} Sayısını Söyle` : 'Bir Sayı Seç'}
            </Button>
          )}
        </div>

        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl border border-slate-800">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
            Kalan Oyuncular ({activePlayers.length})
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {activePlayers.map(p => (
              <div 
                key={p.userId} 
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold border ${
                  p.userId === room.turn 
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/20' 
                    : 'border-slate-700 bg-slate-800 text-slate-300'
                }`}
              >
                <img src={p.photoURL || ''} alt="" className="h-6 w-6 rounded-full bg-slate-700" />
                {p.displayName}
              </div>
            ))}
          </div>

          {eliminatedPlayers.length > 0 && (
            <>
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
                Elenenler ({eliminatedPlayers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {eliminatedPlayers.map(p => (
                  <div 
                    key={p.userId} 
                    className="flex items-center gap-2 rounded-full border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-sm font-medium text-red-400/80"
                  >
                    <Skull className="h-4 w-4" />
                    {p.displayName}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
