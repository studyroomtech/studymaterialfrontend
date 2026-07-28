// Generic cover illustrations for material cards — StudyForGovt.
// ~36 visually distinct note/PDF covers; variant is picked with a seeded
// pseudo-random from the material id (stable across renders, no hydration flicker).

import { COVER_VARIANT_COUNT, LABELS } from "./MaterialCoverArt.constant";
import type { CoverProps } from "./MaterialCoverArt.types";

/**
 * Stable pseudo-random cover index in `[0, COVER_VARIANT_COUNT)`.
 * Seeded by material id so the same card always gets the same art.
 */
export function resolveCoverVariant(materialId: string): number {
  let hash = 2166136261;
  for (let i = 0; i < materialId.length; i += 1) {
    hash ^= materialId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Extra mix so nearby ids diverge more.
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 1274126177);
  hash ^= hash >>> 16;
  return Math.abs(hash) % COVER_VARIANT_COUNT;
}

export function coverVariantLabel(_variant: number): string {
  return "Study notes";
}

/** Decorative SVG cover art (aria-hidden; parent card carries the label). */
export function MaterialCoverArt({
  variant,
  className,
  uid = String(variant),
}: CoverProps) {
  const index =
    ((variant % COVER_VARIANT_COUNT) + COVER_VARIANT_COUNT) %
    COVER_VARIANT_COUNT;
  const bgId = `cover-bg-${uid}`;
  const gridId = `cover-grid-${uid}`;
  const label = LABELS[index % LABELS.length];

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
          <stop offset="0%" stopColor={bgStop(index, 0)} />
          <stop offset="100%" stopColor={bgStop(index, 1)} />
        </linearGradient>
        <pattern
          id={gridId}
          width={gridSize(index)}
          height={gridSize(index)}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize(index)} 0 L 0 0 0 ${gridSize(index)}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="320" height="180" fill={`url(#${bgId})`} />
      <rect width="320" height="180" fill={`url(#${gridId})`} />
      <AccentBar index={index} />
      <Composition index={index} />
      <FooterLabel text={label} />
    </svg>
  );
}

function bgStop(index: number, which: 0 | 1): string {
  const palettes: Array<[string, string]> = [
    ["#16233F", "#20335A"],
    ["#132038", "#1B2E52"],
    ["#182747", "#243A62"],
    ["#101C33", "#1E3256"],
    ["#1A2744", "#2A3F68"],
    ["#14233C", "#22365C"],
  ];
  const [a, b] = palettes[index % palettes.length];
  return which === 0 ? a : b;
}

function gridSize(index: number): number {
  return [12, 14, 16, 18, 20, 22][index % 6];
}

function AccentBar({ index }: { index: number }) {
  const style = index % 5;
  if (style === 0) {
    return <rect x="0" y="0" width="320" height="4" fill="#E8B948" />;
  }
  if (style === 1) {
    return <rect x="0" y="176" width="320" height="4" fill="#E8B948" />;
  }
  if (style === 2) {
    return <rect x="0" y="0" width="4" height="180" fill="#E8B948" />;
  }
  if (style === 3) {
    return (
      <>
        <rect x="0" y="0" width="320" height="3" fill="#E8B948" />
        <rect x="0" y="177" width="320" height="3" fill="#C99A2E" />
      </>
    );
  }
  return (
    <rect
      x="18"
      y="14"
      width="284"
      height="152"
      rx="4"
      fill="none"
      stroke="rgba(232,185,72,0.35)"
      strokeWidth="1.5"
    />
  );
}

function FooterLabel({ text }: { text: string }) {
  return (
    <text
      x="24"
      y="158"
      fill="#9FADCA"
      fontFamily="IBM Plex Mono, monospace"
      fontSize="11"
      letterSpacing="1.5"
    >
      {text}
    </text>
  );
}

