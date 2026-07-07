import { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  icon?: ReactNode;
};

export default function SectionHeading({
  eyebrow,
  title,
  icon,
}: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs uppercase tracking-[0.25em] text-[#0F4D3F]">
            {eyebrow}
          </p>
        )}

        <h2 className="font-serif text-[2rem] leading-[0.95] tracking-[-0.04em] text-[#183028]">
  {title}
</h2>
      </div>

      {icon && (
        <div className="rounded-2xl bg-[#F5F2EA] p-3 text-[#0F4D3F]">
          {icon}
        </div>
      )}
    </div>
  );
}