import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  title = "Memuat data...",
  description = "Mohon tunggu sebentar selagi sistem mengambil informasi.",
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-slate-100 p-8 text-center", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <h3 className="text-base font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}
