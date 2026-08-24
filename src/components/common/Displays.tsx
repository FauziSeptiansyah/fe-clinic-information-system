import * as React from "react";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CurrencyDisplay({ amount, className }: { amount: number | null | undefined; className?: string }) {
  return <span className={cn("font-medium tracking-tight", className)}>{formatCurrency(amount)}</span>;
}

export function DateDisplay({ date, pattern, className }: { date: string | Date | null | undefined; pattern?: string; className?: string }) {
  return <span className={cn("text-slate-700", className)}>{formatDate(date, pattern)}</span>;
}

export function DateTimeDisplay({ date, className }: { date: string | Date | null | undefined; className?: string }) {
  return <span className={cn("text-slate-700", className)}>{formatDateTime(date)}</span>;
}

export function NumberDisplay({ num, className }: { num: number | string | null | undefined; className?: string }) {
  return <span className={cn("font-medium", className)}>{formatNumber(num)}</span>;
}

export function UserAvatar({ name, image, size = "md", className }: { name: string; image?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const initials = getInitials(name);
  const { gradient, ring } = getAvatarGradient(name);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <Avatar className={cn(sizeClasses[size], "ring-2", ring, className)}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback className={cn("bg-gradient-to-br font-semibold text-white", gradient)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {Icon && (
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            {trend && (
              <span className={cn("font-semibold", trend.positive ? "text-emerald-600" : "text-red-600")}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DetailCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

export function DetailRow({
  label,
  value,
  children,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-100 last:border-0", className)}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 sm:col-span-2 font-normal">
        {value ?? children ?? "-"}
      </dd>
    </div>
  );
}
