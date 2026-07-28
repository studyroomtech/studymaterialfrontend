// Subject-themed cover illustrations for material cards — StudyForGovt.
// Catalog materials have no uploaded thumbnails; these SVG covers give each
// card a clear visual cue by subject / exam keyword.

export type CoverTheme =
  | "polity"
  | "quant"
  | "history"
  | "science"
  | "english"
  | "banking"
  | "railways"
  | "notes";

const THEME_KEYWORDS: Record<CoverTheme, string[]> = {
  polity: [
    "polity",
    "constitution",
    "civics",
    "governance",
    "laxmikanth",
    "political",
  ],
  quant: [
    "quant",
    "math",
    "arithmetic",
    "aptitude",
    "reasoning",
    "numerical",
    "algebra",
  ],
  history: [
    "history",
    "ancient",
    "medieval",
    "modern",
    "movement",
    "civilization",
  ],
  science: [
    "science",
    "physics",
    "chemistry",
    "biology",
    "environment",
    "geography",
  ],
  english: [
    "english",
    "grammar",
    "comprehension",
    "vocabulary",
    "language",
  ],
  banking: ["bank", "ibps", "sbi", "po", "clerk", "finance", "economy"],
  railways: ["railway", "rrb", "ntpc", "group d", "alp"],
  notes: [],
};

/**
 * Pick a cover theme from a material title and primary tag.
 * Falls back to a stable notes theme keyed by id so cards stay varied.
 */
export function resolveCoverTheme(
  title: string,
  tag: string,
  materialId: string,
): CoverTheme {
  const haystack = `${title} ${tag}`.toLowerCase();
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS) as Array<
    [CoverTheme, string[]]
  >) {
    if (theme === "notes") continue;
    if (keywords.some((kw) => haystack.includes(kw))) {
      return theme;
    }
  }
  const cycle: CoverTheme[] = [
    "notes",
    "polity",
    "quant",
    "history",
    "science",
    "english",
  ];
  let hash = 0;
  for (let i = 0; i < materialId.length; i += 1) {
    hash = (hash + materialId.charCodeAt(i) * (i + 1)) % cycle.length;
  }
  return cycle[hash];
}

const THEME_LABEL: Record<CoverTheme, string> = {
  polity: "Polity & Civics",
  quant: "Quant & Aptitude",
  history: "History",
  science: "Science & GS",
  english: "English",
  banking: "Banking",
  railways: "Railways",
  notes: "Study Notes",
};

export function coverThemeLabel(theme: CoverTheme): string {
  return THEME_LABEL[theme];
}

type CoverProps = {
  theme: CoverTheme;
  className?: string;
  /** Unique suffix so multiple covers on one page do not clash on gradient ids. */
  uid?: string;
};

/** Decorative SVG cover art (aria-hidden; parent card carries the label). */
export function MaterialCoverArt({ theme, className, uid = theme }: CoverProps) {
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

      {theme === "polity" && <PolityArt />}
      {theme === "quant" && <QuantArt />}
      {theme === "history" && <HistoryArt />}
      {theme === "science" && <ScienceArt />}
      {theme === "english" && <EnglishArt />}
      {theme === "banking" && <BankingArt />}
      {theme === "railways" && <RailwaysArt />}
      {theme === "notes" && <NotesArt />}
    </svg>
  );
}

function PolityArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path d="M160 48 L160 138" />
      <path d="M118 70 L202 70" />
      <circle cx="160" cy="58" r="10" fill="#E8B948" stroke="none" />
      <path d="M130 90 L160 78 L190 90" />
      <path d="M136 90 V120 H184 V90" stroke="#C9D2E4" />
      <path d="M112 138 H208" stroke="#C9D2E4" />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        CONSTITUTION
      </text>
    </g>
  );
}

function QuantArt() {
  return (
    <g>
      <text
        x="36"
        y="78"
        fill="#E8B948"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="42"
        fontWeight="600"
      >
        ∑
      </text>
      <text
        x="90"
        y="72"
        fill="#C9D2E4"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="18"
      >
        x² + y
      </text>
      <text
        x="90"
        y="100"
        fill="#E8B948"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="16"
      >
        = 42
      </text>
      <rect
        x="210"
        y="48"
        width="72"
        height="72"
        rx="4"
        fill="none"
        stroke="rgba(232,185,72,0.45)"
        strokeWidth="1.5"
      />
      <path
        d="M222 108 L246 72 L270 96"
        fill="none"
        stroke="#E8B948"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        APTITUDE
      </text>
    </g>
  );
}

function HistoryArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path d="M80 120 H240" stroke="#C9D2E4" />
      <path d="M100 120 V70 H140 V120" />
      <path d="M160 120 V55 H200 V120" />
      <path d="M110 70 H130 M170 55 H190" stroke="#C9D2E4" strokeWidth="1.5" />
      <circle cx="250" cy="58" r="18" stroke="#E8B948" />
      <path d="M250 48 V58 H258" stroke="#E8B948" />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        HISTORY
      </text>
    </g>
  );
}

function ScienceArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2">
      <ellipse cx="160" cy="88" rx="48" ry="18" transform="rotate(0 160 88)" />
      <ellipse
        cx="160"
        cy="88"
        rx="48"
        ry="18"
        transform="rotate(60 160 88)"
        stroke="#C9D2E4"
      />
      <ellipse
        cx="160"
        cy="88"
        rx="48"
        ry="18"
        transform="rotate(120 160 88)"
        stroke="#C9D2E4"
      />
      <circle cx="160" cy="88" r="8" fill="#E8B948" stroke="none" />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        SCIENCE
      </text>
    </g>
  );
}

function EnglishArt() {
  return (
    <g>
      <text
        x="40"
        y="95"
        fill="#E8B948"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="64"
        fontStyle="italic"
        fontWeight="500"
      >
        Aa
      </text>
      <text
        x="150"
        y="70"
        fill="#C9D2E4"
        fontFamily="IBM Plex Sans, sans-serif"
        fontSize="14"
      >
        Grammar · Vocab
      </text>
      <text
        x="150"
        y="96"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="12"
      >
        comprehension
      </text>
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        ENGLISH
      </text>
    </g>
  );
}

function BankingArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path d="M100 118 H220" stroke="#C9D2E4" />
      <path d="M110 118 V78 H210 V118" />
      <path d="M160 52 L210 78 H110 Z" />
      <path d="M130 90 V108 M160 90 V108 M190 90 V108" stroke="#C9D2E4" />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        BANKING
      </text>
    </g>
  );
}

function RailwaysArt() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="70" y="70" width="180" height="48" rx="6" />
      <circle cx="100" cy="130" r="12" stroke="#C9D2E4" />
      <circle cx="220" cy="130" r="12" stroke="#C9D2E4" />
      <path d="M70 100 H250" stroke="#C9D2E4" strokeWidth="1.5" />
      <path d="M130 78 V100 M170 78 V100" stroke="#C9D2E4" />
      <path d="M55 142 H265" stroke="#9FADCA" strokeWidth="1.5" />
      <text
        x="24"
        y="158"
        fill="#9FADCA"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        letterSpacing="1.5"
      >
        RAILWAYS
      </text>
    </g>
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
