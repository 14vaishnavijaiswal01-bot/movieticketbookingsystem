import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Star, Ticket } from "lucide-react";

import { MovieCard } from "@/components/site/MovieCard";
import { Poster, POSTER_ASPECT } from "@/components/site/Poster";
import type { Movie } from "@/lib/cinebook";
import {
  SEED_MOVIES,
  allGenres,
  formatDuration,
  loadMovies,
} from "@/lib/cinebook";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => {
    const featured =
      SEED_MOVIES.find((m) => m.featured && m.status === "now-showing") ??
      SEED_MOVIES.find((m) => m.status === "now-showing");
    return {
      meta: [
        { title: "CineBook — Now Showing & Coming Soon Movies" },
        {
          name: "description",
          content:
            "Search movies by genre, browse what's now showing and coming soon, and book your seats at CineBook cinemas.",
        },
        { property: "og:title", content: "CineBook — Now Showing & Coming Soon Movies" },
        {
          property: "og:description",
          content:
            "Search movies by genre, browse what's now showing and coming soon, and book your seats at CineBook cinemas.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(featured
          ? [
              { property: "og:image", content: featured.backdrop },
              { name: "twitter:image", content: featured.backdrop },
            ]
          : []),
      ],
    };
  },
  component: Index,
});

type StatusFilter = "all" | "now-showing" | "coming-soon";

function Index() {
  const [movies, setMovies] = useState<Movie[]>(SEED_MOVIES);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    setMovies(loadMovies());
  }, []);

  const genres = useMemo(() => allGenres(movies), [movies]);

  const featured = movies.find((m) => m.featured && m.status === "now-showing")
    ?? movies.find((m) => m.status === "now-showing")
    ?? movies[0];

  const filtered = movies.filter((m) => {
    if (status !== "all" && m.status !== status) return false;
    if (genre !== "all" && !m.genres.includes(genre)) return false;
    if (query && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const nowShowing = filtered.filter((m) => m.status === "now-showing");
  const comingSoon = filtered.filter((m) => m.status === "coming-soon");

  return (

    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      {featured && (
        <section className="relative overflow-hidden rounded-3xl border border-border">
          <div className={cn("absolute inset-0", POSTER_ASPECT.wide, "h-full")}>
            <Poster
              src={featured.backdrop}
              alt={`${featured.title} backdrop`}
              className="h-full w-full opacity-40"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="relative flex max-w-xl flex-col gap-4 p-6 sm:p-10">
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Ticket className="h-3.5 w-3.5" /> Featured this week
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              {featured.title}
            </h1>
            <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-primary">
                <Star className="h-4 w-4 fill-primary" /> {featured.imdb.toFixed(1)}
              </span>
              <span>{featured.cert}</span>
              <span>{formatDuration(featured.duration)}</span>
              <span>{featured.genres.join(" • ")}</span>
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">
              {featured.synopsis}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/movies/$id"
                params={{ id: featured.id }}
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Book Tickets
              </Link>
              <a
                href="#now-showing"
                className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Browse Movies
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Search + filters */}
      <section className="mt-10 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies by title…"
              aria-label="Search movies"
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                { key: "all", label: "All" },
                { key: "now-showing", label: "Now Showing" },
                { key: "coming-soon", label: "Coming Soon" },
              ] as { key: StatusFilter; label: string }[]
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatus(t.key)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  status === t.key
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGenre("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              genre === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                genre === g
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section id="now-showing" className="mt-10 scroll-mt-20">
        <h2 className="text-xl font-bold text-foreground">Now Showing</h2>
        {nowShowing.length === 0 ? (
          <EmptyResults />
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {nowShowing.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">Coming Soon</h2>
        {comingSoon.length === 0 ? (
          <EmptyResults />
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {comingSoon.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyResults() {
  return (
    <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No movies match your search or filters. Try clearing them.
    </p>
  );
}
