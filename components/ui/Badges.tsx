import clsx from "clsx";
import { Globe, MapPin, Laptop, Users, User } from "lucide-react";
import type { Mode, GameType, EventStatus } from "@/lib/types";

/** Small rounded pill used across event/game cards. */
export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full",
        className,
      )}
    >
      {children}
    </span>
  );
}

const MODE_META: Record<
  Mode,
  { label: string; icon: typeof Globe; className: string }
> = {
  online: {
    label: "Online",
    icon: Laptop,
    className: "bg-brand-blue/10 text-brand-blue",
  },
  offline: {
    label: "Offline",
    icon: MapPin,
    className: "bg-brand-green/10 text-brand-green",
  },
  hybrid: {
    label: "Hybrid",
    icon: Globe,
    className: "bg-brand-red/10 text-brand-red",
  },
};

export function ModeBadge({ mode }: { mode: Mode }) {
  const m = MODE_META[mode];
  const Icon = m.icon;
  return (
    <Pill className={m.className}>
      <Icon size={13} /> {m.label}
    </Pill>
  );
}

export function GameTypeBadge({ type }: { type: GameType }) {
  if (type === "team") {
    return (
      <Pill className="bg-brand-blue/10 text-brand-blue">
        <Users size={13} /> Team
      </Pill>
    );
  }
  return (
    <Pill className="bg-brand-green/10 text-brand-green">
      <User size={13} /> Individual
    </Pill>
  );
}

const STATUS_META: Record<EventStatus, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-brand-green text-white" },
  ongoing: { label: "Live", className: "bg-brand-red text-white" },
  past: { label: "Past", className: "bg-gray-200 text-gray-600" },
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const s = STATUS_META[status];
  return (
    <Pill className={clsx("uppercase tracking-wide", s.className)}>
      {s.label}
    </Pill>
  );
}

/** Format YYYY-MM-DD into a friendly label without timezone surprises. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Short month + day for the date badge overlay on cards. */
export function formatShortDate(iso: string): { month: string; day: string } {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return { month: "", day: "" };
  const date = new Date(y, m - 1, d);
  return {
    month: date.toLocaleString("en-US", { month: "short" }),
    day: String(d),
  };
}

/** Deterministic gradient for cards without a cover image (brand palette). */
export function brandGradient(seed: string): string {
  const grads = [
    "from-brand-blue/80 to-brand-green/80",
    "from-brand-green/80 to-brand-blue/80",
    "from-brand-red/70 to-brand-blue/80",
    "from-brand-blue/80 to-brand-red/70",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return grads[h % grads.length];
}
