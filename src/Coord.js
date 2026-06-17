import { createElement as h } from "preact";
import { alpha, cellCenter } from "./helper.js";

// Column labels — rendered above each column's top cell.
// Positioned absolutely inside shudanhex-content (at negative top so they sit above the board).
export function CoordX({
  xs,
  vertexSize,
  R,
  coordX = (i) => alpha[i] ?? alpha[alpha.length - 1],
}) {
  const labelHeight = vertexSize * 0.4; // font-size .4em

  return h(
    "div",
    {
      className: "shudanhex-coordx",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 3,
      },
    },

    xs.map((x, i) => {
      const { cx } = cellCenter(i, 0, vertexSize);
      return h(
        "span",
        {
          key: x,
          style: {
            position: "absolute",
            left: cx - vertexSize / 2,
            top: -labelHeight,
            transform: "translateX(-50%)",
            fontSize: labelHeight,
            lineHeight: "1",
            textAlign: "center",
            whiteSpace: "nowrap",
          },
        },
        coordX(x)
      );
    })
  );
}

// Row labels — rendered to the left of each row's first cell.
export function CoordY({
  ys,
  vertexSize,
  R,
  H,
  coordY = (i) => i + 1,
}) {
  const labelFontSize = vertexSize * 0.4;

  return h(
    "div",
    {
      className: "shudanhex-coordy",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 3,
      },
    },

    ys.map((y, j) => {
      const { cx, cy } = cellCenter(0, j, vertexSize);
      return h(
        "span",
        {
          key: y,
          style: {
            position: "absolute",
            left: cx - vertexSize / 2,
            top: cy,
            transform: "translate(-100%, -50%)",
            fontSize: labelFontSize,
            lineHeight: "1",
            whiteSpace: "nowrap",
            paddingRight: "0.6em",
          },
        },
        coordY(y)
      );
    })
  );
}
