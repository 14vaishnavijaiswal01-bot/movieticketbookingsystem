import { useMemo } from "react";

import type { Showtime } from "@/lib/cinebook";
import {
  AISLE_AFTER,
  SEAT_ROWS,
  SEATS_PER_ROW,
  formatPrice,
  isPremiumSeat,
  seatPrice,
} from "@/lib/cinebook";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  showtime: Showtime;
  booked: string[];
  selected: string[];
  onToggle: (seat: string) => void;
}

// Interactive cinema seating layout with screen indicator. Booked seats are
// rendered disabled so they cannot be selected.
export function SeatMap({ showtime, booked, selected, onToggle }: SeatMapProps) {
  const bookedSet = useMemo(() => new Set(booked), [booked]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Screen indicator */}
      <div className="w-full max-w-xl px-2">
        <div className="h-2 rounded-[100%] bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
        <p className="mt-1 text-center text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Screen this way
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-fit flex-col gap-1.5 px-3">
          {SEAT_ROWS.map((row) => (
            <div key={row} className="flex items-center gap-1.5">
              <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
                {row}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map((n) => {
                  const seat = `${row}${n}`;
                  const isBooked = bookedSet.has(seat);
                  const isSelected = selectedSet.has(seat);
                  return (
                    <button
                      key={seat}
                      type="button"
                      disabled={isBooked}
                      title={
                        isBooked
                          ? `${seat} — booked`
                          : `${seat} — ${formatPrice(seatPrice(seat, showtime))}`
                      }
                      aria-label={
                        isBooked
                          ? `${seat}, booked`
                          : `${seat}, ${isSelected ? "selected" : "available"}`
                      }
                      aria-pressed={isSelected}
                      onClick={() => onToggle(seat)}
                      className={cn(
                        "h-7 w-7 rounded-t-md border text-[10px] font-medium transition-all sm:h-8 sm:w-8 sm:text-xs",
                        isBooked
                          ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50"
                          : isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/40"
                            : "border-border bg-secondary/60 text-muted-foreground hover:border-primary hover:text-primary",
                        n === AISLE_AFTER && "mr-4",
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-t-sm border border-border bg-secondary/60" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-t-sm bg-primary" />
          Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-t-sm bg-muted" />
          Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-t-sm bg-primary/20" />
          Premium rows G–J · {formatPrice(showtime.premiumPrice)}
        </span>
      </div>
    </div>
  );
}

export function isPremiumSeatSeat(seat: string) {
  return isPremiumSeat(seat[0]);
}