function Composition({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <DocPortrait x={110} y={42} />;
    case 1:
      return <Binder x={98} y={40} />;
    case 2:
      return <Stack x={92} y={46} />;
    case 3:
      return <OpenBook />;
    case 4:
      return <DocLandscape />;
    case 5:
      return <TwinDocs />;
    case 6:
      return <DocWithBookmark />;
    case 7:
      return <Folder />;
    case 8:
      return <LinedPad />;
    case 9:
      return <Clipboard />;
    case 10:
      return <DocCornerFold />;
    case 11:
      return <TripleStack />;
    case 12:
      return <DocAndPen />;
    case 13:
      return <WideBinder />;
    case 14:
      return <DocGrid />;
    case 15:
      return <ScrollSheet />;
    case 16:
      return <DocStamp />;
    case 17:
      return <SideTabs />;
    case 18:
      return <Notebook />;
    case 19:
      return <DocCheck />;
    case 20:
      return <ArchiveBox />;
    case 21:
      return <DocRing />;
    case 22:
      return <SplitPages />;
    case 23:
      return <DocRibbon />;
    case 24:
      return <MiniLibrary />;
    case 25:
      return <DocQuote />;
    case 26:
      return <FileBadge />;
    case 27:
      return <DocLayers />;
    case 28:
      return <RuledCard />;
    case 29:
      return <DocArrow />;
    case 30:
      return <PocketFolder />;
    case 31:
      return <DocStar />;
    case 32:
      return <IndexCards />;
    case 33:
      return <DocSeal />;
    case 34:
      return <SpiralBound />;
    case 35:
      return <DocFrame />;
    default:
      return <DocPortrait x={110} y={42} />;
  }
}

// ---- Building blocks -----------------------------------------------------

function DocPortrait({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x={x} y={y} width="100" height="100" rx="4" fill="#20335A" />
      <path
        d={`M${x + 18} ${y + 26} H${x + 82} M${x + 18} ${y + 46} H${x + 82} M${x + 18} ${y + 66} H${x + 58}`}
        stroke="#C9D2E4"
      />
    </g>
  );
}

function Binder({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x={x} y={y} width="124" height="104" rx="5" fill="#20335A" />
      <path d={`M${x + 14} ${y} V${y + 104}`} stroke="#C9D2E4" strokeWidth="1.5" />
      <circle cx={x + 14} cy={y + 22} r="4" fill="#E8B948" stroke="none" />
      <circle cx={x + 14} cy={y + 52} r="4" fill="#E8B948" stroke="none" />
      <circle cx={x + 14} cy={y + 82} r="4" fill="#E8B948" stroke="none" />
      <path
        d={`M${x + 34} ${y + 30} H${x + 102} M${x + 34} ${y + 50} H${x + 102} M${x + 34} ${y + 70} H${x + 78}`}
        stroke="#C9D2E4"
      />
    </g>
  );
}

function Stack({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x={x} y={y + 32} width="136" height="54" rx="3" fill="#1a2a4a" stroke="#8B93A8" />
      <rect x={x + 8} y={y + 16} width="136" height="54" rx="3" fill="#1f3158" stroke="#C9D2E4" />
      <rect x={x + 16} y={y} width="136" height="54" rx="3" fill="#20335A" />
      <path
        d={`M${x + 36} ${y + 20} H${x + 128} M${x + 36} ${y + 36} H${x + 108}`}
        stroke="#C9D2E4"
      />
    </g>
  );
}

function OpenBook() {
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
    </g>
  );
}

function DocLandscape() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="78" y="58" width="164" height="72" rx="4" fill="#20335A" />
      <path d="M98 82 H200 M98 100 H176" stroke="#C9D2E4" />
      <circle cx="228" cy="72" r="6" fill="#E8B948" stroke="none" />
    </g>
  );
}

function TwinDocs() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="88" y="48" width="72" height="92" rx="3" fill="#1f3158" stroke="#C9D2E4" />
      <rect x="160" y="40" width="72" height="92" rx="3" fill="#20335A" />
      <path d="M176 64 H216 M176 82 H216 M176 100 H200" stroke="#C9D2E4" />
    </g>
  );
}

function DocWithBookmark() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="112" y="40" width="96" height="104" rx="4" fill="#20335A" />
      <path d="M130 66 H190 M130 86 H190 M130 106 H166" stroke="#C9D2E4" />
      <path d="M190 40 V72 L178 64 L166 72 V40" fill="#E8B948" stroke="none" />
    </g>
  );
}

