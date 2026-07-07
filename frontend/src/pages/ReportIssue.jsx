import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Upload,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageTransition } from "@/components/motion/PageTransition";
import { AnimatedCheckmark } from "@/components/motion/AnimatedCheckmark";
import { analyzeIssueImage, createIssue } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const CATEGORIES = [
  { key: "pothole", label: "Pothole", label_hi: "\u0917\u0921\u094d\u0922\u093e" },
  { key: "water_leakage", label: "Water Leakage", label_hi: "\u092a\u093e\u0928\u0940 \u0915\u093e \u0930\u093f\u0938\u093e\u0935" },
  { key: "garbage_waste", label: "Garbage / Waste", label_hi: "\u0915\u091a\u0930\u093e" },
  { key: "broken_streetlight", label: "Broken Streetlight", label_hi: "\u0916\u0930\u093e\u092c \u0938\u094d\u091f\u094d\u0930\u0940\u091f\u0932\u093e\u0907\u091f" },
  { key: "damaged_road", label: "Damaged Road", label_hi: "\u0915\u094d\u0937\u0924\u093f\u0917\u094d\u0930\u0938\u094d\u0924 \u0938\u0921\u093c\u0915" },
  { key: "sewage_drainage", label: "Sewage / Drainage", label_hi: "\u0938\u0940\u0935\u0930 / \u091c\u0932 \u0928\u093f\u0915\u093e\u0938" },
  { key: "stray_animals", label: "Stray Animals", label_hi: "\u0906\u0935\u093e\u0930\u093e \u092a\u0936\u0941" },
  { key: "other", label: "Other", label_hi: "\u0905\u0928\u094d\u092f" },
];

const SEVERITY_STYLES = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

