import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Compass className="size-6" />
      </span>
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        That page isn&apos;t part of the playbook. Head back to the dashboard to pick up where you
        left off.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
