export const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const vertexEvents = [
  "Click",
  "MouseDown",
  "MouseUp",
  "MouseMove",
  "MouseEnter",
  "MouseLeave",
  "PointerDown",
  "PointerUp",
  "PointerMove",
  "PointerEnter",
  "PointerLeave",
];

export const avg = (xs) =>
  xs.length === 0 ? 0 : xs.reduce((sum, x) => sum + x, 0) / xs.length;

export const range = (n) =>
  Array(n)
    .fill(0)
    .map((_, i) => i);

export const random = (n) => Math.floor(Math.random() * (n + 1));

// Hex grid: 6 neighbors (left, right, upper-left, upper-right, lower-left, lower-right)
// plus the cell itself. Row y is offset right by y*W/2.
export const neighborhood = ([x, y]) => [
  [x, y],
  [x - 1, y],
  [x + 1, y],
  [x, y - 1],
  [x + 1, y - 1],
  [x - 1, y + 1],
  [x, y + 1],
];

export const vertexEquals = ([x1, y1], [x2, y2]) => x1 === x2 && y1 === y2;

export const lineEquals = ([v1, w1], [v2, w2]) =>
  vertexEquals(v1, v2) && vertexEquals(w1, w2);

export const signEquals = (...xs) =>
  xs.length === 0 ? true : xs.every((x) => Math.sign(x) === Math.sign(xs[0]));

// Star points for a Hex board. Odd board: single center dot.
// Even board (at least one even dimension): two cells straddling the geometric center.
export function getStarPoints(width, height) {
  if (width === 0 || height === 0) return [];

  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const cxInt = cx === Math.floor(cx);
  const cyInt = cy === Math.floor(cy);

  if (cxInt && cyInt) {
    return [[cx, cy]];
  }

  const p1 = [Math.floor(cx), Math.ceil(cy)];
  const p2 = [Math.ceil(cx), Math.floor(cy)];

  if (p1[0] === p2[0] && p1[1] === p2[1]) return [p1];
  return [p1, p2];
}

// Center of cell (ix, iy) in display coordinates (0-based within visible range),
// in pixels. vertexSize is W (horizontal cell spacing).
// R = W/sqrt(3), H = W*sqrt(3)/2.
export function cellCenter(ix, iy, vertexSize) {
  const R = vertexSize / Math.sqrt(3);
  const H = (vertexSize * Math.sqrt(3)) / 2;
  return {
    cx: (ix + iy / 2 + 0.5) * vertexSize,
    cy: R + iy * H,
  };
}

// Six corners of a pointy-top hex centered at (cx, cy) with circumradius R.
// Returns [[x,y], ...] in order: top, top-right, bottom-right, bottom, bottom-left, top-left.
export function hexCorners(cx, cy, R) {
  const half = R * (Math.sqrt(3) / 2); // = W/2
  return [
    [cx, cy - R],
    [cx + half, cy - R / 2],
    [cx + half, cy + R / 2],
    [cx, cy + R],
    [cx - half, cy + R / 2],
    [cx - half, cy - R / 2],
  ];
}

export function readjustShifts(shiftMap, vertex = null) {
  if (vertex == null) {
    for (let y = 0; y < shiftMap.length; y++) {
      for (let x = 0; x < shiftMap[0].length; x++) {
        readjustShifts(shiftMap, [x, y]);
      }
    }
  } else {
    let [x, y] = vertex;
    let direction = shiftMap[y][x];

    let data = [
      // Left
      [
        [1, 5, 8],
        [x - 1, y],
        [3, 7, 6],
      ],
      // Top
      [
        [2, 5, 6],
        [x, y - 1],
        [4, 7, 8],
      ],
      // Right
      [
        [3, 7, 6],
        [x + 1, y],
        [1, 5, 8],
      ],
      // Bottom
      [
        [4, 7, 8],
        [x, y + 1],
        [2, 5, 6],
      ],
    ];

    for (let [directions, [qx, qy], removeShifts] of data) {
      if (!directions.includes(direction)) continue;

      if (shiftMap[qy] && removeShifts.includes(shiftMap[qy][qx])) {
        shiftMap[qy][qx] = 0;
      }
    }
  }

  return shiftMap;
}

export function diffSignMap(before, after) {
  if (
    before === after ||
    before.length === 0 ||
    before.length !== after.length ||
    before[0].length !== after[0].length
  ) {
    return [];
  }

  let result = [];

  for (let y = 0; y < before.length; y++) {
    for (let x = 0; x < before[0].length; x++) {
      if (before[y][x] === 0 && after[y] != null && after[y][x]) {
        result.push([x, y]);
      }
    }
  }

  return result;
}
