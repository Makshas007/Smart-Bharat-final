import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessagesSquare, Wand2, MapPinned, ArrowRight, Camera, Languages, BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion/PageTransition";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceDetailModal } from "@/components/services/ServiceDetailModal";
import { fetchServices } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function Home() {
  const { t, setChatOpen } = useApp();
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(() => {});
  }, []);

  const howItWorks = [
    { icon: MessagesSquare, title: t("how_1_title"), desc: t("how_1_desc") },
    { icon: Wand2, title: t("how_2_title"), desc: t("how_2_desc") },
    { icon: MapPinned, title: t("how_3_title"), desc: t("how_3_desc") },
  ];

  return (
    <PageTransition>
      {/* Hero */}
      <section className="hero-gradient">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                data-testid="hero-badge"
              >
                <BotMessageSquare size={13} />
                {t("hero_badge")}
              </motion.span>
              <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {t("hero_title_1")}
                <br />
                <span className="text-[hsl(var(--primary))]">{t("hero_title_2")}</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">{t("hero_sub")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-xl bg-[hsl(var(--primary))] px-6 text-base font-semibold text-white hover:bg-[hsl(var(--primary))]/90"
                    data-testid="hero-primary-cta-button"
                  >
                    <Link to="/services">
                      {t("hero_cta_primary")}
                      <ArrowRight size={18} className="ml-1.5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-2 border-[hsl(var(--secondary))] px-6 text-base font-semibold text-slate-900 hover:bg-[hsl(var(--secondary))]/10"
                    data-testid="hero-secondary-cta-button"
                  >
                    <Link to="/report">
                      <Camera size={18} className="mr-1.5" />
                      {t("hero_cta_secondary")}
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Stats */}
              <motion.div
                className="mt-10 grid max-w-md grid-cols-3 gap-4"
                initial="hidden"
                animate="show"
                variants={stagger}
              >
                {[
                  { value: "8+", label: t("stats_services") },
                  { value: "2", label: t("stats_languages") },
                  { value: "24/7", label: t("stats_ai") },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    className="rounded-xl border bg-white/70 p-3 backdrop-blur"
                  >
                    <div className="tabular-nums text-xl font-bold text-[hsl(var(--primary))]">{s.value}</div>
                    <div className="mt-0.5 text-xs leading-snug text-slate-600">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right preview stack */}
            <div className="relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="shadow-card rounded-2xl border bg-white p-5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Languages size={16} className="text-[hsl(var(--primary))]" />
                  {"Civic AI \u00b7 \u0938\u093f\u0935\u093f\u0915 AI"}
                </div>
                <div className="mt-4 space-y-3">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-slate-900 px-3.5 py-2.5 text-sm text-white">
                    How do I apply for a PAN card?
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
                    {"You can apply online in 3 simple steps: visit the NSDL portal, fill Form 49A, and pay \u20b9107..."}
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="shadow-card mt-4 flex items-center justify-between rounded-2xl border bg-white p-5"
              >
                <div>
                  <div className="text-xs font-medium text-slate-500">{t("tracking_id")}</div>
                  <div className="tabular-nums mt-0.5 font-mono text-lg font-bold text-slate-900">SB-4X9K2A</div>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">In Review</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("featured_title")}</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">{t("featured_sub")}</p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
            data-testid="home-view-all-services-link"
          >
            {t("view_all")}
            <ArrowRight size={15} />
          </Link>
        </div>
        <motion.div
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {services.slice(0, 6).map((service) => (
            <ServiceCard
              key={service.key}
              service={service}
              onClick={() => {
                setSelected(service);
                setModalOpen(true);
              }}
            />
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("how_title")}</h2>
          <motion.div
            className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="rounded-2xl border bg-slate-50 p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
                  <step.icon size={20} />
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <span className="tabular-nums text-xs font-bold text-[hsl(var(--secondary))]">0{i + 1}</span>
                  <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl bg-[hsl(var(--primary))] px-6 py-10 sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">{t("cta_band_title")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-indigo-100 sm:text-base">{t("cta_band_sub")}</p>
            </div>
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-[hsl(var(--secondary))] px-6 text-base font-semibold text-slate-900 hover:bg-[hsl(var(--secondary))]/90"
                data-testid="cta-band-report-button"
              >
                <Link to="/report">
                  <Camera size={18} className="mr-1.5" />
                  {t("cta_band_button")}
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <ServiceDetailModal service={selected} open={modalOpen} onOpenChange={setModalOpen} />
    </PageTransition>
  );
}
