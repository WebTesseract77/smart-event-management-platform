import React from "react";

interface PageHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ badge, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {badge && (
        <div className="inline-block text-sm px-3 py-1 rounded-full bg-white/3 text-[color:var(--primary-foreground)] mb-3">{badge}</div>
      )}
      <h1 className="text-4xl font-semibold leading-[1.2]">{title}</h1>
      {subtitle && <p className="text-[color:var(--secondary-foreground)] mt-2 max-w-2xl">{subtitle}</p>}
    </div>
  );
}
