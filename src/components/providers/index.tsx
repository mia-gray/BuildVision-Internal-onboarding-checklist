"use client";

import * as React from "react";

import type { Catalog } from "@/lib/types";
import { ThemeProvider } from "./theme-provider";
import { CatalogProvider } from "./catalog-provider";
import { ProgressProvider } from "./progress-provider";
import { CustomerStoreProvider } from "@/lib/customer/store";
import { TooltipProvider } from "../ui/tooltip";
import { CommandPaletteProvider } from "../command-palette";
import { KeyboardShortcuts } from "../keyboard-shortcuts";

/** Composes every client-side provider the app needs, in one place. */
export function Providers({
  catalog,
  children,
}: {
  catalog: Catalog;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CatalogProvider catalog={catalog}>
        <CustomerStoreProvider>
          <ProgressProvider>
            <TooltipProvider>
              <CommandPaletteProvider>
                {children}
                <KeyboardShortcuts />
              </CommandPaletteProvider>
            </TooltipProvider>
          </ProgressProvider>
        </CustomerStoreProvider>
      </CatalogProvider>
    </ThemeProvider>
  );
}