function Folder() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path
        d="M78 70 H128 L140 58 H242 V130 H78 Z"
        fill="#20335A"
      />
      <path d="M96 92 H224 M96 110 H190" stroke="#C9D2E4" />
    </g>
  );
}

function LinedPad() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="104" y="40" width="112" height="108" rx="3" fill="#20335A" />
      <path
        d="M120 64 H200 M120 80 H200 M120 96 H200 M120 112 H176"
        stroke="#C9D2E4"
        strokeWidth="1.5"
      />
      <path d="M120 40 V148" stroke="#C99A2E" strokeWidth="1.5" />
    </g>
  );
}

function Clipboard() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="108" y="52" width="104" height="96" rx="4" fill="#20335A" />
      <rect x="132" y="40" width="56" height="22" rx="4" fill="#1f3158" />
      <path d="M128 84 H192 M128 102 H192 M128 120 H168" stroke="#C9D2E4" />
    </g>
  );
}

function DocCornerFold() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path
        d="M110 42 H190 L210 62 V142 H110 Z"
        fill="#20335A"
      />
      <path d="M190 42 V62 H210" stroke="#C9D2E4" />
      <path d="M128 84 H186 M128 104 H186 M128 124 H162" stroke="#C9D2E4" />
    </g>
  );
}

function TripleStack() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2">
      <rect x="100" y="88" width="120" height="40" rx="2" fill="#1a2a4a" stroke="#8B93A8" />
      <rect x="108" y="68" width="120" height="40" rx="2" fill="#1f3158" stroke="#C9D2E4" />
      <rect x="116" y="48" width="120" height="40" rx="2" fill="#20335A" />
      <path d="M136 64 H212" stroke="#C9D2E4" />
    </g>
  );
}

function DocAndPen() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="90" y="46" width="100" height="100" rx="4" fill="#20335A" />
      <path d="M108 72 H170 M108 92 H170 M108 112 H148" stroke="#C9D2E4" />
      <path d="M220 50 L236 66 L206 120 L186 112 Z" fill="#1f3158" />
      <path d="M186 112 L206 120 L200 128 Z" fill="#E8B948" stroke="none" />
    </g>
  );
}

function WideBinder() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="70" y="50" width="180" height="88" rx="5" fill="#20335A" />
      <path d="M92 50 V138" stroke="#C9D2E4" strokeWidth="1.5" />
      <circle cx="92" cy="72" r="5" fill="#E8B948" stroke="none" />
      <circle cx="92" cy="96" r="5" fill="#E8B948" stroke="none" />
      <circle cx="92" cy="120" r="5" fill="#E8B948" stroke="none" />
      <path d="M116 78 H230 M116 98 H210" stroke="#C9D2E4" />
    </g>
  );
}

function DocGrid() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2">
      <rect x="108" y="40" width="104" height="104" rx="4" fill="#20335A" />
      <path
        d="M108 75 H212 M108 110 H212 M143 40 V144 M178 40 V144"
        stroke="#C9D2E4"
        strokeWidth="1.25"
      />
    </g>
  );
}

function ScrollSheet() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path
        d="M100 56 Q100 44 118 44 H210 Q228 44 228 56 V120 Q228 132 210 132 H118 Q100 132 100 120 Z"
        fill="#20335A"
      />
      <path d="M118 72 H210 M118 90 H210 M118 108 H180" stroke="#C9D2E4" />
    </g>
  );
}

function DocStamp() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="96" y="44" width="100" height="100" rx="4" fill="#20335A" />
      <path d="M114 70 H176 M114 90 H176" stroke="#C9D2E4" />
      <circle
        cx="210"
        cy="100"
        r="28"
        stroke="#E8B948"
        strokeDasharray="4 3"
        transform="rotate(-12 210 100)"
      />
      <text
        x="210"
        y="104"
        textAnchor="middle"
        fill="#E8B948"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="10"
        fontWeight="600"
        transform="rotate(-12 210 100)"
      >
        NOTES
      </text>
    </g>
  );
}

