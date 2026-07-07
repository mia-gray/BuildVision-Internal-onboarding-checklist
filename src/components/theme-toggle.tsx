"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {/* Avoid hydration mismatch: render a neutral icon until mounted. */}
          {!mounted ? (
            <Sun className="size-4" />
          ) : (
            <>
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} aria-current={theme === "light"}>
          <Sun /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} aria-current={theme === "dark"}>
          <Moon /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} aria-current={theme === "system"}>
          <Monitor /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
