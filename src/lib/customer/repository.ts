/**
 * Data-access layer.
 *
 * The rest of the app depends only on the `CustomerRepository` interface, never
 * on where data actually lives. Today it's the browser's localStorage; to move
 * to Supabase / Firebase / Postgres, implement this interface against your API
 * and swap the instance exported at the bottom — no UI changes required.
 */
import type { Customer } from "./types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

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
 * Supabase implementation — shared, multi-user, cross-device. Each customer is
 * one row; the full Customer object is stored in the `data` jsonb column, with
 * id / portal_token / archived lifted out for indexing and security.
 * Direct table access is gated by row-level security to signed-in team members.
 */
export class SupabaseCustomerRepository implements CustomerRepository {
  private get db() {
    if (!supabase) throw new Error("Supabase client is not configured.");
    return supabase;
  }

  async list(): Promise<Customer[]> {
    const { data, error } = await this.db
      .from("customers")
      .select("data")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => r.data as Customer);
  }

  async get(id: string): Promise<Customer | null> {
    const { data, error } = await this.db
      .from("customers")
      .select("data")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data?.data as Customer) ?? null;
  }

  async save(customer: Customer): Promise<void> {
    const { error } = await this.db.from("customers").upsert({
      id: customer.id,
      portal_token: customer.portalToken,
      archived: customer.archived,
      data: customer,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.db.from("customers").delete().eq("id", id);
    if (error) throw error;
  }
}

/**
 * The single repository instance the app uses: Supabase when configured,
 * otherwise browser localStorage. The rest of the app is unaware which is live.
 */
export const customerRepository: CustomerRepository = isSupabaseConfigured
  ? new SupabaseCustomerRepository()
  : new LocalStorageCustomerRepository();

export const CUSTOMERS_STORAGE_KEY = STORAGE_KEY;
