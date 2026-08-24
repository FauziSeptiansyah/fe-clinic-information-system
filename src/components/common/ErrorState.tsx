import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  description = "Gagal memproses atau mengambil data dari layanan.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 p-8 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900 mb-1">{title}</h3>
      <p className="max-w-md text-sm text-red-700 mb-4">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-red-300 text-red-700 hover:bg-red-100">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
