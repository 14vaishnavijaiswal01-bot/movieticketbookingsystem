// CineBook data layer — seed catalogue + localStorage-backed demo persistence.

export type MovieStatus = "now-showing" | "coming-soon";

export interface Movie {
  id: string;
  title: string;
  genres: string[];
  duration: number; // minutes
  cert: string; // e.g. "PG-13"
  imdb: number;
  synopsis: string;
  poster: string;
  backdrop: string;
  status: MovieStatus;
  featured?: boolean;
}

export interface Showtime {
  id: string;
  movieId: string;
  date: string; // YYYY-MM-DD (local)
  time: string; // "18:00"
  location: string;
  screen: string;
  price: number; // standard seat price
  premiumPrice: number; // premium (back rows) seat price
}

export interface Booking {
  ref: string;
  showtimeId: string;
  movieId: string;
  seats: string[];
  total: number;
  name: string;
  email: string;
  createdAt: string;
}

export const CINEMAS = [
  "CineBook Downtown",
  "CineBook Westgate",
  "CineBook Riverside",
];

const POSTER = "https://image.tmdb.org/t/p/w500";
const BACKDROP = "https://image.tmdb.org/t/p/w1280";

export const SEED_MOVIES: Movie[] = [
  {
    id: "m-interstellar",
    title: "Interstellar",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    duration: 169,
    cert: "PG-13",
    imdb: 8.7,
    synopsis:
      "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in search of a new home for humanity. Cooper, a former pilot turned farmer, must leave his family behind to save mankind.",
    poster: `${POSTER}/gEU2QniE6E77NI6lMY6E4v7cUdO.jpg`,
    backdrop: `${BACKDROP}/gEU2QniE6E77NI6lMY6E4v7cUdO.jpg`,
    status: "now-showing",
    featured: true,
  },
  {
    id: "m-dark-knight",
    title: "The Dark Knight",
    genres: ["Action", "Crime", "Thriller"],
    duration: 152,
    cert: "PG-13",
    imdb: 9.0,
    synopsis:
      "Batman faces his greatest challenge yet in the form of the Joker, a psychopathic criminal mastermind who plunges Gotham City into anarchy and forces the Dark Knight to question everything he stands for.",
    poster: `${POSTER}/qJ2tW6WMUDux911r2mKduZ8t3No.jpg`,
    backdrop: `${BACKDROP}/qJ2tW6WMUDux911r2mKduZ8t3No.jpg`,
    status: "now-showing",
  },
  {
    id: "m-inception",
    title: "Inception",
    genres: ["Sci-Fi", "Thriller", "Action"],
    duration: 148,
    cert: "PG-13",
    imdb: 8.8,
    synopsis:
      "Dom Cobb is a skilled thief who steals secrets from within the subconscious during dreams. Offered a chance at redemption, he must pull off the impossible: planting an idea instead of stealing one.",
    poster: `${POSTER}/9gk7adHTeD2TKfh6zfh1zntGaAi.jpg`,
    backdrop: `${BACKDROP}/9gk7adHTeD2TKfh6zfh1zntGaAi.jpg`,
    status: "now-showing",
  },
  {
    id: "m-dune-two",
    title: "Dune: Part Two",
    genres: ["Sci-Fi", "Adventure"],
    duration: 166,
    cert: "PG-13",
    imdb: 8.5,
    synopsis:
      "Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Torn between love and destiny, he faces a choice that will decide the fate of Arrakis.",
    poster: `${POSTER}/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg`,
    backdrop: `${BACKDROP}/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg`,
    status: "now-showing",
  },
  {
    id: "m-spiderman-nwh",
    title: "Spider-Man: No Way Home",
    genres: ["Action", "Adventure", "Fantasy"],
    duration: 148,
    cert: "PG-13",
    imdb: 8.2,
    synopsis:
      "Peter Parker's identity is revealed to the world, turning his life upside down. Desperate to fix things, he asks Doctor Strange for help — and accidentally opens the door to villains from other universes.",
    poster: `${POSTER}/1g0dhYtq4irv1tFqX6Ebfsf0yQN.jpg`,
    backdrop: `${BACKDROP}/1g0dhYtq4irv1tFqX6Ebfsf0yQN.jpg`,
    status: "now-showing",
  },
  {
    id: "m-oppenheimer",
    title: "Oppenheimer",
    genres: ["Biography", "Drama", "History"],
    duration: 180,
    cert: "R",
    imdb: 8.3,
    synopsis:
      "The story of J. Robert Oppenheimer, the brilliant physicist whose Manhattan Project changed the course of World War II — and whose creation changed the course of history forever.",
    poster: `${POSTER}/8Gxv8gSFCU0XGDanEGh76rCQCGX.jpg`,
    backdrop: `${BACKDROP}/8Gxv8gSFCU0XGDanEGh76rCQCGX.jpg`,
    status: "coming-soon",
  },
  {
    id: "m-godfather",
    title: "The Godfather",
    genres: ["Crime", "Drama"],
    duration: 175,
    cert: "R",
    imdb: 9.2,
    synopsis:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son, Michael Corleone — a war hero drawn into a life he never wanted.",
    poster: `${POSTER}/3bhkrj58Vtu7enYsRolDm316qln.jpg`,
    backdrop: `${BACKDROP}/3bhkrj58Vtu7enYsRolDm316qln.jpg`,
    status: "coming-soon",
  },
  {
    id: "m-avatar-twow",
    title: "Avatar: The Way of Water",
    genres: ["Sci-Fi", "Adventure"],
    duration: 192,
    cert: "PG-13",
    imdb: 7.5,
    synopsis:
      "Jake Sully and Neytiri have formed a family, but when an ancient threat resurfaces, they must leave their home and explore the oceans of Pandora to protect their children.",
    poster: `${POSTER}/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg`,
    backdrop: `${BACKDROP}/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg`,
    status: "coming-soon",
  },
];

