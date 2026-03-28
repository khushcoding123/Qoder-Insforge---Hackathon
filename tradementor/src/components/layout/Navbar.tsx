"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TrendingUp, Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { insforge } from "@/lib/insforge";
import { signOut } from "@/lib/actions/auth";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/strategy", label: "Strategy" },
  { href: "/practice", label: "Practice" },
  { href: "/journal", label: "Journal" },
];

const AUTH_ROUTES = ["/login", "/signup", "/onboarding"];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      if (data?.user) {
        setUser({
          name: data.user.profile?.name ?? data.user.email,
          email: data.user.email,
        });
      }
      setAuthChecked(true);
    });
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setUserMenuOpen(false);
    await signOut();
    setUser(null);
    router.push("/");
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-all duration-300">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              TradeMentor <span className="text-cyan-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav — hidden on auth routes */}
          {!isAuthRoute && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive ? "text-cyan-400" : "text-gray-400 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 bg-cyan-400/10 rounded-lg border border-cyan-400/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right CTA — hidden on auth routes */}
          {!isAuthRoute && authChecked && (
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {(user.name ?? "U")[0].toUpperCase()}
                    </div>
                    <span className="text-gray-300 text-sm max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-[#0F0F1A] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white text-sm font-medium truncate">{user.name}</p>
                          <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm"
                        >
                          <User className="w-4 h-4" /> Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-all text-sm"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          {!isAuthRoute && (
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {!isAuthRoute && mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10 bg-[#0F0F1A]/95 backdrop-blur-xl"
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/10 mt-2">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 text-sm rounded-lg hover:bg-red-400/5"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-center text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