function SideTabs() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="100" y="42" width="110" height="104" rx="3" fill="#20335A" />
      <rect x="210" y="54" width="18" height="22" rx="2" fill="#E8B948" stroke="none" />
      <rect x="210" y="84" width="18" height="22" rx="2" fill="#C99A2E" stroke="none" />
      <rect x="210" y="114" width="18" height="22" rx="2" fill="#8B93A8" stroke="none" />
      <path d="M118 70 H190 M118 90 H190 M118 110 H166" stroke="#C9D2E4" />
    </g>
  );
}

function Notebook() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="106" y="40" width="108" height="108" rx="4" fill="#20335A" />
      <path d="M130 40 V148" stroke="#C9D2E4" />
      <circle cx="118" cy="62" r="3.5" fill="#E8B948" stroke="none" />
      <circle cx="118" cy="86" r="3.5" fill="#E8B948" stroke="none" />
      <circle cx="118" cy="110" r="3.5" fill="#E8B948" stroke="none" />
      <circle cx="118" cy="134" r="3.5" fill="#E8B948" stroke="none" />
      <path d="M146 70 H196 M146 90 H196 M146 110 H180" stroke="#C9D2E4" />
    </g>
  );
}

function DocCheck() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="100" y="42" width="100" height="104" rx="4" fill="#20335A" />
      <path d="M118 70 H180 M118 92 H180 M118 114 H156" stroke="#C9D2E4" />
      <path
        d="M220 70 L236 88 L268 52"
        stroke="#E8B948"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </g>
  );
}

function ArchiveBox() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="90" y="70" width="140" height="70" rx="3" fill="#20335A" />
      <path d="M90 70 L110 48 H210 L230 70" fill="#1f3158" />
      <rect x="140" y="88" width="40" height="12" rx="2" fill="#E8B948" stroke="none" />
      <path d="M110 108 H210" stroke="#C9D2E4" />
    </g>
  );
}

function DocRing() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="118" y="48" width="100" height="96" rx="4" fill="#20335A" />
      <path d="M136 74 H198 M136 94 H198 M136 114 H174" stroke="#C9D2E4" />
      <circle cx="118" cy="70" r="8" stroke="#E8B948" />
      <circle cx="118" cy="100" r="8" stroke="#E8B948" />
      <circle cx="118" cy="130" r="8" stroke="#E8B948" />
    </g>
  );
}

function SplitPages() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="78" y="48" width="80" height="92" rx="3" fill="#1f3158" stroke="#C9D2E4" />
      <rect x="162" y="48" width="80" height="92" rx="3" fill="#20335A" />
      <path d="M158 48 V140" stroke="#E8B948" />
      <path d="M94 74 H140 M94 94 H140 M178 74 H224 M178 94 H210" stroke="#C9D2E4" />
    </g>
  );
}

function DocRibbon() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="108" y="40" width="104" height="108" rx="4" fill="#20335A" />
      <path d="M126 70 H194 M126 92 H194 M126 114 H170" stroke="#C9D2E4" />
      <path d="M160 40 V78 L148 70 L136 78 V40" fill="#E8B948" stroke="none" />
    </g>
  );
}

function MiniLibrary() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="86" y="56" width="28" height="80" rx="2" fill="#1f3158" stroke="#C9D2E4" />
      <rect x="122" y="48" width="32" height="88" rx="2" fill="#20335A" />
      <rect x="162" y="62" width="26" height="74" rx="2" fill="#1a2a4a" stroke="#8B93A8" />
      <rect x="196" y="52" width="34" height="84" rx="2" fill="#20335A" stroke="#C9D2E4" />
      <path d="M70 140 H250" stroke="#C9D2E4" />
    </g>
  );
}

function DocQuote() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="100" y="44" width="120" height="100" rx="4" fill="#20335A" />
      <text
        x="120"
        y="96"
        fill="#E8B948"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="42"
        fontWeight="600"
      >
        “
      </text>
      <path d="M150 88 H200 M150 108 H186" stroke="#C9D2E4" />
    </g>
  );
}

