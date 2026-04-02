import { motion } from "framer-motion";

interface Player {
  playerId: number;
  firstName: string;
  lastName: string;
  phone: string;
  totalBuyins: number;
  finalChips: number | null;
}

interface PokerTableProps {
  players: Player[];
  adminMode: boolean;
  onSeatClick?: (player: Player) => void;
  selectedPlayerId?: number | null;
}

export function PokerTable({ players, adminMode, onSeatClick, selectedPlayerId }: PokerTableProps) {
  const tableW = 340;
  const tableH = 200;
  const radiusX = tableW / 2 - 52;
  const radiusY = tableH / 2 - 32;
  const centerX = tableW / 2;
  const centerY = tableH / 2;

  const getSeatPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
    };
  };

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      <div className="relative" style={{ width: tableW + 120, height: tableH + 120 }}>
        {/* The Oval Table */}
        <div
          className="absolute poker-table rounded-[50%]"
          style={{
            left: 60,
            top: 60,
            width: tableW,
            height: tableH,
          }}
        >
          {/* Inner felt ring */}
          <div className="absolute inset-3 rounded-[50%] border border-white/10" />

          {/* Logo in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center px-4">
              <div className="logo-shimmer font-cinzel font-black text-base tracking-widest leading-tight">
                CHINO POKER
              </div>
              <div className="w-10 h-px bg-white/30 mx-auto mt-1.5" />
              {adminMode && (
                <div className="mt-1.5 px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold tracking-widest text-white/90 backdrop-blur-sm">
                  ADMIN MODE
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Seats */}
        {players.map((player, index) => {
          const pos = getSeatPosition(index, players.length);
          const isSelected = selectedPlayerId === player.playerId;
          const absX = 60 + pos.x;
          const absY = 60 + pos.y;

          return (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 22 }}
              className={`absolute seat-card rounded-xl cursor-pointer ${isSelected ? "active-seat" : ""}`}
              style={{
                left: absX - 46,
                top: absY - 28,
                width: 92,
                height: 56,
                zIndex: 10,
              }}
              onClick={() => onSeatClick?.(player)}
              data-testid={`seat-player-${player.playerId}`}
            >
              <div className="h-full flex flex-col items-center justify-center px-1.5 py-1">
                <div className="text-gray-900 font-semibold text-[10px] truncate max-w-full text-center leading-tight">
                  {player.firstName}
                </div>
                <div className="text-gray-500 text-[9px] truncate max-w-full text-center">
                  {player.lastName}
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-red-600 text-[10px] font-bold">{player.totalBuyins}₪</span>
                </div>
                {player.finalChips !== null && (
                  <div className="text-[9px] text-gray-400 mt-0.5">{player.finalChips}c</div>
                )}
              </div>
            </motion.div>
          );
        })}

        {players.length === 0 && (
          <div
            className="absolute inset-0 flex items-end justify-center"
            style={{ paddingBottom: 8 }}
          >
            <div className="text-gray-400 text-xs pb-2">No players yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
