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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-100 bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center">
            <span className="text-white font-cinzel font-black text-xs">C</span>
          </div>
          <span className="font-cinzel font-black text-sm tracking-widest text-gray-900">
            CHINO POKER
          </span>
        </div>
        <div className="flex items-center gap-2">
          {adminMode ? (
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
              ADMIN
            </span>
          ) : (
            <button
              onClick={onAdminClick}
              className="text-gray-400 hover:text-red-600 text-xs tracking-wider transition-colors px-2 py-1 font-semibold"
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
      <nav className="border-t border-gray-100 bg-white px-4 py-2 flex items-center justify-around safe-area-pb shadow-[0_-1px_0_rgba(0,0,0,0.06)]">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                isActive
                  ? "text-red-600"
                  : "text-gray-400 hover:text-gray-700"
              }`}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "text-red-600" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
