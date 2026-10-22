import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CircleCheck, Clock, MapPin } from "lucide-react";

import type { Booking } from "@/lib/cinebook";
import {
  formatDate,
  formatPrice,
  formatTime,
  getMovieById,
  loadBookings,
  loadMovies,
} from "@/lib/cinebook";

export const Route = createFileRoute("/confirmation/$ref")({
  head: () => ({
    meta: [
      { title: "Booking Confirmed — CineBook" },
      {
        name: "description",
        content: "Your CineBook demo booking is confirmed. Show your ticket reference at the cinema.",
      },
      { property: "og:title", content: "Booking Confirmed — CineBook" },
      {
        property: "og:description",
        content: "Your CineBook demo booking is confirmed. Show your ticket reference at the cinema.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { ref } = Route.useParams();
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);

  useEffect(() => {
    const found = loadBookings().find((b) => b.ref === ref) ?? null;
    setBooking(found);
  }, [ref]);

  if (booking === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted-foreground">
        Loading booking…
      </div>
    );
  }

  if (booking === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Booking not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find a booking with reference {ref} in this browser.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/my-bookings"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent"
          >
            My Bookings
          </Link>
          <Link
            to="/"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Book a Movie
          </Link>
        </div>
      </div>
    );
  }

  const movieTitle = getMovieById(booking.movieId, loadMovies())?.title ?? "Movie";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <CircleCheck className="h-8 w-8 text-primary" />
        </span>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Booking Confirmed!
        </h1>
        <p className="text-sm text-muted-foreground">
          A confirmation was simulated for <span className="font-medium text-foreground">{booking.email}</span>.
          Your e-ticket is below — this demo does not send real emails.
        </p>
      </div>

      {/* Ticket */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
          <span className="text-sm font-bold uppercase tracking-widest">CineBook E-Ticket</span>
          <span className="rounded bg-primary-foreground/15 px-2.5 py-1 text-xs font-semibold">
            PAID (DEMO)
          </span>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-foreground">{movieTitle}</h2>
          <div className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate(booking.showtimeId.split("__")[1] ?? "")} ·{" "}
              {formatTime(booking.showtimeId.split("__")[2] ?? "")}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> CineBook Cinema
            </p>
          </div>

          <div className="my-5 border-t border-dashed border-border" />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Booking Ref</dt>
              <dd className="mt-1 font-mono text-sm font-bold text-primary">{booking.ref}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Seats</dt>
              <dd className="mt-1 font-semibold text-foreground">{booking.seats.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Amount Paid</dt>
              <dd className="mt-1 font-semibold text-foreground">{formatPrice(booking.total)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Name</dt>
              <dd className="mt-1 font-semibold text-foreground">{booking.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
              <dd className="mt-1 truncate font-semibold text-foreground">{booking.email}</dd>
            </div>
          </dl>

          {/* Fake barcode */}
          <div className="mt-6 flex h-10 items-end gap-1" aria-hidden="true">
            {Array.from({ length: 48 }, (_, i) => (
              <span
                key={i}
                className="bg-foreground/80"
                style={{ width: (i * 7) % 3 === 0 ? "3px" : "1.5px", height: `${70 + ((i * 13) % 30)}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/my-bookings"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          View My Bookings
        </Link>
        <Link
          to="/"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Book Another Movie
        </Link>
      </div>
    </div>
  );
}
