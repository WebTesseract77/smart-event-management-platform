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
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="mb-1 text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.25em] text-[#0F4D3F] break-words">
            {eyebrow}
          </p>
        )}

        <h2
          className="
            break-words

            font-serif

            text-[1.5rem]
            sm:text-[1.75rem]
            lg:text-[2rem]

            leading-[1.05]
            tracking-[-0.03em]

            text-[#183028]
          "
        >
          {title}
        </h2>
      </div>

      {icon && (
        <div className="shrink-0 rounded-2xl bg-[#F5F2EA] p-2.5 sm:p-3 text-[#0F4D3F]">
          {icon}
        </div>
      )}
    </div>
  );
}