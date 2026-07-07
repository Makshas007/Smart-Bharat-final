import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { ServiceIcon } from "@/lib/serviceIcons";

export const ServiceCard = ({ service, onClick }) => {
  const { language, t } = useApp();
  const name = language === "hi" ? service.name_hi : service.name;
  const description = language === "hi" ? service.description_hi : service.description;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-testid={`service-card-${service.key}`}
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -5, boxShadow: "0 18px 45px -22px rgba(15,23,42,0.35)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="shadow-card group flex w-full flex-col items-start rounded-2xl border bg-white p-5 text-left"
    >
      <div className="flex w-full items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
          <ServiceIcon icon={service.icon} size={20} />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {(service.badges || []).slice(0, 2).map((b) => (
            <Badge
              key={b}
              variant="outline"
              className={
                b === "Popular"
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }
            >
              {b}
            </Badge>
          ))}
        </div>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{name}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--primary))]">
        {t("simplify")}
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </motion.button>
  );
};
