import { Link } from "@tanstack/react-router";
import { Star, Clock } from "lucide-react";

import { Poster, POSTER_ASPECT } from "@/components/site/Poster";
import type { Movie } from "@/lib/cinebook";
import { formatDuration } from "@/lib/cinebook";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      to="/movies/$id"
      params={{ id: movie.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className={cn("relative overflow-hidden", POSTER_ASPECT.poster)}>
        <Poster
          src={movie.poster}
          alt={`${movie.title} poster`}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          {movie.imdb.toFixed(1)}
        </span>
        {movie.status === "coming-soon" && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            Coming Soon
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-foreground">{movie.title}</h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {movie.genres.join(" • ")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(movie.duration)}
          </span>
          <span className="rounded-md bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {movie.status === "now-showing" ? "Book Now" : "View Details"}
          </span>
        </div>
      </div>
    </Link>
  );
}
