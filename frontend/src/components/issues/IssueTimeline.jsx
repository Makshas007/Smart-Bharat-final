import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { useApp } from "@/context/AppContext";

const STAGE_COLORS = {
  submitted: "text-[hsl(var(--primary))] border-[hsl(var(--primary))]",
  in_review: "text-amber-600 border-amber-500",
  resolved: "text-emerald-600 border-emerald-500",
};

export const IssueTimeline = ({ timeline }) => {
  const { language } = useApp();

  // find the first incomplete stage = current
  const currentIdx = timeline.findIndex((s) => !s.completed);

  return (
    <motion.ol
      className="relative ml-3 space-y-6 border-l-2 border-slate-200 pl-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      data-testid="issue-timeline"
    >
      {timeline.map((stage, idx) => {
        const isCurrent = idx === currentIdx;
        const label = language === "hi" ? stage.label_hi : stage.label;
        return (
          <motion.li
            key={stage.stage}
            variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
            className="relative"
            data-testid={`timeline-stage-${stage.stage}`}
          >
            <span
              className={`absolute -left-[35px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white ${
                stage.completed
                  ? STAGE_COLORS[stage.stage] || "text-emerald-600"
                  : isCurrent
                    ? "text-amber-500"
                    : "text-slate-300"
              }`}
            >
              {stage.completed ? (
                <CheckCircle2 size={18} className="fill-white" />
              ) : isCurrent ? (
                <Clock3 size={18} className="fill-white" />
              ) : (
                <Circle size={18} className="fill-white" />
              )}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={`text-sm font-semibold ${
                  stage.completed ? "text-slate-900" : isCurrent ? "text-amber-700" : "text-slate-400"
                }`}
              >
                {label}
              </h4>
              {stage.timestamp && (
                <span className="tabular-nums text-xs text-slate-500">
                  {new Date(stage.timestamp).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm leading-relaxed ${stage.completed || isCurrent ? "text-slate-600" : "text-slate-400"}`}>
              {stage.note}
            </p>
          </motion.li>
        );
      })}
    </motion.ol>
  );
};
