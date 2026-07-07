import { motion } from "framer-motion";

export const AnimatedCheckmark = ({ size = 96 }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    {/* Expanding rings */}
    <span
      className="success-ring absolute inset-0 rounded-full border-4 border-emerald-500/50"
      style={{ animationDelay: "0.3s" }}
    />
    <span
      className="success-ring absolute inset-0 rounded-full border-4 border-emerald-500/30"
      style={{ animationDelay: "0.55s" }}
    />
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <motion.circle
        cx="48"
        cy="48"
        r="42"
        stroke="#16A34A"
        strokeWidth="5"
        strokeLinecap="round"
        fill="rgba(22,163,74,0.08)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M30 49 L43 62 L67 36"
        stroke="#16A34A"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.5, ease: "easeOut" }}
      />
    </svg>
  </div>
);
