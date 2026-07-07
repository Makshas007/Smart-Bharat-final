import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { PageTransition } from "@/components/motion/PageTransition";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceDetailModal } from "@/components/services/ServiceDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchServices } from "@/lib/api";
import { useApp } from "@/context/AppContext";

export default function Services() {
  const { t, language } = useApp();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.name_hi || "").includes(query.trim()) ||
        s.key.includes(q)
    );
  }, [services, query]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t("services_title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{t("services_sub")}</p>

        <div className="relative mt-6 max-w-md">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("services_search")}
            aria-label="Search services"
            data-testid="services-search-input"
            className="h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-[hsl(var(--ring))]"
          />
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border bg-white p-5">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="mt-4 h-5 w-3/5" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            key={`${query}-${language}`}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            data-testid="services-grid"
          >
            {filtered.map((service) => (
              <ServiceCard
                key={service.key}
                service={service}
                onClick={() => {
                  setSelected(service);
                  setModalOpen(true);
                }}
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-slate-500" data-testid="services-no-results">
                No services match your search.
              </p>
            )}
          </motion.div>
        )}
      </div>

      <ServiceDetailModal service={selected} open={modalOpen} onOpenChange={setModalOpen} />
    </PageTransition>
  );
}
