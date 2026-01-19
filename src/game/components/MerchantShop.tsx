
import React, { useState } from 'react';
import { Player, Item } from '../types';
import { ITEMS } from '../constants';
import { ShoppingBag, Eye, ArrowRight, ShieldCheck, Sword, Sparkles } from 'lucide-react';

interface MerchantShopProps {
  players: Player[];
  onBuy: (playerId: string, item: Item) => void;
  onFinish: () => void;
}

const MerchantShop: React.FC<MerchantShopProps> = ({ players, onBuy, onFinish }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');

  const activePlayer = players.find(p => p.id === selectedPlayerId);

  const canAfford = (item: Item) => {
    if (!activePlayer || !item.cost) return false;
    return activePlayer.insight >= item.cost;
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-xl animate-in fade-in duration-500">

      <div className="w-full max-w-5xl h-[80vh] flex flex-col bg-[#16213e] border-2 border-amber-600 rounded-xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-[#0f1219] p-6 border-b border-amber-700 flex justify-between items-center relative overflow-hidden">
            {/* CSS wood texture pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              background: 'repeating-linear-gradient(90deg, rgba(139,90,43,0.15) 0px, transparent 1px, transparent 8px)'
            }}></div>
            <div className="flex items-center gap-4 z-10">
                <div className="bg-amber-900/30 p-3 rounded-full border border-amber-600">
                    <ShoppingBag className="text-amber-500" size={32} />
                </div>
                <div>
                    <h2 className="text-4xl font-display text-amber-100 uppercase tracking-widest">The Fence</h2>
                    <p className="text-amber-500/60 text-sm font-serif italic">"I trade in curious things for curious minds..."</p>
                </div>
            </div>
            <div className="z-10 text-right">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Current Customer</div>
                <div className="flex gap-2">
                    {players.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPlayerId(p.id)}
                            className={`px-3 py-1 rounded border text-xs font-bold uppercase transition-all ${
                                p.id === selectedPlayerId
                                ? 'bg-amber-600 text-black border-amber-400'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-amber-700'
                            }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">

            {/* Left: Customer Info */}
            <div className="w-1/3 bg-[#0a0a1a] p-6 border-r border-slate-700 flex flex-col">
                {activePlayer && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-display text-white">{activePlayer.name}</h3>
                            <div className="flex items-center gap-2 text-green-400 bg-green-900/20 px-3 py-1 rounded-full border border-green-800">
                                <Eye size={18} />
                                <span className="font-bold text-lg">{activePlayer.insight}</span>
                                <span className="text-[10px] uppercase">Insight</span>
                            </div>
                        </div>

                        <h4 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3 border-b border-slate-800 pb-2">Inventory</h4>
                        <div className="space-y-2 mb-6 overflow-y-auto max-h-60 pr-2">
                            {(() => {
                                const items = [
                                    activePlayer.inventory.leftHand,
                                    activePlayer.inventory.rightHand,
                                    activePlayer.inventory.body,
                                    ...activePlayer.inventory.bag
                                ].filter((item): item is import('../types').Item => item !== null);
                                
                                return items.length === 0 ? (
                                    <p className="text-slate-600 italic text-sm">Empty pockets...</p>
                                ) : (
                                    items.map((item, idx) => (
                                        <div key={idx} className="bg-slate-800 p-2 rounded flex justify-between items-center border border-slate-700">
                                            <span className="text-slate-300 text-sm">{item.name}</span>
                                            <span className="text-[10px] text-slate-500 uppercase">{item.type}</span>
                                        </div>
                                    ))
                                );
                            })()}
                        </div>
                    </>
                )}
            </div>

            {/* Right: Shop Wares */}
            <div className="flex-1 bg-[#16213e] p-8 overflow-y-auto">
                <h4 className="text-xs text-amber-500 uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
                    <Sparkles size={14} /> Available Wares
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    {ITEMS.map(item => {
                        const affordable = canAfford(item);
                        return (
                            <div key={item.id} className={`p-4 rounded border-2 transition-all relative group ${affordable ? 'border-slate-700 bg-slate-800/50 hover:border-amber-500 hover:bg-slate-800' : 'border-slate-800 bg-slate-900/50 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {item.type === 'weapon' ? <Sword size={16} className="text-red-400"/> : item.type === 'relic' ? <Sparkles size={16} className="text-purple-400"/> : <ShieldCheck size={16} className="text-blue-400"/>}
                                        <span className="font-bold text-slate-200">{item.name}</span>
                                    </div>
                                    <div className={`text-sm font-bold ${affordable ? 'text-green-400' : 'text-red-500'}`}>
                                        {item.cost} Insight
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 italic mb-4">{item.effect}</p>

                                <button
                                    onClick={() => onBuy(selectedPlayerId, item)}
                                    disabled={!affordable}
                                    className={`w-full py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${affordable ? 'bg-amber-700 hover:bg-amber-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                >
                                    {affordable ? 'Purchase' : 'Too Expensive'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="bg-[#0f1219] p-4 border-t border-amber-700 flex justify-end">
            <button
                onClick={onFinish}
                className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold uppercase tracking-widest rounded flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(21,128,61,0.4)]"
            >
                Finish & Archive Survivors <ArrowRight size={18} />
            </button>
        </div>

      </div>
    </div>
  );
};

export default MerchantShop;