export default function ReportIssue() {
  const { t, language } = useApp();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("auto");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    { n: 1, label: t("step_details"), icon: ClipboardList },
    { n: 2, label: t("step_photo"), icon: Camera },
    { n: 3, label: t("step_location"), icon: MapPin },
    { n: 4, label: t("step_review"), icon: Eye },
  ];

  const catLabel = (key) => {
    const c = CATEGORIES.find((c) => c.key === key);
    if (!c) return key;
    return language === "hi" ? c.label_hi : c.label;
  };

  const effectiveCategory = category === "auto" ? analysis?.category || "other" : category;

  const handleFile = async (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Please upload a JPEG, PNG or WebP image");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large (max 8 MB)");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysis(null);
    setAnalysisError(null);
    setAnalyzing(true);
    try {
      const data = await analyzeIssueImage(file);
      setAnalysis(data.analysis);
      setImageUrl(data.image_url);
      toast.success(`${catLabel(data.analysis.category)} ${t("detected")}`);
    } catch (e) {
      setAnalysisError(e?.response?.data?.detail || "AI analysis failed. You can still submit manually.");
    } finally {
      setAnalyzing(false);
    }
  };

  const canNext = () => {
    if (step === 1) return category === "auto" || !!category;
    if (step === 2) return !analyzing;
    if (step === 3) return location.trim().length >= 3;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        category: effectiveCategory,
        severity: analysis?.severity || "medium",
        description: description.trim() || analysis?.short_description || "",
        location: location.trim(),
        image_url: imageUrl,
        ai_analysis: analysis,
      };
      const data = await createIssue(payload);
      setResult(data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(result.tracking_id);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  // ---------- Success screen ----------
  if (result) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="shadow-card flex flex-col items-center rounded-2xl border bg-white p-8 text-center sm:p-10"
            data-testid="report-success-card"
          >
            <AnimatedCheckmark size={96} />
            <h1 className="mt-6 text-2xl font-bold text-slate-900">{t("success_title")}</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("success_sub")}</p>

            <div className="mt-6 w-full rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-500">{t("tracking_id")}</div>
              <div className="mt-1 flex items-center justify-center gap-3">
                <span
                  className="tabular-nums font-mono text-2xl font-bold tracking-wider text-[hsl(var(--primary))]"
                  data-testid="issue-tracking-id-value"
                >
                  {result.tracking_id}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={copyTrackingId}
                  aria-label="Copy tracking ID"
                  data-testid="copy-tracking-id-button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-slate-600 hover:text-slate-900"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </motion.button>
              </div>
            </div>

            <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  asChild
                  className="w-full rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                  data-testid="success-track-issue-button"
                >
                  <Link to={`/track?id=${result.tracking_id}`}>{t("track_this")}</Link>
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setResult(null);
                    setStep(1);
                    setCategory("auto");
                    setDescription("");
                    setImageFile(null);
                    setImagePreview(null);
                    setImageUrl(null);
                    setAnalysis(null);
                    setLocation("");
                  }}
                  data-testid="report-another-button"
                >
                  {t("report_another")}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // ---------- Multi-step form ----------
  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t("report_title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{t("report_sub")}</p>

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center gap-1.5" data-testid={`step-indicator-${s.n}`}>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                    step > s.n
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : step === s.n
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {step > s.n ? <CheckCircle2 size={17} /> : <s.icon size={16} />}
                </span>
                <span className={`text-xs font-medium ${step >= s.n ? "text-slate-900" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(step / 4) * 100} className="mt-4 h-2" data-testid="report-progress-bar" />
          <p className="mt-2 text-xs text-slate-500">
            {t("step")} {step} {t("of")} 4
          </p>
        </div>

        {/* Step content */}
        <div className="shadow-card mt-6 rounded-2xl border bg-white p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-slate-900">{t("issue_type")}</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-2 h-11 rounded-xl" data-testid="issue-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="auto" data-testid="category-option-auto">
                          {t("auto_detect")}
                        </SelectItem>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.key} value={c.key} data-testid={`category-option-${c.key}`}>
                            {language === "hi" ? c.label_hi : c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900">{t("describe_issue")}</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("describe_placeholder")}
                      rows={4}
                      className="mt-2 rounded-xl"
                      data-testid="issue-description-input"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  {!imagePreview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 transition-colors hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--accent))]/40"
                      data-testid="issue-photo-upload-button"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
                        <Upload size={22} />
                      </span>
                      <span className="mt-3 text-sm font-semibold text-slate-900">{t("upload_photo")}</span>
                      <span className="mt-1 text-xs text-slate-500">{t("upload_hint")}</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative overflow-hidden rounded-xl border">
                        <img src={imagePreview} alt="Issue" className="h-56 w-full object-cover" data-testid="issue-photo-preview" />
                        {analyzing && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                            <Loader2 size={28} className="animate-spin text-white" />
                            <span className="mt-2 text-sm font-medium text-white" data-testid="issue-analyzing-indicator">
                              {t("analyzing")}
                            </span>
                          </div>
                        )}
                      </div>

                      {analysis && !analyzing && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                          data-testid="issue-analysis-result"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                              {catLabel(analysis.category)} {t("detected")}
                            </Badge>
                            <Badge variant="outline" className={SEVERITY_STYLES[analysis.severity] || SEVERITY_STYLES.medium}>
                              {t("severity")}: {analysis.severity}
                            </Badge>
                            <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                              {Math.round((analysis.confidence || 0) * 100)}% {t("confidence")}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-700">{analysis.short_description}</p>
                        </motion.div>
                      )}

                      {analysisError && !analyzing && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" data-testid="issue-analysis-error">
                          <AlertCircle size={16} className="mt-0.5 shrink-0" />
                          {analysisError}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg"
                        disabled={analyzing}
                        data-testid="issue-change-photo-button"
                      >
                        {t("change_photo")}
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                    data-testid="issue-photo-input"
                  />
                  <p className="text-xs text-slate-500">{t("skip_photo_note")}</p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-900">{t("location_label")}</label>
                    <div className="relative mt-2">
                      <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("location_placeholder")}
                        className="h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-[hsl(var(--ring))]"
                        data-testid="issue-location-input"
                      />
                    </div>
                  </div>
                  <div className="map-placeholder relative flex h-44 items-center justify-center overflow-hidden rounded-xl border">
                    <div className="flex flex-col items-center text-slate-500">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card">
                        <MapPin size={18} className="text-[hsl(var(--secondary))]" />
                      </span>
                      <span className="mt-2 text-xs font-medium">{t("map_note")}</span>
                      {location.trim() && (
                        <span className="mt-1 max-w-[280px] truncate text-xs text-slate-600">{location}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4" data-testid="issue-review-section">
                  <h3 className="text-base font-semibold text-slate-900">{t("review_title")}</h3>
                  <div className="divide-y rounded-xl border">
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                      <span className="text-sm text-slate-500">{t("issue_type")}</span>
                      <span className="text-sm font-semibold text-slate-900">{catLabel(effectiveCategory)}</span>
                    </div>
                    {analysis && (
                      <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <span className="text-sm text-slate-500">{t("severity")}</span>
                        <Badge variant="outline" className={SEVERITY_STYLES[analysis.severity] || SEVERITY_STYLES.medium}>
                          {analysis.severity}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                      <span className="text-sm text-slate-500">{t("step_location")}</span>
                      <span className="max-w-[60%] truncate text-sm font-semibold text-slate-900">{location}</span>
                    </div>
                    {(description || analysis?.short_description) && (
                      <div className="px-4 py-3">
                        <span className="text-sm text-slate-500">{t("describe_issue")}</span>
                        <p className="mt-1 text-sm leading-relaxed text-slate-800">
                          {description || analysis?.short_description}
                        </p>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <img src={imagePreview} alt="Issue" className="h-40 w-full rounded-xl border object-cover" />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between border-t pt-5">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || submitting}
                className="rounded-xl"
                data-testid="issue-step-back-button"
              >
                {t("back")}
              </Button>
            </motion.div>
            {step < 4 ? (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  disabled={!canNext()}
                  className="rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                  data-testid="issue-step-next-button"
                >
                  {t("next")}
                </Button>
              </motion.div>
            ) : (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-[hsl(var(--secondary))] font-semibold text-slate-900 hover:bg-[hsl(var(--secondary))]/90"
                  data-testid="issue-submit-button"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    t("submit_report")
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
