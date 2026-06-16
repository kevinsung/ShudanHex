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
  const labelHeight = vertexSize * 0.6; // font-size .6em

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
            left: cx,
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
  height,
  coordY = (i) => height - i,
}) {
  const labelFontSize = vertexSize * 0.6;

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
      const { cy } = cellCenter(0, j, vertexSize);
      return h(
        "span",
        {
          key: y,
          style: {
            position: "absolute",
            right: "100%",
            top: cy,
            transform: "translateY(-50%)",
            fontSize: labelFontSize,
            lineHeight: "1",
            textAlign: "right",
            whiteSpace: "nowrap",
            paddingRight: "0.3em",
          },
        },
        coordY(y)
      );
    })
  );
}
