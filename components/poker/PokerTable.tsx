"use client";

import { motion } from "framer-motion";
import { Coins, User } from "lucide-react";

interface Player {
  playerId: number;
  firstName: string;
  lastName: string;
  phone: string;
  totalBuyins: number;
  finalChips?: number | null;
}

interface PokerTableProps {
  players: Player[];
  adminMode: boolean;
  onSeatClick: (player: Player) => void;
}

/**
 * Component: Single seat at the poker table.
 */
function PlayerSeat({
  player,
  index,
  total,
  onSeatClick,
}: {
  player: Player;
  index: number;
  total: number;
  onSeatClick: (p: Player) => void;
}) {
  // Calculate polar coordinates for oval table arrangement
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radiusX = 140; // Horizontal radius
  const radiusY = 90;  // Vertical radius
  
  const x = Math.cos(angle) * radiusX;
  const y = Math.sin(angle) * radiusY;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
      className="absolute"
    >
      <button
        onClick={() => onSeatClick(player)}
        className="group relative flex flex-col items-center"
      >
        {/* Avatar Circle */}
        <div className="w-14 h-14 rounded-full bg-white border-2 border-red-100 shadow-lg flex items-center justify-center group-hover:border-red-500 group-hover:scale-110 transition-all duration-300 relative z-10">
          <span className="text-red-600 font-black text-sm uppercase">
            {player.firstName[0]}
            {player.lastName?.[0] || ""}
          </span>
          
          {/* Buy-in Badge */}
          <div className="absolute -top-2 -end-2 bg-black text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white/20 shadow-md">
            {player.totalBuyins}
          </div>
        </div>

        {/* Name Plate */}
        <div className="mt-2 bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1 rounded-full shadow-sm max-w-[80px]">
          <div className="text-[10px] font-black text-gray-900 truncate text-center">
            {player.firstName}
          </div>
        </div>

        {/* Visual Chips Stack (Decorative) */}
        <div className="absolute -bottom-1 flex gap-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-3 h-1 bg-red-500 rounded-full shadow-sm" />
          <div className="w-3 h-1 bg-red-400 rounded-full shadow-sm" />
        </div>
      </button>
    </motion.div>
  );
}

/**
 * Component: The Virtual Poker Table.
 * Renders players in an oval arrangement with professional casino aesthetics.
 */
export function PokerTable({ players, adminMode, onSeatClick }: PokerTableProps) {
  return (
    <div className="relative w-full max-w-lg aspect-[4/3] flex items-center justify-center select-none">
      
      {/* Outer Table Glow */}
      <div className="absolute inset-0 bg-red-600/5 blur-[100px] rounded-full scale-110" />

      {/* The Poker Table Surface */}
      <div className="relative w-[85%] h-[60%] rounded-[200px] border-[12px] border-[#3d050a] bg-radial-[at_50%_40%] from-[#C91A2E] via-[#700A16] to-[#40040a] shadow-[0_40px_100px_-10px_rgba(0,0,0,0.5),inset_0_0_80px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden">
        
        {/* Subtle Felt Texture / Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="w-full h-full border-[1px] border-white rounded-[200px] scale-[0.85] opacity-20" />
           <div className="w-full h-full border-[1px] border-white rounded-[200px] scale-[0.7] opacity-10" />
        </div>

        <div className="text-center">
          <div className="text-white/10 font-cinzel text-5xl font-black italic tracking-widest uppercase select-none">
            CHINO
          </div>
          <div className="text-red-500/20 font-black text-xs uppercase tracking-[0.5em] mt-2">
            ניהול פוקר מקצועי
          </div>
        </div>
      </div>

      {/* Players Arrangement */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
          {players.map((p, i) => (
            <PlayerSeat
              key={p.playerId}
              player={p}
              index={i}
              total={players.length}
              onSeatClick={onSeatClick}
            />
          ))}
          
          {players.length === 0 && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" />
              <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                השולחן ריק
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dealer Position (Decorative) */}
      <div className="absolute bottom-[18%] bg-white text-black text-[8px] font-black px-2 py-0.5 rounded border border-black/10 shadow-sm uppercase tracking-tighter">
        דילר
      </div>
    </div>
  );
}
