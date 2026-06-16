import { createElement as h } from "preact";
import { useMemo } from "preact/hooks";
import { cellCenter, hexCorners } from "./helper.js";

function pts(pairs) {
  return pairs.map(([x, y]) => `${x},${y}`).join(" ");
}

export default function HexGrid(props) {
  let { vertexSize, xs, ys, starPoints } = props;
  let ncols = xs.length;
  let nrows = ys.length;

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
          zIndex: 0,
        },
        viewBox: `0 0 ${totalWidth} ${totalHeight}`,
        preserveAspectRatio: "none",
      },

      ...hexagons.flat(),

      h("polyline", {
        key: "edge-top",
        className: "shudanhex-edge shudanhex-edge_black",
        points: pts(topPts),
        fill: "none",
      }),
      h("polyline", {
        key: "edge-bottom",
        className: "shudanhex-edge shudanhex-edge_black",
        points: pts(bottomPts),
        fill: "none",
      }),
      h("polyline", {
        key: "edge-left",
        className: "shudanhex-edge shudanhex-edge_white",
        points: pts(leftPts),
        fill: "none",
      }),
      h("polyline", {
        key: "edge-right",
        className: "shudanhex-edge shudanhex-edge_white",
        points: pts(rightPts),
        fill: "none",
      }),

      ...stars
    );
  }, [vertexSize, ncols, nrows, xs[0], ys[0], starPoints]);
}
