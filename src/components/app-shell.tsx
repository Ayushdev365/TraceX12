import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Database, FolderOpen, ScanSearch } from "lucide-react";
import { Atmosphere } from "@/components/atmosphere";
import { Mark } from "@/components/mark";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Investigate", icon: ScanSearch },
  { to: "/cases", label: "Cases", icon: FolderOpen },
  { to: "/dataset", label: "Dataset", icon: Database },
  { to: "/method", label: "Method", icon: BookOpen },
] as const;

export function AppShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="relative min-h-dvh overflow-x-clip text-fg">
      <Atmosphere />
      <header className="no-print pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="glass-nav pointer-events-auto mx-auto flex max-w-6xl min-w-0 items-center gap-2 overflow-hidden rounded-full p-1.5 pl-2.5 pr-2 sm:gap-3 sm:pl-3">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-2 pl-0.5">
            <Mark className="size-8" />
            <span className="text-sm font-semibold tracking-tight">VASPTrace</span>
          </Link>
          <nav aria-label="Primary" className="ml-1 hidden items-center gap-0.5 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-link"
                activeProps={{ className: "nav-link nav-link-active" }}
                activeOptions={item.to === "/" ? { exact: true } : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
            <span className="chip hidden sm:inline-flex">SIH26182</span>
            <span className="chip chip-warn sm:hidden">Not proof</span>
            <span className="chip chip-warn hidden sm:inline-flex">Investigative lead, not proof</span>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "relative z-10 mx-auto w-full px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-12",
          wide ? "max-w-7xl" : "max-w-6xl",
        )}
      >
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="no-print glass-nav fixed inset-x-3 bottom-3 z-30 flex rounded-3xl p-1 sm:hidden"
        style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom))" }}
      >
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="dock-link"
            activeProps={{ className: "dock-link dock-link-active" }}
            activeOptions={item.to === "/" ? { exact: true } : undefined}
          >
            <item.icon className="size-5" strokeWidth={1.8} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
