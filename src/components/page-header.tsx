import Link from "next/link";

import { getIcon } from "@/lib/icons";

export function PageHeader({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const Icon = getIcon(icon);
  return (
    <div>
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground no-print">
        <Link href="/" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <div className="flex items-start gap-4">
        <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
