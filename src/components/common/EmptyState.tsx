import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Tidak ada data ditemukan",
  description = "Belum ada rekaman data yang tersedia atau sesuai dengan filter saat ini.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
