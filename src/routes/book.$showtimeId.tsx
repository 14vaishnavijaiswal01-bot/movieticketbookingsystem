import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, MapPin, ShieldCheck } from "lucide-react";

import { SeatMap } from "@/components/site/SeatMap";
import type { Booking, Showtime } from "@/lib/cinebook";
import {
  getSeedShowtimes,
  formatPrice,
  formatTime,
  formatDate,
  getBookedSeats,
  getMovieById,
  isValidEmail,
  loadBookings,
  loadMovies,
  loadShowtimes,
  makeBookingRef,
  saveBookings,
  seatPrice,
  seatsTotal,
} from "@/lib/cinebook";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book/$showtimeId")({
  head: () => ({
    meta: [
      { title: "Select Seats — CineBook" },
      {
        name: "description",
        content: "Pick your seats on the CineBook seating map and confirm your demo booking.",
      },
      { property: "og:title", content: "Select Seats — CineBook" },
      {
        property: "og:description",
        content: "Pick your seats on the CineBook seating map and confirm your demo booking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  const { showtimeId } = Route.useParams();
  const navigate = useNavigate();

  // undefined = still resolving (SSR can only see seeds), null = not found.
  const [showtime, setShowtime] = useState<Showtime | null | undefined>(undefined);
  const [movieTitle, setMovieTitle] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<"seats" | "details">("seats");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; seats?: string }>({});
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const storedShowtimes = loadShowtimes();
    const found = storedShowtimes.find((s) => s.id === showtimeId) ?? null;
    setShowtime(found);
    if (found) {
      const movie = getMovieById(found.movieId, loadMovies());
      setMovieTitle(movie?.title ?? "Selected movie");
    }
  }, [showtimeId]);

  const bookings = useMemo(() => loadBookings(), []);
  const booked = useMemo(
    () => (showtime ? getBookedSeats(showtime.id, bookings) : []),
    [showtime, bookings],
  );

  const total = showtime ? seatsTotal(selected, showtime) : 0;

  function toggleSeat(seat: string) {
    setSelected((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat],
    );
  }

  function goToDetails() {
    if (selected.length === 0) {
      setErrors({ seats: "Please select at least one seat to continue." });
      return;
    }
    setErrors({});
    setStep("details");
  }

  function validateDetails(): boolean {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Please enter your full name (at least 2 characters).";
    if (!isValidEmail(email)) next.email = "Please enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function confirmBooking() {
    if (!showtime || confirming) return;
    if (!validateDetails()) return;

    // Re-check availability so two tabs can't book the same seat.
    const taken = getBookedSeats(showtime.id, loadBookings());
    const clash = selected.filter((s) => taken.includes(s));
    if (clash.length > 0) {
      setErrors({
        seats: `Seats ${clash.join(", ")} were just booked by someone else. Please go back and choose different seats.`,
      });
      setStep("seats");
      return;
    }

    setConfirming(true);
    const booking: Booking = {
      ref: makeBookingRef(),
      showtimeId: showtime.id,
      movieId: showtime.movieId,
      seats: [...selected].sort(),
      total,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    try {
      saveBookings([...loadBookings(), booking]);
    } catch {
      setErrors({ seats: "Could not save your booking. Please try again." });
      setConfirming(false);
      return;
    }
    void navigate({
      to: "/confirmation/$ref",
      params: { ref: booking.ref },
    });
  }

  if (showtime === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted-foreground">
        Loading showtime…
      </div>
    );
  }

  if (showtime === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Showtime not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This showtime may have been removed from the schedule.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/movies/$id"
        params={{ id: showtime.movieId }}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to movie
      </Link>

      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{movieTitle}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {formatDate(showtime.date)} · {formatTime(showtime.time)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {showtime.location} · {showtime.screen}
          </span>
        </div>
      </div>

      {step === "seats" ? (
        <div className="flex flex-col gap-8">
          <SeatMap showtime={showtime} booked={booked} selected={selected} onToggle={toggleSeat} />

          {errors.seats && (
            <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errors.seats}
            </p>
          )}

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
            <div className="text-sm text-muted-foreground">
              {selected.length === 0 ? (
                "No seats selected"
              ) : (
                <span>
                  <span className="font-semibold text-foreground">
                    {selected.length} seat{selected.length > 1 ? "s" : ""}
                  </span>{" "}
                  · {selected.sort().join(", ")} ·{" "}
                  <span className="font-semibold text-primary">{formatPrice(total)}</span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={goToDetails}
              disabled={selected.length === 0}
              className={cn(
                "rounded-lg px-6 py-3 text-sm font-semibold transition-opacity",
                selected.length === 0
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90",
              )}
            >
              Enter Details
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 className="text-lg font-bold text-foreground">Your Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This is a clearly labelled simulated payment flow — no real payment
              details are collected.
            </p>

            <div className="mt-4 flex max-w-md flex-col gap-4">
              <Field label="Full name" error={errors.name}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </Field>
              <Field label="Email address" error={errors.email}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </Field>
              {errors.seats && (
                <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errors.seats}
                </p>
              )}
              <button
                type="button"
                onClick={() => setStep("seats")}
                className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                ← Change seats
              </button>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground">Order Summary</h3>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <Row label="Movie" value={movieTitle} />
              <Row label="Show" value={`${formatDate(showtime.date)}, ${formatTime(showtime.time)}`} />
              <Row label="Cinema" value={`${showtime.location} · ${showtime.screen}`} />
              <Row label="Seats" value={selected.sort().join(", ")} />
              <div className="my-2 border-t border-dashed border-border" />
              {selected.map((seat) => (
                <Row
                  key={seat}
                  label={seat}
                  value={formatPrice(seatPrice(seat, showtime))}
                  subtle
                />
              ))}
              <div className="my-2 border-t border-dashed border-border" />
              <Row
                label="Total"
                value={formatPrice(total)}
                className="text-base font-bold text-foreground"
              />
            </dl>
            <button
              type="button"
              onClick={confirmBooking}
              disabled={confirming}
              className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {confirming ? "Processing payment…" : `Pay ${formatPrice(total)} (Demo)`}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Simulated payment — nothing is charged
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Row({
  label,
  value,
  subtle,
  className,
}: {
  label: string;
  value: string;
  subtle?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between gap-4", className)}>
      <dt className={cn("shrink-0", subtle ? "text-xs text-muted-foreground" : "text-muted-foreground")}>
        {label}
      </dt>
      <dd className={cn("text-right", subtle ? "text-xs text-foreground" : "font-medium text-foreground")}>
        {value}
      </dd>
    </div>
  );
}
