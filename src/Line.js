import { createElement as h } from "preact";
import { vertexEquals, cellCenter } from "./helper.js";

export default function Line(props) {
  let { v1, v2, type = "line", vertexSize, x0 = 0, y0 = 0 } = props;
  if (vertexEquals(v1, v2)) return;

  const SQRT3 = Math.sqrt(3);
  const R = vertexSize / SQRT3;
  const H = (vertexSize * SQRT3) / 2;

  // Compute cell center in content-div coordinates for an absolute board vertex.
  function center([x, y]) {
    const i = x - x0;
    const j = y - y0;
    return cellCenter(i, j, vertexSize);
  }

  const p1 = center(v1);
  const p2 = center(v2);

  const dx = p2.cx - p1.cx;
  const dy = p2.cy - p1.cy;
  const left = (p1.cx + p2.cx) / 2;
  const top = (p1.cy + p2.cy) / 2;

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const length = Math.sqrt(dx * dx + dy * dy);
  const right = left + length / 2;

  return h("path", {
    className: `shudanhex-${type}`,
    d: `M ${left - length / 2} ${top} h ${length} ${
      type === "arrow"
        ? (() => {
            const x1 = right - vertexSize / 2;
            const y1 = top - vertexSize / 4;
            const x2 = right - vertexSize / 2;
            const y2 = top + vertexSize / 4;
            return `L ${x1} ${y1} M ${right} ${top} L ${x2} ${y2}`;
          })()
        : ""
    }`,
    transform: `rotate(${angle} ${left} ${top})`,
  });
}
