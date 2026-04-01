import { Link, useLocation } from "wouter";
import { BarChart3, Users, Clock, Home } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  adminMode?: boolean;
  onAdminClick?: () => void;
}

export function Layout({ children, adminMode, onAdminClick }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Table" },
    { href: "/players", icon: Users, label: "Players" },
    { href: "/history", icon: Clock, label: "History" },
    { href: "/leaderboard", icon: BarChart3, label: "Leaders" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-[#222] bg-[#0a0a0a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-cinzel font-black text-sm tracking-widest logo-shimmer">
            CHINO POKER
          </span>
        </div>
        <div className="flex items-center gap-2">
          {adminMode ? (
            <div className="flex items-center gap-2">
              <span className="bg-red-700 text-white text-xs font-bold px-2 py-0.5 rounded tracking-wider">
                ADMIN
              </span>
            </div>
          ) : (
            <button
              onClick={onAdminClick}
              className="text-gray-500 hover:text-white text-xs tracking-wider transition-colors px-2 py-1"
              data-testid="button-admin-mode"
            >
              ADMIN
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="border-t border-[#222] bg-[#0a0a0a] px-4 py-2 flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded transition-colors ${isActive ? "text-red-500" : "text-gray-600 hover:text-gray-400"}`}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs tracking-wider">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
