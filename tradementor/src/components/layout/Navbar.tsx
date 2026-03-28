"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { BrandLockup } from "@/components/brand/Brand";
import { cn } from "@/lib/cn";
import { insforge } from "@/lib/insforge";
import { signOut } from "@/lib/actions/auth";

const DEV_UI_PREVIEW = process.env.NODE_ENV !== "production";

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
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isPreviewUser = user?.email === "preview@lumen.local";

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      if (data?.user) {
        setUser({
          name: data.user.profile?.name ?? data.user.email,
          email: data.user.email,
        });
      } else if (DEV_UI_PREVIEW) {
        setUser({
          name: "Preview User",
          email: "preview@lumen.local",
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

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 18);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/8 bg-[#090912]/78 backdrop-blur-xl"
          : "border-b border-transparent bg-[#090912]/42 backdrop-blur-md",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <BrandLockup
              className="transition-transform duration-300 group-hover:scale-[1.02]"
              markClassName="h-9 w-9 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.16)]"
            />
          </Link>

          {/* Desktop Nav — hidden on auth routes */}
          {!isAuthRoute && (
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                      isActive ? "text-white" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-lg border border-white/10 bg-white/6"
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
            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-all hover:border-white/16 hover:bg-white/8"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-xs font-bold text-white">
                      {(user.name ?? "U")[0].toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate text-sm text-zinc-300">{user.name}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="premium-panel absolute right-0 top-full mt-2 w-52 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white text-sm font-medium truncate">{user.name}</p>
                          <p className="text-zinc-500 text-xs truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 transition-all hover:bg-white/5 hover:text-white"
                        >
                          <User className="w-4 h-4" /> Dashboard
                        </Link>
                        {isPreviewUser ? (
                          <div className="px-4 py-2.5 text-xs text-zinc-500">
                            Preview mode active
                          </div>
                        ) : (
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-all hover:bg-red-400/5 hover:text-red-300"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-xl border border-cyan-400/10 bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-92"
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
              className="p-2 text-zinc-400 transition-colors hover:text-white md:hidden"
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
          className="border-t border-white/10 bg-[#0F0F1A]/95 backdrop-blur-xl md:hidden"
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
                isPreviewUser ? (
                  <div className="px-4 py-2.5 text-sm text-zinc-500">Preview mode active</div>
                ) : (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 text-sm rounded-lg hover:bg-red-400/5"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                )
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
