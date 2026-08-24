import {
  Baby,
  BookOpenText,
  Car,
  CircleDollarSign,
  CloudLightning,
  CloudRain,
  Coins,
  Compass,
  Croissant,
  Divide,
  DoorClosed,
  DoorOpen,
  Droplets,
  Flower2,
  Gift,
  GlassWater,
  GraduationCap,
  Hand,
  HeartHandshake,
  HeartPulse,
  Landmark,
  LogIn,
  LogOut,
  Moon,
  MoonStar,
  Mountain,
  Plane,
  Rows3,
  ShieldCheck,
  ShieldAlert,
  Shirt,
  ShowerHead,
  Soup,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Store,
  Timer,
  Users,
  Utensils,
  Wind,
  Zap,
  Flame,
  Star,
  Handshake,
  Bed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InvocationIcon as IconKey } from "@/lib/nur-data";

/** Every invocation gets its own pictogram. */
const MAP: Record<IconKey, LucideIcon> = {
  sunrise: Sunrise,
  utensils: Utensils,
  heart: HeartHandshake,
  "door-out": DoorOpen,
  "door-in": DoorClosed,
  shield: ShieldCheck,
  moon: Moon,
  sparkles: Sparkles,
  plane: Plane,
  hands: Hand,
  "wc-in": LogIn,
  "wc-out": LogOut,
  wudu: Droplets,
  "wudu-after": Hand,
  "shirt-off": Rows3,
  "shirt-on": Shirt,
  shower: ShowerHead,
  "mosque-in": Landmark,
  "mosque-out": Mountain,
  prayer: Compass,
  quran: BookOpenText,
  tasbih: Divide,
  kaaba: Star,
  rain: CloudRain,
  wind: Wind,
  thunder: CloudLightning,
  sun: Sun,
  night: Sunset,
  mirror: Flower2,
  market: Store,
  money: Coins,
  car: Car,
  sick: HeartPulse,
  grief: Flame,
  anger: Zap,
  debt: CircleDollarSign,
  study: GraduationCap,
  gift: Gift,
  child: Baby,
  marriage: Handshake,
  guest: Soup,
  sneeze: ShieldAlert,
  fear: Bed,
  cemetery: Users,
  drink: GlassWater,
  "fasting-break": Timer,
  "new-moon": MoonStar,
  friday: Croissant,
};

/** Pictogram badge used on invocation cards, sharing the app gradient/glass style. */
export function InvocationPictogram({ icon }: { icon: IconKey }) {
  const Icon = MAP[icon] ?? Sparkles;
  return (
    <span className="widget-badge size-9 shrink-0">
      <Icon className="size-[18px]" />
    </span>
  );
}

/** Small variant reused in horizontal lists. */
export function InvocationGlyph({ icon, className }: { icon: IconKey; className?: string }) {
  const Icon = MAP[icon] ?? Sparkles;
  return <Icon className={className ?? "size-4"} />;
}
