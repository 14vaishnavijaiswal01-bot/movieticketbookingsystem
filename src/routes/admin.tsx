import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clapperboard, Info, Plus, RotateCcw, Trash2, Pencil } from "lucide-react";

import { ConfirmDialog, Modal } from "@/components/site/Dialogs";
import type { Booking, Movie, MovieStatus, Showtime } from "@/lib/cinebook";
import {
  CINEMAS,
  SEED_MOVIES,
  formatDate,
  formatPrice,
  formatTime,
  getSeedShowtimes,
  loadBookings,
  loadMovies,
  loadShowtimes,
  resetMovies,
  resetShowtimes,
  saveMovies,
  saveShowtimes,
} from "@/lib/cinebook";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CineBook" },
      {
        name: "description",
        content: "Manage movies, demo showtimes and view bookings on the CineBook admin dashboard.",
      },
      { property: "og:title", content: "Admin Dashboard — CineBook" },
      {
        property: "og:description",
        content: "Manage movies, demo showtimes and view bookings on the CineBook admin dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type Tab = "movies" | "showtimes" | "bookings";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("movies");
  const [movies, setMovies] = useState<Movie[]>(SEED_MOVIES);
  const [showtimes, setShowtimes] = useState<Showtime[]>(getSeedShowtimes);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notice, setNotice] = useState("");

  const [movieModal, setMovieModal] = useState<{ open: boolean; editing: Movie | null }>({
    open: false,
    editing: null,
  });
  const [showtimeModal, setShowtimeModal] = useState<{
    open: boolean;
    editing: Showtime | null;
  }>({ open: false, editing: null });

  const [confirm, setConfirm] = useState<
    | { kind: "movie"; movie: Movie }
    | { kind: "showtime"; showtime: Showtime }
    | { kind: "reset" }
    | null
  >(null);

  useEffect(() => {
    setMovies(loadMovies());
    setShowtimes(loadShowtimes());
    setBookings(loadBookings());
  }, []);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  function saveMovieList(list: Movie[]) {
    setMovies(list);
    saveMovies(list);
  }

  function saveShowtimeList(list: Showtime[]) {
    setShowtimes(list);
    saveShowtimes(list);
  }

  function deleteMovie(movie: Movie) {
    saveMovieList(movies.filter((m) => m.id !== movie.id));
    saveShowtimeList(showtimes.filter((s) => s.movieId !== movie.id));
    setConfirm(null);
    flash(`Deleted "${movie.title}" and its showtimes.`);
  }

  function deleteShowtime(showtime: Showtime) {
    saveShowtimeList(showtimes.filter((s) => s.id !== showtime.id));
    setConfirm(null);
    flash("Showtime removed from the schedule.");
  }

  function resetDemoData() {
    resetMovies();
    resetShowtimes();
    setMovies(loadMovies());
    setShowtimes(loadShowtimes());
    setBookings(loadBookings());
    setConfirm(null);
    flash("Demo data reset to the original sample catalogue.");
  }

  const tabButton = (key: Tab, label: string, count?: number) => (
    <button
      key={key}
      type="button"
      onClick={() => setTab(key)}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        tab === key
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn("ml-2 text-xs", tab === key ? "opacity-80" : "opacity-60")}>
          ({count})
        </span>
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the movie catalogue, demo showtimes and bookings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirm({ kind: "reset" })}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Reset Demo Data
        </button>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Demo only — seat locking and these admin controls are for demonstration
          purposes. They are not production security or multi-user booking protection,
          and all data is stored locally in this browser.
        </p>
      </div>

      {notice && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm text-primary"
        >
          {notice}
        </p>
      )}

      <div className="mt-6 flex gap-1 border-b border-border pb-px">
        {tabButton("movies", "Movies", movies.length)}
        {tabButton("showtimes", "Showtimes", showtimes.length)}
        {tabButton("bookings", "Bookings", bookings.length)}
      </div>

      {tab === "movies" && (
        <section className="mt-6">
          <button
            type="button"
            onClick={() => setMovieModal({ open: true, editing: null })}
            className="mb-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Movie
          </button>
          <ul className="flex flex-col gap-3">
            {movies.map((movie) => (
              <li
                key={movie.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-secondary">
                    <Clapperboard className="h-5 w-5 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{movie.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {movie.status === "now-showing" ? "Now Showing" : "Coming Soon"} ·{" "}
                      {movie.genres.join(", ")} · ⭐ {movie.imdb.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMovieModal({ open: true, editing: movie })}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm({ kind: "movie", movie })}
                    className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "showtimes" && (
        <section className="mt-6">
          <button
            type="button"
            onClick={() => setShowtimeModal({ open: true, editing: null })}
            className="mb-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Showtime
          </button>
          {movies.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Add a movie first to schedule showtimes.
            </p>
          ) : showtimes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No showtimes scheduled. Add one to open bookings.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {showtimes.map((s) => {
                const movie = movies.find((m) => m.id === s.movieId);
                return (
                  <li
                    key={s.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {movie?.title ?? "Unknown movie"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.date)} · {formatTime(s.time)} · {s.location} · {s.screen} ·
                        Standard {formatPrice(s.price)} / Premium {formatPrice(s.premiumPrice)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirm({ kind: "showtime", showtime: s })}
                      className="flex items-center gap-1.5 self-start rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 sm:self-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === "bookings" && (
        <section className="mt-6">
          {bookings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No bookings yet. Bookings made on the site will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Ref</th>
                    <th className="px-4 py-3">Movie</th>
                    <th className="px-4 py-3">Showtime</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const s = showtimes.find((st) => st.id === b.showtimeId);
                    return (
                      <tr key={b.ref} className="border-t border-border bg-card/50">
                        <td className="px-4 py-3 font-mono text-xs text-primary">{b.ref}</td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {movies.find((m) => m.id === b.movieId)?.title ?? "Movie"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {s ? `${formatDate(s.date)}, ${formatTime(s.time)}` : "Removed showtime"}
                        </td>
                        <td className="px-4 py-3 text-foreground">{b.seats.join(", ")}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {formatPrice(b.total)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {b.name}
                          <span className="block text-xs opacity-70">{b.email}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Viewing the site as a customer?{" "}
        <Link to="/" className="text-primary underline-offset-4 hover:underline">
          Go to movies
        </Link>
      </p>

      {/* Movie add/edit */}
      <MovieFormModal
        open={movieModal.open}
        editing={movieModal.editing}
        onClose={() => setMovieModal({ open: false, editing: null })}
        onSave={(movie) => {
          const list = movieModal.editing
            ? movies.map((m) => (m.id === movie.id ? movie : m))
            : [movie, ...movies];
          saveMovieList(list);
          setMovieModal({ open: false, editing: null });
          flash(movieModal.editing ? "Movie updated." : "Movie added to the catalogue.");
        }}
      />

      {/* Showtime add/edit */}
      <ShowtimeFormModal
        open={showtimeModal.open}
        movies={movies}
        existing={showtimes}
        editing={showtimeModal.editing}
        onClose={() => setShowtimeModal({ open: false, editing: null })}
        onSave={(showtime) => {
          const list = showtimeModal.editing
            ? showtimes.map((s) => (s.id === showtime.id ? showtime : s))
            : [...showtimes, showtime];
          saveShowtimeList(list);
          setShowtimeModal({ open: false, editing: null });
          flash(showtimeModal.editing ? "Showtime updated." : "Showtime added.");
        }}
      />

      {/* Confirmation dialogs */}
      <ConfirmDialog
        open={confirm?.kind === "movie"}
        title="Delete movie?"
        message={
          confirm?.kind === "movie"
            ? `"${confirm.movie.title}" and all of its showtimes will be removed from the catalogue. Existing bookings are kept.`
            : ""
        }
        confirmLabel="Delete Movie"
        onConfirm={() => confirm?.kind === "movie" && deleteMovie(confirm.movie)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === "showtime"}
        title="Delete showtime?"
        message={
          confirm?.kind === "showtime"
            ? `${formatDate(confirm.showtime.date)} at ${formatTime(confirm.showtime.time)} — ${confirm.showtime.location} will be removed. Existing bookings for it are kept.`
            : ""
        }
        confirmLabel="Delete Showtime"
        onConfirm={() => confirm?.kind === "showtime" && deleteShowtime(confirm.showtime)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === "reset"}
        title="Reset demo data?"
        message="Movies and showtimes will be restored to the original sample catalogue. Your bookings are not deleted."
        confirmLabel="Reset Data"
        onConfirm={resetDemoData}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

// ---------- Movie form ----------

function MovieFormModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: Movie | null;
  onClose: () => void;
  onSave: (movie: Movie) => void;
}) {
  const [form, setForm] = useState(() => emptyMovieForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-seed the form whenever the modal opens (add or edit).
  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              title: editing.title,
              genres: editing.genres.join(", "),
              duration: String(editing.duration),
              cert: editing.cert,
              imdb: String(editing.imdb),
              synopsis: editing.synopsis,
              poster: editing.poster,
              status: editing.status,
              featured: Boolean(editing.featured),
            }
          : emptyMovieForm(),
      );
      setErrors({});
    }
  }, [open, editing]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.title.trim().length < 2) next.title = "Title is required.";
    const duration = Number(form.duration);
    if (!Number.isFinite(duration) || duration < 30 || duration > 300)
      next.duration = "Duration must be between 30 and 300 minutes.";
    const imdb = Number(form.imdb);
    if (!Number.isFinite(imdb) || imdb < 0 || imdb > 10) next.imdb = "IMDb rating must be 0–10.";
    const genres = form.genres.split(",").map((g) => g.trim()).filter(Boolean);
    if (genres.length === 0) next.genres = "Add at least one genre (comma separated).";
    if (form.synopsis.trim().length < 20) next.synopsis = "Synopsis should be at least 20 characters.";
    if (!form.cert.trim()) next.cert = "Certification is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const id = editing?.id ?? `m-${Date.now().toString(36)}`;
    onSave({
      id,
      title: form.title.trim(),
      genres,
      duration,
      cert: form.cert.trim(),
      imdb,
      synopsis: form.synopsis.trim(),
      poster: form.poster.trim(),
      backdrop: form.poster.trim(),
      status: form.status,
      featured: form.featured,
    });
  }

  return (
    <Modal open={open} title={editing ? "Edit Movie" : "Add Movie"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Title" error={errors.title} value={form.title}
          onChange={(v) => setForm({ ...form, title: v })} placeholder="Movie title" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Genres (comma separated)" error={errors.genres} value={form.genres}
            onChange={(v) => setForm({ ...form, genres: v })} placeholder="Action, Drama" />
          <Input label="Certification" error={errors.cert} value={form.cert}
            onChange={(v) => setForm({ ...form, cert: v })} placeholder="PG-13" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Duration (minutes)" error={errors.duration} value={form.duration}
            onChange={(v) => setForm({ ...form, duration: v })} placeholder="140" />
          <Input label="IMDb rating (0–10)" error={errors.imdb} value={form.imdb}
            onChange={(v) => setForm({ ...form, imdb: v })} placeholder="8.0" />
        </div>
        <Textarea label="Synopsis" error={errors.synopsis} value={form.synopsis}
          onChange={(v) => setForm({ ...form, synopsis: v })} />
        <Input label="Poster image URL (optional)" error={undefined} value={form.poster}
          onChange={(v) => setForm({ ...form, poster: v })}
          placeholder="https://example.com/poster.jpg" />
        <div className="grid grid-cols-2 items-end gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as MovieStatus })}
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="now-showing">Now Showing</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Feature on home page
          </label>
        </div>
        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Cancel
          </button>
          <button type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {editing ? "Save Changes" : "Add Movie"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function emptyMovieForm() {
  return {
    title: "",
    genres: "",
    duration: "",
    cert: "",
    imdb: "",
    synopsis: "",
    poster: "",
    status: "now-showing" as MovieStatus,
    featured: false,
  };
}

// ---------- Showtime form ----------

function ShowtimeFormModal({
  open,
  movies,
  existing,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  movies: Movie[];
  existing: Showtime[];
  editing: Showtime | null;
  onClose: () => void;
  onSave: (showtime: Showtime) => void;
}) {
  const [form, setForm] = useState(() => emptyShowtimeForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              movieId: editing.movieId,
              date: editing.date,
              time: editing.time,
              location: editing.location,
              screen: editing.screen,
              price: String(editing.price),
              premiumPrice: String(editing.premiumPrice),
            }
          : emptyShowtimeForm(),
      );
      setErrors({});
    }
  }, [open, editing]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.movieId) next.movieId = "Select a movie.";
    if (!form.date) next.date = "Pick a date.";
    if (!form.time) next.time = "Pick a time.";
    if (!form.screen.trim()) next.screen = "Screen name is required.";
    const price = Number(form.price);
    const premiumPrice = Number(form.premiumPrice);
    if (!Number.isFinite(price) || price <= 0) next.price = "Standard price must be greater than 0.";
    if (!Number.isFinite(premiumPrice) || premiumPrice <= price)
      next.premiumPrice = "Premium price must be greater than the standard price.";

    const duplicate = existing.some(
      (s) =>
        s.id !== editing?.id &&
        s.movieId === form.movieId &&
        s.date === form.date &&
        s.time === form.time,
    );
    if (duplicate) next.time = "This movie already has a showtime at that date and time.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      id: editing?.id ?? `${form.movieId}__${form.date}__${form.time}`,
      movieId: form.movieId,
      date: form.date,
      time: form.time,
      location: form.location,
      screen: form.screen.trim(),
      price,
      premiumPrice,
    });
  }

  return (
    <Modal open={open} title={editing ? "Edit Showtime" : "Add Showtime"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Movie</span>
          <select
            value={form.movieId}
            onChange={(e) => setForm({ ...form, movieId: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">Select a movie…</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          {errors.movieId && <span className="text-xs text-destructive">{errors.movieId}</span>}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" error={errors.date} type="date" value={form.date}
            onChange={(v) => setForm({ ...form, date: v })} />
          <Input label="Time" error={errors.time} type="time" value={form.time}
            onChange={(v) => setForm({ ...form, time: v })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Cinema</span>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {CINEMAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <Input label="Screen" error={errors.screen} value={form.screen}
            onChange={(v) => setForm({ ...form, screen: v })} placeholder="Screen 1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Standard price (₹)" error={errors.price} value={form.price}
            onChange={(v) => setForm({ ...form, price: v })} placeholder="150" />
          <Input label="Premium price (₹)" error={errors.premiumPrice} value={form.premiumPrice}
            onChange={(v) => setForm({ ...form, premiumPrice: v })} placeholder="240" />
        </div>
        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Cancel
          </button>
          <button type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {editing ? "Save Changes" : "Add Showtime"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function emptyShowtimeForm() {
  return {
    movieId: "",
    date: "",
    time: "18:00",
    location: CINEMAS[0],
    screen: "Screen 1",
    price: "150",
    premiumPrice: "240",
  };
}

// ---------- Shared form fields ----------

function Input({
  label,
  error,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
          error ? "border-destructive" : "border-input focus:border-primary",
        )}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Textarea({
  label,
  error,
  value,
  onChange,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "resize-none rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
          error ? "border-destructive" : "border-input focus:border-primary",
        )}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
