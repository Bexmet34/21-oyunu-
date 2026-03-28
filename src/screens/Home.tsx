import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Plus, LogIn, Play, ChevronDown, ChevronUp, Trophy, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../hooks/useAuth';

interface HomeProps {
  user: User;
  onJoinRoom: (roomId: string) => void;
  onLogout: () => void;
}

type Tab = 'none' | 'create' | 'join' | 'list';

export function Home({ user, onJoinRoom, onLogout }: HomeProps) {
  const [joinCode, setJoinCode] = useState('');
  const [maxNumber, setMaxNumber] = useState(21);
  const [loading, setLoading] = useState(false);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('none');
  const [stats, setStats] = useState<{ wins: number, losses: number } | null>(null);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsub = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          setStats(snap.data() as any);
        }
      });
      return unsub;
    }
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), where('status', '==', 'waiting'));
    const unsub = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      rooms.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setActiveRooms(rooms.slice(0, 5)); // Show top 5 recent waiting rooms
    });
    return unsub;
  }, []);

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
      handleFirestoreError(error, OperationType.WRITE, `rooms/${roomId}`);
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

  const toggleTab = (tab: Tab) => {
    setActiveTab(prev => prev === tab ? 'none' : tab);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-950 p-4 pt-12 text-slate-100">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center justify-between bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={user.photoURL || ''} alt="Profile" className="h-14 w-14 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-inner" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-500"></div>
            </div>
            <div>
              <p className="font-black text-xl text-white tracking-tight">{user.displayName}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{stats?.wins || 0} Galibiyet</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                <div className="flex items-center gap-1 text-red-400">
                  <Skull className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{stats?.losses || 0} Mağlubiyet</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Create Room Section */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleTab('create')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500/10 p-3 rounded-xl">
                  <Plus className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Yeni Oyun Kur</h2>
                  <p className="text-sm text-slate-400 mt-1">Kendi odanı oluştur ve arkadaşlarını davet et</p>
                </div>
              </div>
              {activeTab === 'create' ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
            </button>
            
            <AnimatePresence>
              {activeTab === 'create' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="pt-4 border-t border-slate-800">
                    <label className="mb-3 block text-sm font-medium text-slate-400">Oyun Bitiş Sayısı</label>
                    <div className="flex gap-2 mb-6">
                      {[21, 31, 41, 51].map(num => (
                        <button
                          key={num}
                          onClick={() => setMaxNumber(num)}
                          className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                            maxNumber === num
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <Button 
                      className="w-full py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20" 
                      onClick={handleCreateRoom} 
                      disabled={loading}
                    >
                      Odayı Oluştur
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Join Room Section */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleTab('join')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <LogIn className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Koda Göre Katıl</h2>
                  <p className="text-sm text-slate-400 mt-1">Arkadaşının verdiği oda koduyla oyuna gir</p>
                </div>
              </div>
              {activeTab === 'join' ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
            </button>
            
            <AnimatePresence>
              {activeTab === 'join' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <form onSubmit={handleJoinRoom} className="flex gap-2 pt-4 border-t border-slate-800">
                    <Input
                      placeholder="Oda Kodu (örn: A1B2C3)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="uppercase text-center font-mono text-lg h-14 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-emerald-500"
                      maxLength={6}
                    />
                    <Button type="submit" disabled={!joinCode.trim()} className="h-14 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">
                      Katıl
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Rooms Section */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleTab('list')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-3 rounded-xl">
                  <Play className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Aktif Odalar</h2>
                  <p className="text-sm text-slate-400 mt-1">Bekleyen {activeRooms.length} açık oda var</p>
                </div>
              </div>
              {activeTab === 'list' ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
            </button>
            
            <AnimatePresence>
              {activeTab === 'list' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="pt-4 border-t border-slate-800">
                    {activeRooms.length > 0 ? (
                      <div className="space-y-3">
                        {activeRooms.map(room => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={room.id} 
                            className="flex items-center justify-between rounded-xl bg-slate-800 p-4 border border-slate-700"
                          >
                            <div>
                              <span className="font-mono text-lg font-bold text-white tracking-wider">{room.id}</span>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium">
                                <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">Hedef: {room.maxNumber}</span>
                              </div>
                            </div>
                            <Button 
                              onClick={() => onJoinRoom(room.id)}
                              className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-lg shadow-lg shadow-amber-500/20"
                            >
                              Katıl
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 font-medium">
                        Şu an bekleyen açık oda bulunmuyor.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
