import {
  Fingerprint,
  CreditCard,
  Plane,
  Vote,
  Car,
  Wheat,
  HeartPulse,
  Tractor,
  Landmark,
} from "lucide-react";

const ICON_MAP = {
  fingerprint: Fingerprint,
  "credit-card": CreditCard,
  plane: Plane,
  vote: Vote,
  car: Car,
  wheat: Wheat,
  "heart-pulse": HeartPulse,
  tractor: Tractor,
};

export const ServiceIcon = ({ icon, size = 20 }) => {
  const Icon = ICON_MAP[icon] || Landmark;
  return <Icon size={size} />;
};
