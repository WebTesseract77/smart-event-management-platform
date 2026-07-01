import React from "react";

export default function HelpCard() {
  const containerProps = { className: "bg-[color:var(--card)] rounded-[18px] p-4 border", style: { borderColor: "var(--border)" } } as any;
  const title = React.createElement("div", { className: "text-sm text-white font-semibold" }, "Need help?");
  const desc = React.createElement("p", { className: "text-[color:var(--secondary-foreground)] text-sm mt-2" }, "Visit our docs or contact support.");
  const link = React.createElement(
    "a",
    { className: "inline-block mt-3 px-3 py-1.5 rounded-[14px] border border-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]", href: "#", "aria-label": "View documentation" },
    "View Docs"
  );

  return React.createElement("div", containerProps, title, desc, link);
}
