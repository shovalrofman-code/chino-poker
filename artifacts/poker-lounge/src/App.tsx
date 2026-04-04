import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import TablePage from "@/pages/TablePage";
import PlayersPage from "@/pages/PlayersPage";
import PlayerProfilePage from "@/pages/PlayerProfilePage";
import SettlementPage from "@/pages/SettlementPage";
import HistoryPage from "@/pages/HistoryPage";
import LeaderboardPage from "@/pages/LeaderboardPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={TablePage} />
      <Route path="/players" component={PlayersPage} />
      <Route path="/player/:id" component={PlayerProfilePage} />
      <Route path="/settlement/:sessionId" component={SettlementPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;