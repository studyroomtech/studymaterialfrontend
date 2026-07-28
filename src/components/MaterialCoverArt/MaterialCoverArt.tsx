// Generic cover illustrations for material cards — StudyForGovt.
// Catalog materials have no uploaded thumbnails; these SVG covers give each
// card a clear “notes / PDF” visual without subject-specific artwork.

export type CoverVariant = "notes" | "binder" | "stack" | "open";

/**
 * Pick a stable generic cover variant from the material id so cards stay
 * visually varied without implying a specific subject.
 */
export function resolveCoverVariant(materialId: string): CoverVariant {
  const cycle: CoverVariant[] = ["notes", "binder", "stack", "open"];
  let hash = 0;
  for (let i = 0; i < materialId.length; i += 1) {
    hash = (hash + materialId.charCodeAt(i) * (i + 1)) % cycle.length;
  }
  return cycle[hash];
}

export function coverVariantLabel(_variant: CoverVariant): string {
  return "Study notes";
}

type CoverProps = {
  variant: CoverVariant;
  className?: string;
  /** Unique suffix so multiple covers on one page do not clash on gradient ids. */
  uid?: string;
};

/** Decorative SVG cover art (aria-hidden; parent card carries the label). */
export function MaterialCoverArt({
  variant,
  className,
  uid = variant,
}: CoverProps) {
  const bgId = `cover-bg-${uid}`;
  const gridId = `cover-grid-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 320 180"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16233F" />
          <stop offset="100%" stopColor="#20335A" />
        </linearGradient>
        <pattern
          id={gridId}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 16 0 L 0 0 0 16"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="320" height="180" fill={`url(#${bgId})`} />
      <rect width="320" height="180" fill={`url(#${gridId})`} />
      <rect x="0" y="0" width="320" height="4" fill="#E8B948" />

      {variant === "notes" && <NotesArt />}
      {variant === "binder" && <BinderArt />}
      {variant === "stack" && <StackArt />}
      {variant === "open" && <OpenBookArt />}
    </svg>
  );
}

function NotesArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="110" y="42" width="100" height="100" rx="4" fill="#20335A" />
      <path d="M128 68 H192 M128 88 H192 M128 108 H168" stroke="#C9D2E4" />
      <path d="M210 52 L236 78 L210 104" stroke="#E8B948" strokeWidth="2.5" />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        NOTES · PDF
      </text>
    </g>
  );
}

function BinderArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="98" y="40" width="124" height="104" rx="5" fill="#20335A" />
      <path d="M112 40 V144" stroke="#C9D2E4" strokeWidth="1.5" />
      <circle cx="112" cy="62" r="4" fill="#E8B948" stroke="none" />
      <circle cx="112" cy="92" r="4" fill="#E8B948" stroke="none" />
      <circle cx="112" cy="122" r="4" fill="#E8B948" stroke="none" />
      <path d="M132 70 H200 M132 90 H200 M132 110 H176" stroke="#C9D2E4" />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        STUDY MATERIAL
      </text>
    </g>
  );
}

function StackArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect
        x="92"
        y="78"
        width="136"
        height="54"
        rx="3"
        fill="#1a2a4a"
        stroke="#8B93A8"
      />
      <rect
        x="100"
        y="62"
        width="136"
        height="54"
        rx="3"
        fill="#1f3158"
        stroke="#C9D2E4"
      />
      <rect x="108" y="46" width="136" height="54" rx="3" fill="#20335A" />
      <path d="M128 66 H220 M128 82 H200" stroke="#C9D2E4" />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        NOTES · PDF
      </text>
    </g>
  );
}

function OpenBookArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path
        d="M160 52 C132 48 108 52 96 58 V126 C112 118 136 116 160 122 C184 116 208 118 224 126 V58 C212 52 188 48 160 52 Z"
        fill="#20335A"
      />
      <path d="M160 52 V122" stroke="#C9D2E4" />
      <path
        d="M118 78 H146 M118 94 H146 M174 78 H202 M174 94 H196"
        stroke="#C9D2E4"
        strokeWidth="1.5"
      />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        STUDY NOTES
      </text>
    </g>
  );
}