function FileBadge() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path d="M108 42 H188 L216 70 V146 H108 Z" fill="#20335A" />
      <path d="M188 42 V70 H216" stroke="#C9D2E4" />
      <rect x="124" y="88" width="64" height="24" rx="3" fill="#E8B948" stroke="none" />
      <text
        x="156"
        y="105"
        textAnchor="middle"
        fill="#16233F"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        fontWeight="700"
      >
        PDF
      </text>
    </g>
  );
}

function DocLayers() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2">
      <rect x="128" y="72" width="100" height="70" rx="3" fill="#1a2a4a" stroke="#8B93A8" />
      <rect x="114" y="56" width="100" height="70" rx="3" fill="#1f3158" stroke="#C9D2E4" />
      <rect x="100" y="40" width="100" height="70" rx="3" fill="#20335A" />
      <path d="M118 62 H180 M118 80 H164" stroke="#C9D2E4" />
    </g>
  );
}

function RuledCard() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="86" y="48" width="148" height="92" rx="4" fill="#20335A" />
      <path
        d="M104 72 H204 M104 90 H204 M104 108 H176"
        stroke="#C9D2E4"
        strokeWidth="1.5"
      />
      <circle cx="214" cy="64" r="10" fill="none" stroke="#E8B948" />
    </g>
  );
}

function DocArrow() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="88" y="44" width="96" height="100" rx="4" fill="#20335A" />
      <path d="M106 70 H164 M106 90 H164 M106 110 H144" stroke="#C9D2E4" />
      <path
        d="M210 70 H250 M236 54 L252 70 L236 86"
        stroke="#E8B948"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </g>
  );
}

function PocketFolder() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <path d="M84 64 H130 L142 52 H236 V128 H84 Z" fill="#1f3158" stroke="#C9D2E4" />
      <path d="M84 90 H236 V136 H84 Z" fill="#20335A" />
      <path d="M104 110 H216" stroke="#C9D2E4" />
    </g>
  );
}

function DocStar() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="96" y="44" width="100" height="100" rx="4" fill="#20335A" />
      <path d="M114 72 H176 M114 92 H176" stroke="#C9D2E4" />
      <path
        d="M230 70 L238 90 L260 92 L244 106 L248 128 L230 116 L212 128 L216 106 L200 92 L222 90 Z"
        fill="#E8B948"
        stroke="none"
      />
    </g>
  );
}

function IndexCards() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="78" y="78" width="120" height="54" rx="3" fill="#1a2a4a" stroke="#8B93A8" />
      <rect x="94" y="60" width="120" height="54" rx="3" fill="#1f3158" stroke="#C9D2E4" />
      <rect x="110" y="42" width="120" height="54" rx="3" fill="#20335A" />
      <path d="M128 62 H206 M128 78 H190" stroke="#C9D2E4" />
    </g>
  );
}

function DocSeal() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="92" y="42" width="110" height="104" rx="4" fill="#20335A" />
      <path d="M110 70 H182 M110 90 H182 M110 110 H158" stroke="#C9D2E4" />
      <circle cx="230" cy="100" r="22" fill="#1f3158" stroke="#E8B948" />
      <circle cx="230" cy="100" r="12" stroke="#C99A2E" />
    </g>
  );
}

function SpiralBound() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="118" y="42" width="110" height="104" rx="3" fill="#20335A" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M118 ${54 + i * 16} C108 ${54 + i * 16}, 108 ${66 + i * 16}, 118 ${66 + i * 16}`}
          stroke="#E8B948"
        />
      ))}
      <path d="M140 70 H208 M140 90 H208 M140 110 H184" stroke="#C9D2E4" />
    </g>
  );
}

function DocFrame() {
  return (
    <g fill="none" stroke="#E8B948" strokeWidth="2" strokeLinecap="round">
      <rect x="88" y="40" width="144" height="108" rx="4" fill="none" stroke="#C99A2E" />
      <rect x="104" y="54" width="112" height="80" rx="3" fill="#20335A" />
      <path d="M122 78 H198 M122 98 H176" stroke="#C9D2E4" />
    </g>
  );
}
