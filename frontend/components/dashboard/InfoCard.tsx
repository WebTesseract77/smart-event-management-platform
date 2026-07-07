import { Card, CardContent } from "@/components/ui/card";

export default function InfoCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0F4D3F]/10">
      <CardContent className="flex h-full items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        <div className="rounded-2xl bg-[#F5F2EA] p-3 text-[#0F4D3F]">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}