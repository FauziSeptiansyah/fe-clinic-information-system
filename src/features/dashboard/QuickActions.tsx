import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

export interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  iconClassName?: string;
}

export function QuickActionsCard({ title, actions }: { title: string; actions: QuickAction[] }) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="p-5 pb-3 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="block">
            <Button variant="outline" className="w-full justify-start text-xs h-9 font-medium">
              <action.icon className={"h-4 w-4 mr-2 " + (action.iconClassName || "text-blue-600")} />
              {action.label}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
