import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Clapperboard, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Movies" },
  { to: "/my-bookings", label: "My Bookings" },
  { to: "/admin", label: "Admin" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clapperboard className="h-5 w-5" />
          </span>
          Cine<span className="text-primary">Book</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive(link.to)
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-accent md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-4 py-3 text-sm font-medium",
                isActive(link.to)
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-foreground">
          Cine<span className="text-primary">Book</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Demo project — bookings and payments are simulated and stored in your
          browser only.
        </p>
      </div>
    </footer>
  );
}
