"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Clock, Home, Shield } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  adminMode?: boolean;
  onAdminClick?: () => void;
}

export function Layout({ children, adminMode, onAdminClick }: LayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "דירוג", href: "/leaderboard", icon: BarChart3 },
    { label: "היסטוריה", href: "/history", icon: Clock },
    { label: "שחקנים", href: "/players", icon: Users },
    { label: "שולחן", href: "/", icon: Home },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top Header - Truly Sticky/Fixed */}
      <header className="fixed top-0 start-0 end-0 border-b border-gray-100 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between z-50 shadow-sm">
        <div className="flex items-center gap-2">
          {adminMode ? (
            <div className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
              <Shield size={12} fill="currentColor" />
              מנהל
            </div>
          ) : (
            <button
              onClick={onAdminClick}
              className="text-gray-300 hover:text-red-600 text-[10px] font-black tracking-widest uppercase transition-colors px-3 py-1.5 border border-transparent hover:border-red-100 hover:bg-red-50 rounded-xl"
            >
              כניסת מנהל
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-serif font-black text-sm tracking-widest text-gray-900">
            CHINO POKER
          </span>
          <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center text-white font-serif font-black text-xs">
            C
          </div>
        </div>
      </header>

      {/* Main Content with padding to account for fixed header and nav */}
      <main className="flex-1 pt-[60px] pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 start-0 end-0 border-t border-gray-100 bg-white/90 backdrop-blur-md px-4 py-2 flex items-center justify-around z-40 safe-area-pb">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${
                isActive ? "text-red-600 scale-105" : "text-gray-400"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? "text-red-600" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
