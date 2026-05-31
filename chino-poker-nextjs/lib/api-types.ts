import { z } from "zod";

/**
 * @summary Health check
 */
export const HealthCheckResponse = z.object({
  status: z.string(),
});

/**
 * @summary List all players
 */
export const ListPlayersResponseItem = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  isGuest: z.boolean(),
  createdAt: z.string(),
});
export const ListPlayersResponse = z.array(ListPlayersResponseItem);

/**
 * @summary Create a new player
 */
export const CreatePlayerBody = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  isGuest: z.boolean().optional(),
});

/**
 * @summary Search players by name (autocomplete)
 */
export const SearchPlayersQueryParams = z.object({
  q: z.string(),
});

export const SearchPlayersResponseItem = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  isGuest: z.boolean(),
  createdAt: z.string(),
});
export const SearchPlayersResponse = z.array(SearchPlayersResponseItem);

/**
 * @summary Get a player by ID
 */
export const GetPlayerParams = z.object({
  id: z.coerce.number(),
});

export const GetPlayerResponse = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  isGuest: z.boolean(),
  createdAt: z.string(),
});

/**
 * @summary Get lifetime stats for a player
 */
export const GetPlayerStatsParams = z.object({
  id: z.coerce.number(),
});

export const GetPlayerStatsResponse = z.object({
  playerId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  totalGames: z.number(),
  totalBuyins: z.number(),
  totalProfit: z.number(),
  winRate: z.number(),
  biggestWin: z.number(),
  biggestLoss: z.number(),
});

/**
 * @summary List all sessions
 */
export const ListSessionsResponseItem = z.object({
  id: z.number(),
  status: z.enum(["active", "closed"]),
  startedAt: z.string(),
  closedAt: z.string().nullish(),
  totalRake: z.number(),
});
export const ListSessionsResponse = z.array(ListSessionsResponseItem);

/**
 * @summary Start a new session
 */
export const CreateSessionBody = z.object({
  note: z.string().optional(),
});

/**
 * @summary Get the currently active session
 */
export const GetActiveSessionResponse = z.object({
  id: z.number(),
  status: z.enum(["active", "closed"]),
  startedAt: z.string(),
  closedAt: z.string().nullish(),
  totalRake: z.number(),
  players: z.array(
    z.object({
      id: z.number(),
      sessionId: z.number(),
      playerId: z.number(),
      totalBuyins: z.number(),
      finalChips: z.number().nullish(),
      player: z.object({
        id: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        isGuest: z.boolean(),
        createdAt: z.string(),
      }),
      buyins: z.array(
        z.object({
          id: z.number(),
          sessionId: z.number(),
          playerId: z.number(),
          amount: z.number(),
          chips: z.number(),
          createdAt: z.string(),
        }),
      ),
    }),
  ),
});

/**
 * @summary Get a session by ID
 */
export const GetSessionParams = z.object({
  id: z.coerce.number(),
});

export const GetSessionResponse = z.object({
  id: z.number(),
  status: z.enum(["active", "closed"]),
  startedAt: z.string(),
  closedAt: z.string().nullish(),
  totalRake: z.number(),
  players: z.array(
    z.object({
      id: z.number(),
      sessionId: z.number(),
      playerId: z.number(),
      totalBuyins: z.number(),
      finalChips: z.number().nullish(),
      player: z.object({
        id: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        isGuest: z.boolean(),
        createdAt: z.string(),
      }),
      buyins: z.array(
        z.object({
          id: z.number(),
          sessionId: z.number(),
          playerId: z.number(),
          amount: z.number(),
          chips: z.number(),
          createdAt: z.string(),
        }),
      ),
    }),
  ),
});

/**
 * @summary Close a session, record final chips, calculate settlement
 */
export const CloseSessionParams = z.object({
  id: z.coerce.number(),
});

export const CloseSessionBody = z.object({
  finalChips: z.array(
    z.object({
      playerId: z.number(),
      chips: z.number(),
    }),
  ),
});

export const CloseSessionResponse = z.object({
  sessionId: z.number(),
  totalPot: z.number(),
  totalRake: z.number(),
  players: z.array(
    z.object({
      playerId: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string(),
      totalBuyins: z.number(),
      finalChips: z.number(),
      profit: z.number(),
      rake: z.number(),
      netProfit: z.number(),
    }),
  ),
  transfers: z.array(
    z.object({
      fromPlayerId: z.number(),
      fromName: z.string(),
      fromPhone: z.string(),
      toPlayerId: z.number(),
      toName: z.string(),
      toPhone: z.string(),
      amount: z.number(),
    }),
  ),
});

/**
 * @summary Add a player to an active session
 */
export const AddPlayerToSessionParams = z.object({
  id: z.coerce.number(),
});

export const AddPlayerToSessionBody = z.object({
  playerId: z.number(),
  initialBuyin: z.number(),
});

/**
 * @summary Record a buy-in for a player in a session
 */
export const RecordBuyinParams = z.object({
  id: z.coerce.number(),
});

export const RecordBuyinBody = z.object({
  playerId: z.number(),
  amount: z.number(),
});

/**
 * @summary Get settlement details for a closed session
 */
export const GetSessionSettlementParams = z.object({
  id: z.coerce.number(),
});

export const GetSessionSettlementResponse = z.object({
  sessionId: z.number(),
  totalPot: z.number(),
  totalRake: z.number(),
  players: z.array(
    z.object({
      playerId: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string(),
      totalBuyins: z.number(),
      finalChips: z.number(),
      profit: z.number(),
      rake: z.number(),
      netProfit: z.number(),
    }),
  ),
  transfers: z.array(
    z.object({
      fromPlayerId: z.number(),
      fromName: z.string(),
      fromPhone: z.string(),
      toPlayerId: z.number(),
      toName: z.string(),
      toPhone: z.string(),
      amount: z.number(),
    }),
  ),
});

/**
 * @summary Get the running group rake balance
 */
export const GetGroupBalanceResponse = z.object({
  totalRake: z.number(),
  sessionsCount: z.number(),
});

/**
 * @summary Get all-time player leaderboard
 */
export const GetLeaderboardResponseItem = z.object({
  playerId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  totalGames: z.number(),
  totalBuyins: z.number(),
  totalProfit: z.number(),
  winRate: z.number(),
  biggestWin: z.number(),
  biggestLoss: z.number(),
});
export const GetLeaderboardResponse = z.array(GetLeaderboardResponseItem);
