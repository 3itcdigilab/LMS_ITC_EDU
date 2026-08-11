import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "./ui/card";
import { cn } from "./ui/utils";

export function Logo({ variant = "dark", size = "md" }: { variant?: "dark" | "light"; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "size-11" : size === "sm" ? "size-8" : "size-9";
  const text = size === "lg" ? "text-xl" : "text-base";
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("grid place-items-center rounded-xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-sm", dim)}>
        <GraduationCap className="size-5" strokeWidth={2.4} />
      </div>
      <div className="leading-tight">
        <div className={cn("font-display font-bold tracking-tight", text, variant === "light" ? "text-white" : "text-secondary dark:text-white")} style={{ fontFamily: "var(--font-display)" }}>
          3itcedu
        </div>
        <div className={cn("text-[11px] -mt-0.5", variant === "light" ? "text-slate-300" : "text-muted-foreground dark:text-slate-400")}>
          Digital Education
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-secondary" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, delta, tone = "primary" }: { label: string; value: string; icon: ReactNode; delta?: string; tone?: "primary" | "success" | "warning" | "neutral" }) {
  const tones: Record<string, string> = {
    primary: "bg-accent text-primary",
    success: "bg-green-50 text-success",
    warning: "bg-amber-50 text-warning",
    neutral: "bg-slate-100 text-slate-600",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
          {delta && <p className="mt-1 text-xs text-success">{delta}</p>}
        </div>
        <div className={cn("grid size-10 place-items-center rounded-xl", tones[tone])}>{icon}</div>
      </div>
    </Card>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Beginner: "bg-green-50 text-success border-green-200",
    Intermediate: "bg-blue-50 text-primary border-blue-200",
    Advanced: "bg-purple-50 text-purple-600 border-purple-200",
    Capstone: "bg-amber-50 text-warning border-amber-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", map[level] || map.Beginner)}>
      {level}
    </span>
  );
}

export function CategoryDot({ name }: { name: string }) {
  return <span className="text-xs text-muted-foreground">{name}</span>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 px-6 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="mt-4 font-semibold text-secondary" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

export function ConfirmDeleteModal({
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus item ini? Data yang dihapus tidak dapat dikembalikan.",
  itemName,
  isOpen,
  onConfirm,
  onClose,
}: {
  title?: string;
  description?: string;
  itemName?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-md p-6 bg-card border-destructive/20 shadow-2xl space-y-4 text-center relative">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="size-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {itemName && (
            <p className="text-sm font-semibold text-destructive mt-1 line-clamp-1">
              "{itemName}"
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Ya, Hapus
          </Button>
        </div>
      </Card>
    </div>
  );
}
