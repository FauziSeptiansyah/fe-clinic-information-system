const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf8");
  console.log("Created: " + filePath);
}

// 1. COMMON COMPONENTS
// PageContainer.tsx
writeFile("src/components/common/PageContainer.tsx", `
import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "default" | "full" | "sm" | "md" | "lg" | "xl";
}

export function PageContainer({
  children,
  className,
  maxWidth = "default",
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
`);

// PageHeader.tsx
writeFile("src/components/common/PageHeader.tsx", `
import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
  backButton,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200", className)}>
      <div className="flex items-start gap-3">
        {backButton && <div className="mt-1">{backButton}</div>}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {badge && <div>{badge}</div>}
          </div>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
`);

// SectionHeader.tsx
writeFile("src/components/common/SectionHeader.tsx", `
import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
`);

// States: EmptyState, LoadingState, ErrorState
writeFile("src/components/common/EmptyState.tsx", `
import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: any;
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
`);

writeFile("src/components/common/LoadingState.tsx", `
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
`);

writeFile("src/components/common/ErrorState.tsx", `
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
`);

// ConfirmDialog.tsx
writeFile("src/components/common/ConfirmDialog.tsx", `
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "success";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : variant === "success" ? "success" : "default"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`);

// StatusBadge.tsx
writeFile("src/components/common/StatusBadge.tsx", `
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

interface StatusBadgeProps {
  status: string;
  type?: "queue" | "visit" | "prescription" | "invoice" | "batch" | "purchase" | "general";
  className?: string;
}

export function StatusBadge({ status, type = "general", className }: StatusBadgeProps) {
  let label = status;
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" = "secondary";

  if (type === "queue" && (QUEUE_STATUS_CONFIG as any)[status]) {
    const config = (QUEUE_STATUS_CONFIG as any)[status];
    label = config.label;
    variant = config.variant;
  } else if (type === "visit" && (VISIT_STATUS_CONFIG as any)[status]) {
    const config = (VISIT_STATUS_CONFIG as any)[status];
    label = config.label;
    variant = config.variant;
  } else if (type === "prescription" && (PRESCRIPTION_STATUS_CONFIG as any)[status]) {
    const config = (PRESCRIPTION_STATUS_CONFIG as any)[status];
    label = config.label;
    variant = config.variant;
  } else if (type === "invoice" && (INVOICE_STATUS_CONFIG as any)[status]) {
    const config = (INVOICE_STATUS_CONFIG as any)[status];
    label = config.label;
    variant = config.variant;
  } else if (type === "batch" && (BATCH_STATUS_CONFIG as any)[status]) {
    const config = (BATCH_STATUS_CONFIG as any)[status];
    label = config.label;
    variant = config.variant;
  } else if (type === "purchase" && (PURCHASE_STATUS_CONFIG as any)[status]) {
    const config = (PURCHASE_STATUS_CONFIG as any)[status];
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
`);

// Formats & Displays: CurrencyDisplay, DateDisplay, UserAvatar, StatCard, DetailCard, DetailRow
writeFile("src/components/common/Displays.tsx", `
import * as React from "react";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/utils";
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
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback>{initials}</AvatarFallback>
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
  icon?: any;
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
`);

// PermissionGuard.tsx
writeFile("src/components/common/PermissionGuard.tsx", `
import * as React from "react";
import { Permission } from "@/types";
import { useAuthStore } from "@/stores/authStore";

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const can = useAuthStore((state) => state.can);
  const isAllowed = can(permission);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
`);

// 2. FORM COMPONENTS
writeFile("src/components/forms/FormControls.tsx", `
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

export function FormFieldWrapper({
  label,
  required,
  error,
  helperText,
  className,
  children,
}: BaseFieldProps & { children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 font-bold">*</span>}
      </Label>
      {children}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      {error && <p className="text-xs font-medium text-red-600 animate-in fade-in-50">{error}</p>}
    </div>
  );
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, required, error, helperText, className, ...props }, ref) => {
    return (
      <FormFieldWrapper label={label} required={required} error={error} helperText={helperText} className={className}>
        <Input ref={ref} className={cn(error && "border-red-500 focus-visible:ring-red-500")} {...props} />
      </FormFieldWrapper>
    );
  }
);
FormInput.displayName = "FormInput";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, required, error, helperText, className, ...props }, ref) => {
    return (
      <FormFieldWrapper label={label} required={required} error={error} helperText={helperText} className={className}>
        <Textarea ref={ref} className={cn(error && "border-red-500 focus-visible:ring-red-500")} {...props} />
      </FormFieldWrapper>
    );
  }
);
FormTextarea.displayName = "FormTextarea";

export interface FormSelectProps extends BaseFieldProps {
  value?: string;
  onValueChange?: (val: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
}

export function FormSelect({
  label,
  required,
  error,
  helperText,
  className,
  value,
  onValueChange,
  placeholder = "Pilih opsi...",
  options,
  disabled,
}: FormSelectProps) {
  return (
    <FormFieldWrapper label={label} required={required} error={error} helperText={helperText} className={className}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-red-500")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
}
`);

// 3. DATA TABLE GENERIC (TanStack Table)
writeFile("src/components/data-table/DataTable.tsx", `
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Search } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  filterComponent?: React.ReactNode;
  actionComponent?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Cari data...",
  isLoading = false,
  filterComponent,
  actionComponent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchKey && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                className="pl-8 bg-white"
              />
            </div>
          )}
          {filterComponent}
        </div>
        <div className="flex items-center gap-2">
          {actionComponent}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Kolom
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-md border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center p-0">
                    <EmptyState />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <div>
          Total <strong>{table.getFilteredRowModel().rows.length}</strong> data rekaman
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>
          <span className="text-xs font-medium">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
`);

// 4. PROVIDERS
writeFile("src/providers/index.tsx", `
"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
`);

console.log("Finished generating common, forms, data-table and providers.");
