import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "cards");

const SUITS = {
  spades: {
    color: "#172334",
    label: "Spades",
  },
  hearts: {
    color: "#b72e42",
    label: "Hearts",
  },
  clubs: {
    color: "#172334",
    label: "Clubs",
  },
  diamonds: {
    color: "#b72e42",
    label: "Diamonds",
  },
};

const RANKS = [
  [1, "a", "A"],
  [2, "2", "2"],
  [3, "3", "3"],
  [4, "4", "4"],
  [5, "5", "5"],
  [6, "6", "6"],
  [7, "7", "7"],
  [8, "8", "8"],
  [9, "9", "9"],
  [10, "10", "10"],
  [11, "j", "J"],
  [12, "q", "Q"],
  [13, "k", "K"],
];

const PIPS = {
  1: [[50, 70, 0]],

  2: [
    [50, 39, 0],
    [50, 101, 180],
  ],

  3: [
    [50, 35, 0],
    [50, 70, 0],
    [50, 105, 180],
  ],

  4: [
    [33, 39, 0],
    [67, 39, 0],
    [33, 101, 180],
    [67, 101, 180],
  ],

  5: [
    [33, 37, 0],
    [67, 37, 0],
    [50, 70, 0],
    [33, 103, 180],
    [67, 103, 180],
  ],

  6: [
    [33, 35, 0],
    [67, 35, 0],
    [33, 70, 0],
    [67, 70, 0],
    [33, 105, 180],
    [67, 105, 180],
  ],

  7: [
    [33, 33, 0],
    [67, 33, 0],
    [50, 52, 0],
    [33, 70, 0],
    [67, 70, 0],
    [33, 107, 180],
    [67, 107, 180],
  ],

  8: [
    [33, 32, 0],
    [67, 32, 0],
    [50, 51, 0],
    [33, 65, 0],
    [67, 65, 0],
    [50, 89, 180],
    [33, 108, 180],
    [67, 108, 180],
  ],

  9: [
    [33, 31, 0],
    [67, 31, 0],
    [33, 53, 0],
    [67, 53, 0],
    [50, 70, 0],
    [33, 87, 180],
    [67, 87, 180],
    [33, 109, 180],
    [67, 109, 180],
  ],

  10: [
    [33, 30, 0],
    [67, 30, 0],
    [50, 44, 0],
    [33, 56, 0],
    [67, 56, 0],
    [33, 84, 180],
    [67, 84, 180],
    [50, 96, 180],
    [33, 110, 180],
    [67, 110, 180],
  ],
};

function suitShape(suit, x, y, size, color, rotation = 0) {
  const scale = size / 20;

  if (suit === "diamonds") {
    return `
      <path
        d="M0 -10 L7 0 L0 10 L-7 0 Z"
        fill="${color}"
        transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})"
      />
    `;
  }

  if (suit === "hearts") {
    return `
      <path
        d="M0 9 C-10 3 -12 -3 -8 -7 C-4 -11 -1 -8 0 -5 C1 -8 4 -11 8 -7 C12 -3 10 3 0 9 Z"
        fill="${color}"
        transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})"
      />
    `;
  }

  if (suit === "spades") {
    return `
      <path
        d="M0 -10 C-2 -6 -10 -1 -10 5 C-10 10 -4 12 0 7 C-1 11 -3 14 -6 16 L6 16 C3 14 1 11 0 7 C4 12 10 10 10 5 C10 -1 2 -6 0 -10 Z"
        fill="${color}"
        transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})"
      />
    `;
  }

  return `
    <g
      fill="${color}"
      transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})"
    >
      <circle cx="0" cy="-5.5" r="5.5" />
      <circle cx="-5.5" cy="2" r="5.5" />
      <circle cx="5.5" cy="2" r="5.5" />

      <path
        d="M-2 5 C-2 9 -3 12 -6 15 H6 C3 12 2 9 2 5 Z"
      />
    </g>
  `;
}

