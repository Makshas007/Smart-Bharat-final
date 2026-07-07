import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, FileText, Clock, ExternalLink, AlertCircle, IndianRupee, Lightbulb } from "lucide-react";
import { simplifyService } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { ServiceIcon } from "@/lib/serviceIcons";

const SectionCard = ({ icon: Icon, title, children, tint }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
    className="rounded-xl border bg-white p-4"
  >
    <div className="flex items-center gap-2.5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}>
        <Icon size={16} />
      </span>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
    </div>
    <div className="mt-3">{children}</div>
  </motion.div>
);

export const ServiceDetailModal = ({ service, open, onOpenChange }) => {
  const { language, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!service) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const data = await simplifyService(service.key, language);
      setSummary(data.summary);
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load AI summary");
    } finally {
      setLoading(false);
    }
  }, [service, language]);

  useEffect(() => {
    if (open && service) load();
  }, [open, service, load]);

  if (!service) return null;
  const name = language === "hi" ? service.name_hi : service.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl bg-white" data-testid="service-detail-modal">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
              <ServiceIcon icon={service.icon} size={20} />
            </span>
            <div>
              <DialogTitle className="text-left text-lg font-bold text-slate-900" data-testid="service-detail-title">
                {name}
              </DialogTitle>
              <DialogDescription className="text-left text-sm text-slate-600">
                {language === "hi" ? service.description_hi : service.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading && (
          <div className="space-y-4" data-testid="service-detail-loading">
            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))]">
              <span className="flex gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
              {t("ai_generating")}
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4" data-testid="service-detail-error">
            <div className="flex items-center gap-2 text-sm font-medium text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
            <Button onClick={load} variant="outline" size="sm" className="mt-3 rounded-lg" data-testid="service-detail-retry-button">
              {t("retry")}
            </Button>
          </div>
        )}

        {summary && !loading && (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            data-testid="service-detail-summary"
          >
            <SectionCard icon={UserCheck} title={t("who_eligible")} tint="bg-emerald-50 text-emerald-700">
              <ul className="space-y-2">
                {(summary.eligibility || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard icon={FileText} title={t("documents_needed")} tint="bg-indigo-50 text-indigo-700">
              <ul className="space-y-2">
                {(summary.documents || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard icon={Clock} title={t("time_cost")} tint="bg-amber-50 text-amber-700">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock size={13} /> Time
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{summary.time_cost?.estimated_time}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <IndianRupee size={13} /> Cost
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{summary.time_cost?.cost}</p>
                </div>
              </div>
              {summary.time_cost?.notes && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm leading-relaxed text-amber-800">
                  <Lightbulb size={15} className="mt-0.5 shrink-0" />
                  {summary.time_cost.notes}
                </div>
              )}
            </SectionCard>
          </motion.div>
        )}

        <motion.div whileTap={{ scale: 0.95 }} className="pt-1">
          <Button
            asChild
            className="w-full rounded-xl bg-[hsl(var(--secondary))] font-semibold text-slate-900 hover:bg-[hsl(var(--secondary))]/90"
            data-testid="service-detail-apply-now-button"
          >
            <a href={service.apply_url} target="_blank" rel="noreferrer">
              {t("apply_now")}
              <ExternalLink size={16} className="ml-2" />
            </a>
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