const TIMES = ["10:30", "13:45", "17:00", "20:15"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function localDateKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Built lazily (never at module scope) so the deployed worker does not run
// Date math during startup and dates stay current on every request.
let seedShowtimesCache: Showtime[] | null = null;

export function getSeedShowtimes(): Showtime[] {
  if (seedShowtimesCache) return seedShowtimesCache;
  const dates = [localDateKey(0), localDateKey(1), localDateKey(2)];
  const list: Showtime[] = [];
  for (const movie of SEED_MOVIES) {
    if (movie.status !== "now-showing") continue;
    for (const date of dates) {
      for (const time of TIMES) {
        if (hashString(`${movie.id}${date}${time}`) % 4 === 3) continue; // ~75% of slots exist
        const h = hashString(`${movie.id}${date}${time}loc`);
        list.push({
          id: `${movie.id}__${date}__${time}`,
          movieId: movie.id,
          date,
          time,
          location: CINEMAS[h % CINEMAS.length] ?? CINEMAS[0] ?? "CineBook Downtown",
          screen: `Screen ${1 + (h % 4)}`,
          price: 150,
          premiumPrice: 240,
        });
      }
    }
  }
  seedShowtimesCache = list;
  return list;
}

// ---------- localStorage helpers (call from effects / handlers only) ----------

const MOVIES_KEY = "cinebook.movies.v1";
const SHOWTIMES_KEY = "cinebook.showtimes.v1";
const BOOKINGS_KEY = "cinebook.bookings.v1";

export function loadMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(MOVIES_KEY);
    if (raw) return JSON.parse(raw) as Movie[];
  } catch {
    // corrupted data falls back to seeds
  }
  return SEED_MOVIES;
}

export function saveMovies(movies: Movie[]) {
  localStorage.setItem(MOVIES_KEY, JSON.stringify(movies));
}

export function resetMovies() {
  localStorage.removeItem(MOVIES_KEY);
}

export function loadShowtimes(): Showtime[] {
  try {
    const raw = localStorage.getItem(SHOWTIMES_KEY);
    if (raw) return JSON.parse(raw) as Showtime[];
  } catch {
    // corrupted data falls back to seeds
  }
  return getSeedShowtimes();
}

export function saveShowtimes(showtimes: Showtime[]) {
  localStorage.setItem(SHOWTIMES_KEY, JSON.stringify(showtimes));
}

export function resetShowtimes() {
  localStorage.removeItem(SHOWTIMES_KEY);
}

export function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (raw) return JSON.parse(raw) as Booking[];
  } catch {
    // corrupted data falls back to empty
  }
  return [];
}

export function saveBookings(bookings: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// ---------- lookups ----------

export function getMovieById(id: string, movies: Movie[]): Movie | undefined {
  return movies.find((m) => m.id === id);
}

export function getShowtimeById(id: string, showtimes: Showtime[]): Showtime | undefined {
  return showtimes.find((s) => s.id === id);
}

export function allGenres(movies: Movie[]): string[] {
  return [...new Set(movies.flatMap((m) => m.genres))].sort();
}

// ---------- seats ----------

export const SEAT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export const SEATS_PER_ROW = 14;
export const PREMIUM_ROWS = ["G", "H", "I", "J"];
export const AISLE_AFTER = 7; // visual gap after the 7th seat

export function isPremiumSeat(row: string): boolean {
  return PREMIUM_ROWS.includes(row);
}

export function seatPrice(seat: string, showtime: Showtime): number {
  return isPremiumSeat(seat.charAt(0)) ? showtime.premiumPrice : showtime.price;
}

export function seatsTotal(seats: string[], showtime: Showtime): number {
  return seats.reduce((sum, seat) => sum + seatPrice(seat, showtime), 0);
}

// Deterministic "already booked" seats for the demo — stable per showtime so
// the same seats appear sold every time. Demo only, not real locking.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoBookedSeats(showtimeId: string): string[] {
  const rng = mulberry32(hashString(showtimeId));
  const booked: string[] = [];
  for (const row of SEAT_ROWS) {
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      if (rng() < 0.28) booked.push(`${row}${n}`);
    }
  }
  return booked;
}

export function getBookedSeats(showtimeId: string, bookings: Booking[]): string[] {
  const fromBookings = bookings
    .filter((b) => b.showtimeId === showtimeId)
    .flatMap((b) => b.seats);
  return [...new Set([...demoBookedSeats(showtimeId), ...fromBookings])];
}

// ---------- formatting ----------

export function formatTime(time: string): string {
  const [hStr, m] = time.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}

export function formatDate(dateStr: string): string {
  // "T00:00:00" parses as local midnight everywhere → stable day-of-week.
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function makeBookingRef(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CB-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
