import { useState } from 'react';
import { Room, Player } from '../hooks/useGame';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Skull, User, ArrowLeft, AlertCircle } from 'lucide-react';

interface GameProps {
  room: Room;
  players: Player[];
  me: Player | undefined;
  onMakeGuess: (guess: number) => void;
  onLeave: () => void;
}

export function Game({ room, players, me, onMakeGuess, onLeave }: GameProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

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
    <div className="flex min-h-screen flex-col bg-gray-50 p-4 pt-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onLeave}>
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-700">
            <span className="text-sm font-medium">Oda:</span>
            <span className="font-mono text-lg font-bold tracking-wider">{room.id}</span>
          </div>
        </div>

        {amIEliminated && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 p-4 border border-red-100 text-red-800"
          >
            <Skull className="h-6 w-6" />
            <div>
              <p className="font-bold">Elendin!</p>
              <p className="text-sm">Biri senin gizli sayını ({me.secretNumber}) söyledi.</p>
            </div>
          </motion.div>
        )}

        {!amIEliminated && (
          <div className="mb-8 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Gizli Sayın</span>
            </div>
            <span className="font-mono text-2xl font-bold text-gray-900">{me?.secretNumber}</span>
          </div>
        )}

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="mb-4 text-center text-lg font-bold text-gray-900">
            {isMyTurn ? "Sıra Sende!" : `${players.find(p => p.userId === room.turn)?.displayName} Seçiyor...`}
          </h2>
          
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
            {Array.from({ length: room.maxNumber }, (_, i) => i + 1).map(num => {
              const isGuessed = room.guesses?.includes(num);
              const isSelected = selectedNumber === num;
              
              return (
                <button
                  key={num}
                  disabled={isGuessed || !isMyTurn || amIEliminated}
                  onClick={() => setSelectedNumber(num)}
                  className={`flex h-12 w-full items-center justify-center rounded-xl font-mono text-lg font-bold transition-all ${
                    isGuessed
                      ? 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : isMyTurn && !amIEliminated
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105'
                      : 'bg-gray-50 text-gray-600 cursor-default'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {isMyTurn && !amIEliminated && (
            <Button 
              className="mt-6 w-full py-6 text-lg" 
              size="lg"
              onClick={handleGuess} 
              disabled={selectedNumber === null}
            >
              {selectedNumber !== null ? `${selectedNumber} Sayısını Söyle` : 'Bir Sayı Seç'}
            </Button>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
            Kalan Oyuncular ({activePlayers.length})
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {activePlayers.map(p => (
              <div 
                key={p.userId} 
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border ${
                  p.userId === room.turn 
                    ? 'border-blue-200 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                <img src={p.photoURL || ''} alt="" className="h-5 w-5 rounded-full" />
                {p.displayName}
              </div>
            ))}
          </div>

          {eliminatedPlayers.length > 0 && (
            <>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                Elenenler ({eliminatedPlayers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {eliminatedPlayers.map(p => (
                  <div 
                    key={p.userId} 
                    className="flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 opacity-75"
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
