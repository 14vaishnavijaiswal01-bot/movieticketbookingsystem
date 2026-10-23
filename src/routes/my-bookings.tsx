import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Download, MapPin, Search, Ticket } from "lucide-react";

import type { Booking } from "@/lib/cinebook";
import {
  formatDate,
  formatPrice,
  formatTime,
  getMovieById,
  getShowtimeById,
  isValidEmail,
  loadBookings,
  loadMovies,
  loadShowtimes,
} from "@/lib/cinebook";
import { downloadTicketPdf } from "@/lib/ticket-pdf";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — CineBook" },
      {
        name: "description",
        content: "Retrieve your CineBook demo bookings by email address and view your tickets.",
      },
      { property: "og:title", content: "My Bookings — CineBook" },
      {
        property: "og:description",
        content: "Retrieve your CineBook demo bookings by email address and view your tickets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyBookings,
});

function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showtimes, setShowtimes] = useState<ReturnType<typeof loadShowtimes>>([]);
  const [movies, setMovies] = useState<ReturnType<typeof loadMovies>>([]);
  const [email, setEmail] = useState("");
  const [lookupEmail, setLookupEmail] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setBookings(loadBookings());
    setShowtimes(loadShowtimes());
    setMovies(loadMovies());
  }, []);

  const visible = useMemo(() => {
    const base = lookupEmail
      ? bookings.filter((b) => b.email === lookupEmail)
      : bookings;
    return [...base].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bookings, lookupEmail]);

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLookupEmail(trimmed);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Bookings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bookings made in this browser are shown below. You can also retrieve your
        demo bookings by entering the email you booked with.
      </p>

      <form onSubmit={handleLookup} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email used for booking, e.g. you@example.com"
            aria-label="Email used for booking"
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Find Bookings
        </button>
        {lookupEmail && (
          <button
            type="button"
            onClick={() => {
              setLookupEmail(null);
              setEmail("");
            }}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            Clear
          </button>
        )}
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <Ticket className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">
            {lookupEmail ? "No bookings found for this email." : "No bookings yet."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lookupEmail
              ? "Double-check the email address, or book a new ticket."
              : "Book your first movie ticket in minutes."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {visible.map((booking) => {
            const showtime = getShowtimeById(booking.showtimeId, showtimes);
            const title = getMovieById(booking.movieId, movies)?.title ?? "Movie";
            return (
              <li
                key={booking.ref}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {showtime
                          ? `${formatDate(showtime.date)} · ${formatTime(showtime.time)}`
                          : "Showtime removed"}
                      </span>
                    </div>
                    <p className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {showtime ? `${showtime.location} · ${showtime.screen}` : "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Seats {booking.seats.join(", ")}
                      </span>
                    </p>
                    <p className="font-mono text-xs text-primary">{booking.ref}</p>
                  </div>
                  <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
                    <span className="font-bold text-foreground">{formatPrice(booking.total)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void downloadTicketPdf(
                            booking,
                            getMovieById(booking.movieId, movies),
                            showtime,
                          );
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                        aria-label={`Download PDF ticket for ${booking.ref}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>
                      <Link
                        to="/confirmation/$ref"
                        params={{ ref: booking.ref }}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                      >
                        View Ticket
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
