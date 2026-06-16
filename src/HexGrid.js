import { createElement as h } from "preact";
import { useMemo } from "preact/hooks";
import { cellCenter, hexCorners } from "./helper.js";

function pts(pairs) {
  return pairs.map(([x, y]) => `${x},${y}`).join(" ");
}

// Clip a convex polygon to the half-plane { sign * dot(p − P, n) ≥ 0 }
// using the Sutherland–Hodgman algorithm.
function clipHalfPlane(polygon, P, n, sign) {
  const result = [];
  const len = polygon.length;
  for (let i = 0; i < len; i++) {
    const cur = polygon[i];
    const nxt = polygon[(i + 1) % len];
    const dCur = sign * ((cur[0] - P[0]) * n[0] + (cur[1] - P[1]) * n[1]);
    const dNxt = sign * ((nxt[0] - P[0]) * n[0] + (nxt[1] - P[1]) * n[1]);
    if (dCur >= 0) result.push(cur);
    if (dCur >= 0 !== dNxt >= 0) {
      const t = dCur / (dCur - dNxt);
      result.push([
        cur[0] + t * (nxt[0] - cur[0]),
        cur[1] + t * (nxt[1] - cur[1]),
      ]);
    }
  }
  return result;
}

let _clipIdCounter = 0;

