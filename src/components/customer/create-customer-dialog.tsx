"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus } from "lucide-react";

import { useCustomers } from "@/lib/customer/store";
import { CSM_OPTIONS } from "@/lib/customer/service";
import { customerPath } from "@/lib/customer/paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function CreateCustomerDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const { create, currentUser } = useCustomers();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [csm, setCsm] = React.useState(currentUser);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName("");
      setCompany("");
      setCsm(currentUser);
      setError(null);
    }
  }, [open, currentUser]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }
    const customer = create({ name, companyName: company || name, assignedCsm: csm });
    setOpen(false);
    router.push(customerPath(customer.id));
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus /> New Customer
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-4 text-primary" /> Create new customer
            </DialogTitle>
            <DialogDescription>Start a fresh onboarding workspace.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 px-6 pb-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cust-name" className="text-xs font-medium text-muted-foreground">
                Customer name <span className="text-destructive">*</span>
              </label>
              <Input
                id="cust-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sierra Air Partners"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cust-company" className="text-xs font-medium text-muted-foreground">
                Company name
              </label>
              <Input
                id="cust-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Legal / full company name (optional)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cust-csm" className="text-xs font-medium text-muted-foreground">
                Assigned CSM
              </label>
              <select
                id="cust-csm"
                value={csm}
                onChange={(e) => setCsm(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CSM_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
