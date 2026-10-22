import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Star } from "lucide-react";

import { Poster, POSTER_ASPECT } from "@/components/site/Poster";
import type { Movie, Showtime } from "@/lib/cinebook";
import {
  SEED_MOVIES,
  formatDate,
  formatDuration,
  formatPrice,
  formatTime,
  getSeedShowtimes,
  loadMovies,
  loadShowtimes,
} from "@/lib/cinebook";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/movies/$id")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.movie
          ? `${loaderData.movie.title} — CineBook`
          : "Movie — CineBook",
      },
      {
        name: "description",
        content: loaderData?.movie?.synopsis ?? "Movie details on CineBook.",
      },
      { property: "og:title", content: loaderData?.movie ? `${loaderData.movie.title} — CineBook` : "Movie — CineBook" },
      { property: "og:description", content: loaderData?.movie?.synopsis ?? "Movie details on CineBook." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    const movie = SEED_MOVIES.find((m) => m.id === params.id) ?? null;
    if (!movie) throw notFound();
    return { movie };
  },
  component: MovieDetails,
});

function MovieDetails() {
  const { id } = Route.useParams();
  const { movie: seedMovie } = Route.useLoaderData();

  const [movie, setMovie] = useState<Movie>(seedMovie);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [activeDate, setActiveDate] = useState<string>("");

  // Admin edits live in localStorage; prefer them over the seed row.
  useEffect(() => {
    setMovie(loadMovies().find((m) => m.id === id) ?? seedMovie);
    const st = loadShowtimes().filter((s) => s.movieId === id);
    setShowtimes(st);
    if (st.length > 0) setActiveDate(st[0].date);
  }, [id, seedMovie]);

  const dates = useMemo(
    () => [...new Set(showtimes.map((s) => s.date))].sort(),
    [showtimes],
  );
  const dayShowtimes = showtimes
    .filter((s) => s.date === activeDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div>
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-border",
              POSTER_ASPECT.poster,
            )}
          >
            <Poster
              src={movie.poster}
              alt={`${movie.title} poster`}
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span
              className={cn(
                "mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold",
                movie.status === "now-showing"
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {movie.status === "now-showing" ? "Now Showing" : "Coming Soon"}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {movie.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-primary">
              <Star className="h-4 w-4 fill-primary" /> {movie.imdb.toFixed(1)}/10
            </span>
            <span className="rounded border border-border px-2 py-0.5 text-xs font-semibold">
              {movie.cert}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {formatDuration(movie.duration)}
            </span>
            <span>{movie.genres.join(" • ")}</span>
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {movie.synopsis}
          </p>

          {movie.status === "now-showing" ? (
            <section className="mt-2">
              <h2 className="text-lg font-bold text-foreground">Select Showtime</h2>
              {dates.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No showtimes are scheduled for this movie yet. Please check back later.
                </p>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setActiveDate(d)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                          activeDate === d
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <Calendar className="h-4 w-4" />
                        {formatDate(d)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {dayShowtimes.map((s) => (
                      <Link
                        key={s.id}
                        to="/book/$showtimeId"
                        params={{ showtimeId: s.id }}
                        className="group rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/60"
                      >
                        <p className="text-lg font-bold text-foreground group-hover:text-primary">
                          {formatTime(s.time)}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> {s.location} · {s.screen}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Standard {formatPrice(s.price)} · Premium {formatPrice(s.premiumPrice)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </section>
          ) : (
            <p className="mt-2 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              🎬 This movie is coming soon to CineBook. Ticket bookings will open
              once showtimes are announced.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
