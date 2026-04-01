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
  const tableWidth = 600;
  const tableHeight = 360;
  const radiusX = tableWidth / 2 - 80;
  const radiusY = tableHeight / 2 - 60;
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;

  const getSeatPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="relative" style={{ width: tableWidth, height: tableHeight }}>
        {/* The Table */}
        <div
          className="absolute poker-table rounded-[50%]"
          style={{
            left: 60,
            top: 30,
            width: tableWidth - 120,
            height: tableHeight - 60,
          }}
        >
          {/* Inner felt glow */}
          <div className="absolute inset-4 rounded-[50%] border border-[rgba(255,255,255,0.05)]" />

          {/* Logo in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="logo-shimmer font-cinzel font-black text-xl tracking-widest mb-1">
                THE POKER LOUNGE
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
              {adminMode && (
                <div className="mt-2 px-2 py-0.5 bg-red-700 rounded text-[10px] font-bold tracking-widest text-white">
                  ADMIN
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Seats */}
        {players.map((player, index) => {
          const pos = getSeatPosition(index, players.length);
          const isSelected = selectedPlayerId === player.playerId;

          return (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`absolute seat-card rounded-xl cursor-pointer ${isSelected ? "active-seat ring-2 ring-red-500" : ""}`}
              style={{
                left: pos.x - 52,
                top: pos.y - 32,
                width: 104,
                height: 64,
                zIndex: 10,
              }}
              onClick={() => onSeatClick?.(player)}
              data-testid={`seat-player-${player.playerId}`}
            >
              <div className="h-full flex flex-col items-center justify-center px-2 py-1">
                <div className="text-white font-semibold text-xs truncate max-w-full text-center leading-tight">
                  {player.firstName} {player.lastName}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[#D4AF37] text-xs font-bold">{player.totalBuyins} ₪</span>
                </div>
                {player.finalChips !== null && (
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {player.finalChips} chips
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Empty seats hint */}
        {players.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mt-16">
              <div className="text-gray-500 text-sm">No players yet</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
