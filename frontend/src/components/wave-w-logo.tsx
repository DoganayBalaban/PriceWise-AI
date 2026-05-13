// Wave W — PriceWise AI brand mark
// W shape mimicking price chart waves; end-dot = "AI" accent + current price dot

interface WaveWProps {
  size?: number;
  variant?: "primary" | "gradient" | "solid" | "inverted" | "bare";
  className?: string;
}

export function WaveW({ size = 32, variant = "primary", className }: WaveWProps) {
  const r = Math.round(size * 0.22);

  if (variant === "gradient") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
          <linearGradient id="ww-grad" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx={r} fill="url(#ww-grad)" />
        <path
          d="M12 22 L20 44 L26 30 L32 42 L38 26 L44 44 L52 22"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="44" cy="44" r="4.2" fill="#FBBF24" />
      </svg>
    );
  }

  if (variant === "solid") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <rect width="64" height="64" rx={r} fill="#2563EB" />
        <path
          d="M12 22 L20 44 L26 30 L32 42 L38 26 L44 44 L52 22"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="44" cy="44" r="4.2" fill="#FBBF24" />
      </svg>
    );
  }

  if (variant === "inverted") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <rect width="64" height="64" rx={r} fill="#0F172A" />
        <path
          d="M12 22 L20 44 L26 30 L32 42 L38 26 L44 44 L52 22"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="44" cy="44" r="4.2" fill="#FBBF24" />
      </svg>
    );
  }

  if (variant === "bare") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <path
          d="M12 22 L20 44 L26 30 L32 42 L38 26 L44 44 L52 22"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="44" cy="44" r="4.2" fill="#7C3AED" />
      </svg>
    );
  }

  // primary — white bg, blue stroke, purple dot
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect width="64" height="64" rx={r} fill="white" />
      <path
        d="M12 22 L20 44 L26 30 L32 42 L38 26 L44 44 L52 22"
        stroke="#2563EB"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="44" cy="44" r="4.2" fill="#7C3AED" />
    </svg>
  );
}

interface LogoProps {
  variant?: WaveWProps["variant"];
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ variant = "gradient", size = 28, showWordmark = true, className }: LogoProps) {
  const textColor = variant === "inverted" ? "text-white" : "text-foreground";
  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <WaveW size={size} variant={variant} />
      {showWordmark && (
        <span
          className={`font-semibold tracking-tight ${textColor}`}
          style={{ fontSize: size * 0.57, letterSpacing: "-0.02em" }}
        >
          PriceWise{" "}
          <span style={{ color: "#2563EB" }}>AI</span>
        </span>
      )}
    </div>
  );
}
