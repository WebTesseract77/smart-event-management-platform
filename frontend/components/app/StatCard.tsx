import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

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
<Card className="rounded-2xl shadow-sm hover:shadow-md transition-all min-h-[140px]">
          <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {value}
            </h2>
          </div>

          {icon && (
            <div className="text-violet-600">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}