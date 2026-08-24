import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  QUEUE_STATUS_CONFIG,
  VISIT_STATUS_CONFIG,
  PRESCRIPTION_STATUS_CONFIG,
  INVOICE_STATUS_CONFIG,
  BATCH_STATUS_CONFIG,
  PURCHASE_STATUS_CONFIG,
} from "@/config/statusConfig";
import {
  QueueStatus,
  VisitStatus,
  PrescriptionStatus,
  InvoiceStatus,
  BatchStatus,
  PurchaseStatus,
} from "@/types";

interface StatusBadgeProps {
  status: string;
  type?: "queue" | "visit" | "prescription" | "invoice" | "batch" | "purchase" | "general";
  className?: string;
}

export function StatusBadge({ status, type = "general", className }: StatusBadgeProps) {
  let label = status;
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" = "secondary";

  if (type === "queue" && status in QUEUE_STATUS_CONFIG) {
    const config = QUEUE_STATUS_CONFIG[status as QueueStatus];
    label = config.label;
    variant = config.variant;
  } else if (type === "visit" && status in VISIT_STATUS_CONFIG) {
    const config = VISIT_STATUS_CONFIG[status as VisitStatus];
    label = config.label;
    variant = config.variant;
  } else if (type === "prescription" && status in PRESCRIPTION_STATUS_CONFIG) {
    const config = PRESCRIPTION_STATUS_CONFIG[status as PrescriptionStatus];
    label = config.label;
    variant = config.variant;
  } else if (type === "invoice" && status in INVOICE_STATUS_CONFIG) {
    const config = INVOICE_STATUS_CONFIG[status as InvoiceStatus];
    label = config.label;
    variant = config.variant;
  } else if (type === "batch" && status in BATCH_STATUS_CONFIG) {
    const config = BATCH_STATUS_CONFIG[status as BatchStatus];
    label = config.label;
    variant = config.variant;
  } else if (type === "purchase" && status in PURCHASE_STATUS_CONFIG) {
    const config = PURCHASE_STATUS_CONFIG[status as PurchaseStatus];
    label = config.label;
    variant = config.variant;
  } else if (status === "ACTIVE") {
    label = "Aktif";
    variant = "success";
  } else if (status === "INACTIVE") {
    label = "Non-aktif";
    variant = "secondary";
  }

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
