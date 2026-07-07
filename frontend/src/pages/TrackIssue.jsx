import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2, AlertCircle, MapPin, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion/PageTransition";
import { IssueTimeline } from "@/components/issues/IssueTimeline";
import { getIssue, BACKEND_URL } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const SEVERITY_STYLES = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

export default function TrackIssue() {
  const { t, language } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [loading, setLoading] = useState(false);
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState(null);

  const search = useCallback(
    async (id) => {
      const tid = (id || "").trim().toUpperCase();
      if (!tid) return;
      setLoading(true);
      setError(null);
      setIssue(null);
      try {
        const data = await getIssue(tid);
        setIssue(data);
        setSearchParams({ id: tid }, { replace: true });
      } catch (e) {
        setError(e?.response?.status === 404 ? t("not_found") : "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [setSearchParams, t]
  );

  // Auto-search if ?id= present
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) search(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t("track_title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{t("track_sub")}</p>

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            search(trackingId);
          }}
        >
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              placeholder={t("track_placeholder")}
              aria-label="Tracking ID"
              data-testid="track-issue-input"
              className="tabular-nums h-12 w-full rounded-xl border bg-white pl-10 pr-4 font-mono text-sm font-semibold tracking-wider outline-none transition-colors focus:border-[hsl(var(--ring))]"
            />
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={loading || !trackingId.trim()}
              className="h-12 rounded-xl bg-[hsl(var(--primary))] px-6 font-semibold text-white hover:bg-[hsl(var(--primary))]/90"
              data-testid="track-issue-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {t("tracking")}
                </>
              ) : (
                t("track_button")
              )}
            </Button>
          </motion.div>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            data-testid="track-issue-error"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </motion.div>
        )}

        {issue && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-5" data-testid="track-issue-result">
            {/* Issue details card */}
            <div className="shadow-card rounded-2xl border bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-500">{t("tracking_id")}</div>
                  <div className="tabular-nums mt-0.5 font-mono text-xl font-bold tracking-wider text-[hsl(var(--primary))]" data-testid="tracked-issue-id">
                    {issue.tracking_id}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">
                    {language === "hi" ? issue.category_label_hi : issue.category_label}
                  </Badge>
                  <Badge variant="outline" className={SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.medium}>
                    {t("severity")}: {issue.severity}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  {issue.location}
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CalendarDays size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  {t("reported_on")}{" "}
                  {new Date(issue.created_at).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </div>
                {issue.description && <p className="leading-relaxed text-slate-600">{issue.description}</p>}
              </div>

              {issue.image_url && (
                <img
                  src={`${BACKEND_URL}${issue.image_url}`}
                  alt="Reported issue"
                  className="mt-4 h-48 w-full rounded-xl border object-cover"
                  data-testid="tracked-issue-image"
                />
              )}
            </div>

            {/* Timeline */}
            <div className="shadow-card rounded-2xl border bg-white p-6">
              <h3 className="mb-5 text-base font-semibold text-slate-900">{t("status_timeline")}</h3>
              <IssueTimeline timeline={issue.timeline} />
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
