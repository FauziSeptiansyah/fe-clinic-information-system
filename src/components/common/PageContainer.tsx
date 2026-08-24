import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "default" | "full" | "sm" | "md" | "lg" | "xl";
}

export function PageContainer({
  children,
  className,
  maxWidth = "full",
  ...props
}: PageContainerProps) {
  const maxWidthClasses = {
    default: "max-w-7xl",
    full: "max-w-full",
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-in fade-in-50 duration-200",
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
