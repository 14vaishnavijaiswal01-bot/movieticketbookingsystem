import { useState } from "react";
import { Clapperboard } from "lucide-react";

import { cn } from "@/lib/utils";

interface PosterProps {
  src: string;
  alt: string;
  className?: string;
  aspect?: "poster" | "wide";
}

// Movie poster/backdrop with a graceful CSS fallback when the remote image
// fails to load (offline demos, blocked CDNs, admin-entered bad URLs).
export function Poster({ src, alt, className, aspect = "poster" }: PosterProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-accent via-secondary to-background text-muted-foreground",
          className,
        )}
      >
        <Clapperboard className="h-10 w-10 opacity-60" aria-label={alt} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export const POSTER_ASPECT = {
  poster: "aspect-[2/3]",
  wide: "aspect-video",
} as const;
