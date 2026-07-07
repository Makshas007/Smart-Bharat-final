import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const Footer = () => {
  const { t } = useApp();
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
                <Landmark size={18} />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Smart <span className="text-[hsl(var(--secondary))]">Bharat</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">{t("footer_tagline")}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{t("quick_links")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/services" className="hover:text-slate-900" data-testid="footer-services-link">
                  {t("nav_services")}
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-slate-900" data-testid="footer-report-link">
                  {t("nav_report")}
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-slate-900" data-testid="footer-track-link">
                  {t("nav_track")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Disclaimer</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("footer_disclaimer")}</p>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-xs text-slate-500">
          Smart Bharat {"\u00a9"} {new Date().getFullYear()} {"\u00b7"} Built for Indian citizens
        </div>
      </div>
    </footer>
  );
};
