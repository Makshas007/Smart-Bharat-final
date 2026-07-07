import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const LanguageToggle = ({ compact = false }) => {
  const { language, changeLanguage } = useApp();
  return (
    <div
      className="flex items-center rounded-xl border bg-white p-0.5"
      role="group"
      aria-label={"Language / \u092d\u093e\u0937\u093e"}
      data-testid="navbar-language-toggle"
    >
      {[
        { code: "en", label: "EN" },
        { code: "hi", label: "\u0939\u093f\u0902" },
      ].map((l) => (
        <button
          key={l.code}
          onClick={() => changeLanguage(l.code)}
          data-testid={`language-toggle-${l.code}`}
          aria-pressed={language === l.code}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            language === l.code
              ? "bg-[hsl(var(--primary))] text-white"
              : "text-slate-600 hover:text-slate-900"
          } ${compact ? "" : "sm:px-3"}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export const Navbar = () => {
  const { t, setChatOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: t("nav_home"), testid: "navbar-home-link" },
    { to: "/services", label: t("nav_services"), testid: "navbar-services-link" },
    { to: "/report", label: t("nav_report"), testid: "navbar-report-link" },
    { to: "/track", label: t("nav_track"), testid: "navbar-track-link" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" data-testid="navbar-logo-link">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
            <Landmark size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Smart <span className="text-[hsl(var(--secondary))]">Bharat</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <motion.div key={link.to} whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
              <NavLink
                to={link.to}
                data-testid={link.testid}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                      : "text-slate-700 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
            <Button
              onClick={() => setChatOpen(true)}
              data-testid="navbar-ask-ai-button"
              className="rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
            >
              <Sparkles size={16} className="mr-1.5" />
              {t("nav_ask_ai")}
            </Button>
          </motion.div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-slate-700 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            data-testid="navbar-mobile-menu-button"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t bg-white px-4 py-3 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-${link.testid}`}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]" : "text-slate-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Button
              onClick={() => {
                setMobileOpen(false);
                setChatOpen(true);
              }}
              data-testid="mobile-ask-ai-button"
              className="mt-2 rounded-xl bg-[hsl(var(--primary))] text-white"
            >
              <Sparkles size={16} className="mr-1.5" />
              {t("nav_ask_ai")}
            </Button>
          </div>
        </motion.nav>
      )}
    </header>
  );
};