export default function HexGrid(props) {
  let { vertexSize, xs, ys, starPoints } = props;
  let ncols = xs.length;
  let nrows = ys.length;

  // Stable clip-path ID prefix for this component instance (survives re-renders).
  const clipId = useMemo(() => `shudanhex-ec-${_clipIdCounter++}`, []);

  return useMemo(() => {
    if (ncols === 0 || nrows === 0) return null;

    const R = vertexSize / Math.sqrt(3);
    const H = (vertexSize * Math.sqrt(3)) / 2;
    const W = vertexSize;

    // --- Hexagon outlines ---
    const hexagons = ys.map((_, j) =>
      xs.map((_, i) => {
        const { cx, cy } = cellCenter(i, j, vertexSize);
        const corners = hexCorners(cx, cy, R);
        return h("polygon", {
          key: `hex-${i}-${j}`,
          className: "shudanhex-hexline",
          points: pts(corners),
        });
      })
    );

    // --- Player edge polylines ---
    // Top edge (black): zigzag along top faces of row j=0
    const topPts = [];
    topPts.push([0, R / 2]); // top-left of cell (0,0)
    for (let i = 0; i < ncols; i++) {
      const { cx } = cellCenter(i, 0, vertexSize);
      topPts.push([cx, 0]); // top vertex
      topPts.push([cx + W / 2, R / 2]); // top-right vertex
    }

    // Bottom edge (black): zigzag along bottom faces of row j=nrows-1
    const J = nrows - 1;
    const cyJ = R + J * H;
    const bottomPts = [];
    bottomPts.push([(J * W) / 2, cyJ + R / 2]); // bottom-left of (0,J)
    for (let i = 0; i < ncols; i++) {
      const { cx } = cellCenter(i, J, vertexSize);
      bottomPts.push([cx, cyJ + R]); // bottom vertex
      bottomPts.push([cx + W / 2, cyJ + R / 2]); // bottom-right
    }

    // Left edge (white): zigzag along left faces of column i=0
    const leftPts = [];
    for (let j = 0; j < nrows; j++) {
      const { cy } = cellCenter(0, j, vertexSize);
      leftPts.push([(j * W) / 2, cy - R / 2]); // top-left vertex
      leftPts.push([(j * W) / 2, cy + R / 2]); // bottom-left vertex
    }

    // Right edge (white): zigzag along right faces of column i=ncols-1
    const rightPts = [];
    for (let j = 0; j < nrows; j++) {
      const { cy } = cellCenter(ncols - 1, j, vertexSize);
      const rx = (ncols + j / 2) * W; // x of right-side vertices
      rightPts.push([rx, cy - R / 2]); // top-right vertex
      rightPts.push([rx, cy + R / 2]); // bottom-right vertex
    }

    // --- Star points ---
    const stars = starPoints
      .map(([x, y]) => {
        const i = xs.indexOf(x);
        const j = ys.indexOf(y);
        if (i < 0 || j < 0) return null;
        const { cx, cy } = cellCenter(i, j, vertexSize);
        return h("circle", {
          key: `star-${x}-${y}`,
          className: "shudanhex-star",
          cx,
          cy,
          r: ".1em",
        });
      })
      .filter(Boolean);

    // Content box total size
    const totalWidth = ncols * W + ((nrows - 1) * W) / 2;
    const totalHeight = 2 * R + (nrows - 1) * H;

    // --- Edge clip paths: diagonal seam at each corner ---
    //
    // At each corner the black and white edges share an endpoint. Without
    // clipping, each round stroke-cap paints over the other (white on top
    // in DOM order). Instead, we bisect the angle between the two edges at
    // every corner and clip each polyline to its own half-plane so the caps
    // meet cleanly along the bisector with no overlap.
    //
    // Corner points (shared endpoints of black and white edges):
    const P_TL = [0, R / 2];
    const P_TR = [ncols * W, R / 2];
    const P_BL = [(J * W) / 2, cyJ + R / 2];
    const P_BR = [(ncols + J / 2) * W, cyJ + R / 2];

    // Bisector normals, oriented so that black is on the positive side.
    // Derived from normalize(db + dw) where db/dw are the unit directions of
    // the black/white edge leaving each corner. By hex geometry these are
    // constant for all board sizes:
    //   TL: db=(√3/2,−½), dw=(0,1)  → bisector=(√3/2,½) → n=(½,−√3/2)
    //   TR: db=(−√3/2,−½), dw=(0,1) → bisector=(−√3/2,½) → n=(−½,−√3/2)
    //   BL: db=(√3/2,½), dw=(0,−1)  → bisector=(√3/2,−½) → n=(½,√3/2)
    //   BR: db=(−√3/2,½), dw=(0,−1) → bisector=(−√3/2,−½) → n=(−½,√3/2)
    const SQ3_2 = Math.sqrt(3) / 2;
    const n_TL = [0.5, -SQ3_2];
    const n_TR = [-0.5, -SQ3_2];
    const n_BL = [0.5, SQ3_2];
    const n_BR = [-0.5, SQ3_2];

    // Start each clip polygon as a generous bounding box and intersect it
    // with the two half-planes at the edge's endpoints.
    // sign +1 = black side, sign −1 = white side.
    const m = 2 * W;
    const bbox = [
      [-m, -m],
      [totalWidth + m, -m],
      [totalWidth + m, totalHeight + m],
      [-m, totalHeight + m],
    ];

    const clipTop = clipHalfPlane(
      clipHalfPlane(bbox, P_TL, n_TL, 1),
      P_TR,
      n_TR,
      1
    );
    const clipBottom = clipHalfPlane(
      clipHalfPlane(bbox, P_BL, n_BL, 1),
      P_BR,
      n_BR,
      1
    );
    const clipLeft = clipHalfPlane(
      clipHalfPlane(bbox, P_TL, n_TL, -1),
      P_BL,
      n_BL,
      -1
    );
    const clipRight = clipHalfPlane(
      clipHalfPlane(bbox, P_TR, n_TR, -1),
      P_BR,
      n_BR,
      -1
    );

    return h(
      "svg",
      {
        className: "shudanhex-grid",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          zIndex: 0,
        },
        viewBox: `0 0 ${totalWidth} ${totalHeight}`,
        preserveAspectRatio: "none",
      },

      h(
        "defs",
        { key: "defs" },
        h(
          "clipPath",
          { key: "cp-top", id: `${clipId}-top` },
          h("polygon", { points: pts(clipTop) })
        ),
        h(
          "clipPath",
          { key: "cp-bottom", id: `${clipId}-bottom` },
          h("polygon", { points: pts(clipBottom) })
        ),
        h(
          "clipPath",
          { key: "cp-left", id: `${clipId}-left` },
          h("polygon", { points: pts(clipLeft) })
        ),
        h(
          "clipPath",
          { key: "cp-right", id: `${clipId}-right` },
          h("polygon", { points: pts(clipRight) })
        )
      ),

      ...hexagons.flat(),

      h("polyline", {
        key: "edge-top",
        className: "shudanhex-edge shudanhex-edge_black",
        points: pts(topPts),
        fill: "none",
        "clip-path": `url(#${clipId}-top)`,
      }),
      h("polyline", {
        key: "edge-bottom",
        className: "shudanhex-edge shudanhex-edge_black",
        points: pts(bottomPts),
        fill: "none",
        "clip-path": `url(#${clipId}-bottom)`,
      }),
      h("polyline", {
        key: "edge-left",
        className: "shudanhex-edge shudanhex-edge_white",
        points: pts(leftPts),
        fill: "none",
        "clip-path": `url(#${clipId}-left)`,
      }),
      h("polyline", {
        key: "edge-right",
        className: "shudanhex-edge shudanhex-edge_white",
        points: pts(rightPts),
        fill: "none",
        "clip-path": `url(#${clipId}-right)`,
      }),

      ...stars
    );
  }, [vertexSize, ncols, nrows, xs[0], ys[0], starPoints]);
}