function corner(label, suit, color, flipped = false) {
  const content = `
    <text
      x="11"
      y="18"
      text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif"
      font-size="${label === "10" ? 11 : 13}"
      font-weight="700"
      fill="${color}"
    >
      ${label}
    </text>

    ${suitShape(suit, 11, 28, 10, color)}
  `;

  if (flipped) {
    return `
      <g transform="translate(100 140) rotate(180)">
        ${content}
      </g>
    `;
  }

  return `<g>${content}</g>`;
}

function faceCardCenter(label, suit, color) {
  return `
    <rect
      x="28"
      y="36"
      width="44"
      height="68"
      rx="5"
      fill="#f5f0e5"
      stroke="${color}"
      stroke-opacity=".42"
    />

    ${suitShape(suit, 50, 47, 16, color)}

    <text
      x="50"
      y="80"
      text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif"
      font-size="28"
      font-weight="700"
      fill="${color}"
    >
      ${label}
    </text>

    ${suitShape(suit, 50, 94, 16, color, 180)}

    <path
      d="M34 70 H66"
      stroke="${color}"
      stroke-opacity=".22"
    />
  `;
}

function cardSvg(suit, suitInfo, rank, label) {
  const center =
    rank <= 10
      ? PIPS[rank]
          .map(([x, y, rotation]) =>
            suitShape(
              suit,
              x,
              y,
              rank === 1 ? 34 : 16,
              suitInfo.color,
              rotation,
            ),
          )
          .join("\n")
      : faceCardCenter(label, suit, suitInfo.color);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 100 140"
  width="100"
  height="140"
  role="img"
  aria-label="${label} of ${suitInfo.label}"
  shape-rendering="geometricPrecision"
>
  <rect
    x="1"
    y="1"
    width="98"
    height="138"
    rx="7"
    fill="#faf7ed"
    stroke="#e8e3d8"
    stroke-width="2"
  />

  <rect
    x="4"
    y="4"
    width="92"
    height="132"
    rx="5"
    fill="none"
    stroke="#172334"
    stroke-opacity=".06"
  />

  ${corner(label, suit, suitInfo.color)}

  ${corner(label, suit, suitInfo.color, true)}

  ${center}
</svg>`;
}

function backSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 100 140"
  width="100"
  height="140"
  role="img"
  aria-label="Playing card back"
  shape-rendering="geometricPrecision"
>
  <defs>
    <pattern
      id="p"
      width="12"
      height="12"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M6 1 L11 6 L6 11 L1 6 Z"
        fill="none"
        stroke="#d4ba7d"
        stroke-opacity=".34"
      />

      <circle
        cx="6"
        cy="6"
        r="1.25"
        fill="#d4ba7d"
        fill-opacity=".42"
      />
    </pattern>
  </defs>

  <rect
    x="1"
    y="1"
    width="98"
    height="138"
    rx="7"
    fill="#21365c"
    stroke="#60739a"
    stroke-width="2"
  />

  <rect
    x="5"
    y="5"
    width="90"
    height="130"
    rx="5"
    fill="#172a49"
    stroke="#d4ba7d"
    stroke-opacity=".62"
  />

  <rect
    x="9"
    y="9"
    width="82"
    height="122"
    rx="3"
    fill="url(#p)"
  />

  <rect
    x="14"
    y="14"
    width="72"
    height="112"
    rx="3"
    fill="none"
    stroke="#d4ba7d"
    stroke-opacity=".44"
  />
</svg>`;
}

await mkdir(ROOT, {
  recursive: true,
});

await writeFile(path.join(ROOT, "back.svg"), backSvg(), "utf8");

for (const [suit, suitInfo] of Object.entries(SUITS)) {
  const suitDir = path.join(ROOT, suit);

  await mkdir(suitDir, {
    recursive: true,
  });

  for (const [rank, file, label] of RANKS) {
    await writeFile(
      path.join(suitDir, `${file}.svg`),
      cardSvg(suit, suitInfo, rank, label),
      "utf8",
    );
  }
}

console.log("Generated 53 SVG card assets in public/cards.");
