import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <Card className="group min-h-[160px] rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{value}</h2>
          </div>

          {icon && (
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 dark:bg-violet-500/15 dark:text-violet-300">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Live dashboard metric</span>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
            <ArrowUpRight className="h-4 w-4" />
            Trend
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
