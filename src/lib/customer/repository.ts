/**
 * Data-access layer.
 *
 * The rest of the app depends only on the `CustomerRepository` interface, never
 * on where data actually lives. Today it's the browser's localStorage; to move
 * to Supabase / Firebase / Postgres, implement this interface against your API
 * and swap the instance exported at the bottom — no UI changes required.
 */
import type { Customer } from "./types";

export interface CustomerRepository {
  list(): Promise<Customer[]>;
  get(id: string): Promise<Customer | null>;
  /** Insert or update (upsert) by id. */
  save(customer: Customer): Promise<void>;
  remove(id: string): Promise<void>;
}

const STORAGE_KEY = "bv.customers.v1";

function readAll(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(customers: Customer[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

/** Browser localStorage implementation. Async to mirror a real backend. */
export class LocalStorageCustomerRepository implements CustomerRepository {
  async list(): Promise<Customer[]> {
    return readAll();
  }

  async get(id: string): Promise<Customer | null> {
    return readAll().find((c) => c.id === id) ?? null;
  }

  async save(customer: Customer): Promise<void> {
    const all = readAll();
    const idx = all.findIndex((c) => c.id === customer.id);
    if (idx >= 0) all[idx] = customer;
    else all.push(customer);
    writeAll(all);
  }

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((c) => c.id !== id));
  }
}

/**
 * The single repository instance the app uses. Replace this line with e.g.
 * `new SupabaseCustomerRepository(client)` to go multi-user/cross-device.
 */
export const customerRepository: CustomerRepository = new LocalStorageCustomerRepository();

export const CUSTOMERS_STORAGE_KEY = STORAGE_KEY;
