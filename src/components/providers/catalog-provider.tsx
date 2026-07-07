"use client";

/**
 * Makes the (serializable) content catalog available to client components such
 * as the command palette and sidebar. The server loads it once in the root
 * layout and passes it here as a prop.
 */
import * as React from "react";

import type { Catalog } from "@/lib/types";

const CatalogContext = React.createContext<Catalog | null>(null);

export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: Catalog;
  children: React.ReactNode;
}) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  const ctx = React.useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within <CatalogProvider>");
  return ctx;
}
