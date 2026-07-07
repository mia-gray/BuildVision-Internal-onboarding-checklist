"use client";

/**
 * React binding for the customer data layer. Holds the list of customers in
 * state, persists every change through the repository, and syncs across tabs.
 * Components use the hooks here and never touch storage directly.
 */
import * as React from "react";

import { customerRepository as repo, CUSTOMERS_STORAGE_KEY } from "./repository";
import {
  addNote as svcAddNote,
  applyStatus,
  createCustomer as svcCreate,
  duplicateCustomer,
  markChecklistFinished,
  markIntakeSent,
  removeNote as svcRemoveNote,
  setChecklistItem,
  updateIntake as svcUpdateIntake,
  computeProgress,
} from "./service";
import type {
  Customer,
  CustomerStatus,
  IntakeSurvey,
  NewCustomerInput,
  NoteCategory,
} from "./types";
import { seedCustomers } from "./seed";

const CURRENT_USER_KEY = "bv.currentUser.v1";
const RECENT_KEY = "bv.recentCustomers.v1";
const SEED_FLAG_KEY = "bv.seeded.v1";

interface CustomerStore {
  loading: boolean;
  customers: Customer[];
  currentUser: string;
  setCurrentUser: (name: string) => void;
  recentIds: string[];
  getCustomer: (id: string) => Customer | undefined;
  create: (input: NewCustomerInput) => Customer;
  duplicate: (id: string) => Customer | undefined;
  remove: (id: string) => void;
  setArchived: (id: string, archived: boolean) => void;
  setStatus: (id: string, status: CustomerStatus) => void;
  toggleStep: (
    id: string,
    step: { id: string; title: string },
    done: boolean,
    allStepIds: string[],
  ) => void;
  setStepNote: (id: string, stepId: string, note: string) => void;
  addNote: (id: string, body: string, category: NoteCategory) => void;
  removeNote: (id: string, noteId: string) => void;
  updateIntake: (id: string, intake: IntakeSurvey, opts?: { fromForm?: boolean }) => void;
  markIntakeSent: (id: string) => void;
  pushRecent: (id: string) => void;
}

const Ctx = React.createContext<CustomerStore | null>(null);

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function CustomerStoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [currentUser, setCurrentUserState] = React.useState("Mia Gray");
  const [recentIds, setRecentIds] = React.useState<string[]>([]);

  // Initial load (+ one-time seed for a non-empty first run).
  React.useEffect(() => {
    let active = true;
    (async () => {
      let all = await repo.list();
      const seeded = localStorage.getItem(SEED_FLAG_KEY);
      if (all.length === 0 && !seeded) {
        const samples = seedCustomers();
        for (const c of samples) await repo.save(c);
        localStorage.setItem(SEED_FLAG_KEY, "1");
        all = samples;
      }
      if (!active) return;
      setCustomers(all);
      setCurrentUserState(localStorage.getItem(CURRENT_USER_KEY) || "Mia Gray");
      setRecentIds(readStringArray(RECENT_KEY));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Cross-tab sync.
  React.useEffect(() => {
    async function onStorage(e: StorageEvent) {
      if (e.key === CUSTOMERS_STORAGE_KEY) setCustomers(await repo.list());
      if (e.key === RECENT_KEY) setRecentIds(readStringArray(RECENT_KEY));
      if (e.key === CURRENT_USER_KEY) setCurrentUserState(localStorage.getItem(CURRENT_USER_KEY) || "Mia Gray");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = React.useCallback((next: Customer) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === next.id);
      const arr = idx >= 0 ? prev.map((c) => (c.id === next.id ? next : c)) : [...prev, next];
      return arr;
    });
    void repo.save(next);
  }, []);

  const mutate = React.useCallback(
    (id: string, fn: (c: Customer) => Customer) => {
      setCustomers((prev) => {
        const target = prev.find((c) => c.id === id);
        if (!target) return prev;
        const next = fn(target);
        void repo.save(next);
        return prev.map((c) => (c.id === id ? next : c));
      });
    },
    [],
  );

  const value = React.useMemo<CustomerStore>(() => {
    return {
      loading,
      customers,
      currentUser,
      recentIds,
      setCurrentUser: (name) => {
        setCurrentUserState(name);
        localStorage.setItem(CURRENT_USER_KEY, name);
      },
      getCustomer: (id) => customers.find((c) => c.id === id),
      create: (input) => {
        const c = svcCreate(input);
        persist(c);
        return c;
      },
      duplicate: (id) => {
        const source = customers.find((c) => c.id === id);
        if (!source) return undefined;
        const copy = duplicateCustomer(source, currentUser);
        persist(copy);
        return copy;
      },
      remove: (id) => {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        void repo.remove(id);
      },
      setArchived: (id, archived) =>
        mutate(id, (c) => ({ ...c, archived, updatedAt: new Date().toISOString() })),
      setStatus: (id, status) => mutate(id, (c) => applyStatus(c, status, currentUser)),
      toggleStep: (id, step, done, allStepIds) =>
        mutate(id, (c) => {
          let next = setChecklistItem(c, step.id, step.title, { done }, currentUser);
          if (computeProgress(next, allStepIds).percent === 100) {
            next = markChecklistFinished(next, currentUser);
          }
          return next;
        }),
      setStepNote: (id, stepId, note) =>
        mutate(id, (c) => setChecklistItem(c, stepId, "", { note }, currentUser)),
      addNote: (id, body, category) => mutate(id, (c) => svcAddNote(c, body, category, currentUser)),
      removeNote: (id, noteId) => mutate(id, (c) => svcRemoveNote(c, noteId)),
      updateIntake: (id, intake, opts) =>
        mutate(id, (c) => svcUpdateIntake(c, intake, currentUser, opts)),
      markIntakeSent: (id) => mutate(id, (c) => markIntakeSent(c, currentUser)),
      pushRecent: (id) =>
        setRecentIds((prev) => {
          const next = [id, ...prev.filter((x) => x !== id)].slice(0, 6);
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
          return next;
        }),
    };
  }, [loading, customers, currentUser, recentIds, mutate, persist]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCustomers(): CustomerStore {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCustomers must be used within <CustomerStoreProvider>");
  return ctx;
}
