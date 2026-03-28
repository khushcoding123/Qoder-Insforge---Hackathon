import Link from "next/link";
import { TrendingUp, TriangleAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0F] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                TradeMentor <span className="text-zinc-200">AI</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              An AI-powered educational platform that teaches you to think like a strategist — not follow signals.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/learn", label: "Learn Center" },
                { href: "/strategy", label: "Strategy Builder" },
                { href: "/practice", label: "Practice" },
                { href: "/journal", label: "Journal" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { href: "/extension", label: "Chrome Extension" },
                { href: "/learn", label: "Free Lessons" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/4 p-4">
            <TriangleAlert className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs leading-relaxed">
              <span className="text-zinc-200 font-semibold">Important Disclaimer: </span>
              TradeMentor AI is an educational platform. Nothing on this platform constitutes financial advice, investment advice, trading advice, or any other sort of advice. Trading involves substantial risk of loss and is not appropriate for everyone. Past performance is not indicative of future results. You should consult with a qualified financial advisor before making any investment decisions. The creators of TradeMentor AI are not responsible for any financial losses incurred as a result of using this platform.
            </p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs">
              © 2025 TradeMentor AI. Educational purposes only.
            </p>
            <p className="text-gray-600 text-xs">
              Built for hackathon demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
