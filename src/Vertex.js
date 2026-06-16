import { createElement as h } from "preact";
import { useCallback } from "preact/hooks";
import classnames from "classnames";

import { avg, vertexEvents, signEquals } from "./helper.js";
import Marker from "./Marker.js";

const absoluteStyle = (zIndex) => ({
  position: "absolute",
  zIndex,
});

export default function Vertex(props) {
  let {
    position,
    shift,
    random,
    sign,
    heat,
    paint,
    paintLeft,
    paintRight,
    paintTop,
    paintBottom,
    paintTopLeft,
    paintTopRight,
    paintBottomLeft,
    paintBottomRight,
    dimmed,
    marker,
    ghostStone,
    animate,
    selected,
    selectedLeft,
    selectedRight,
    selectedTop,
    selectedBottom,
  } = props;

  let eventHandlers = {};

  for (let eventName of vertexEvents) {
    eventHandlers[eventName] = useCallback(
      (evt) => {
        props[`on${eventName}`]?.(evt, position);
      },
      [...position, props[`on${eventName}`]]
    );
  }

  let markerMarkup = (zIndex) =>
    !!marker &&
    h(Marker, {
      key: "marker",
      sign,
      type: marker.type,
      label: marker.label,
      zIndex,
    });

  return h(
    "div",
    Object.assign(
      {
        "data-x": position[0],
        "data-y": position[1],

        title: marker?.label,
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
        },
        className: classnames(
          "shudanhex-vertex",
          `shudanhex-random_${random}`,
          `shudanhex-sign_${sign}`,
          {
            [`shudanhex-shift_${shift}`]: !!shift,
            [`shudanhex-heat_${!!heat && heat.strength}`]: !!heat,
            "shudanhex-dimmed": dimmed,
            "shudanhex-animate": animate,

            [`shudanhex-paint_${paint > 0 ? 1 : -1}`]: !!paint,
            "shudanhex-paintedleft": !!paint && signEquals(paintLeft, paint),
            "shudanhex-paintedright": !!paint && signEquals(paintRight, paint),
            "shudanhex-paintedtop": !!paint && signEquals(paintTop, paint),
            "shudanhex-paintedbottom":
              !!paint && signEquals(paintBottom, paint),

            "shudanhex-selected": selected,
            "shudanhex-selectedleft": selectedLeft,
            "shudanhex-selectedright": selectedRight,
            "shudanhex-selectedtop": selectedTop,
            "shudanhex-selectedbottom": selectedBottom,

            [`shudanhex-marker_${marker?.type}`]: !!marker?.type,
            "shudanhex-smalllabel":
              marker?.type === "label" &&
              (marker.label?.includes("\n") || marker.label.length >= 3),

            [`shudanhex-ghost_${ghostStone?.sign}`]: !!ghostStone,
            [`shudanhex-ghost_${ghostStone?.type}`]: !!ghostStone?.type,
            "shudanhex-ghost_faint": !!ghostStone?.faint,
          }
        ),
      },
      ...vertexEvents.map((eventName) => ({
        [`on${eventName}`]: eventHandlers[eventName],
      }))
    ),

    !sign && markerMarkup(0),
    !sign &&
      !!ghostStone &&
      h("div", {
        key: "ghost",
        className: "shudanhex-ghost",
        style: absoluteStyle(1),
      }),

    h(
      "div",
      { key: "stone", className: "shudanhex-stone", style: absoluteStyle(2) },

      !!sign &&
        h(
          "div",
          {
            key: "inner",
            className: classnames(
              "shudanhex-inner",
              "shudanhex-stone-image",
              `shudanhex-random_${random}`,
              `shudanhex-sign_${sign}`
            ),
            style: absoluteStyle(),
          },
          sign
        ),

      !!sign && markerMarkup()
    ),

    (!!paint || !!paintLeft || !!paintRight || !!paintTop || !!paintBottom) &&
      h("div", {
        key: "paint",
        className: "shudanhex-paint",
        style: {
          ...absoluteStyle(3),
          "--shudanhex-paint-opacity": avg(
            (!!paint
              ? [paint]
              : [paintLeft, paintRight, paintTop, paintBottom].map(
                  (x) => x !== 0 && !isNaN(x)
                )
            ).map((x) => Math.abs(x ?? 0) * 0.5)
          ),
          "--shudanhex-paint-box-shadow": [
            signEquals(paintLeft, paintTop, paintTopLeft)
              ? [Math.sign(paintTop), "-.5em -.5em"]
              : null,
            signEquals(paintRight, paintTop, paintTopRight)
              ? [Math.sign(paintTop), ".5em -.5em"]
              : null,
            signEquals(paintLeft, paintBottom, paintBottomLeft)
              ? [Math.sign(paintBottom), "-.5em .5em"]
              : null,
            signEquals(paintRight, paintBottom, paintBottomRight)
              ? [Math.sign(paintBottom), ".5em .5em"]
              : null,
          ]
            .filter((x) => !!x && x[0] !== 0)
            .map(
              ([sign, translation]) =>
                `${translation} 0 0 var(${
                  sign > 0
                    ? "--shudanhex-black-background-color"
                    : "--shudanhex-white-background-color"
                })`
            )
            .join(","),
        },
      }),

    !!selected &&
      h("div", {
        key: "selection",
        className: "shudanhex-selection",
        style: absoluteStyle(4),
      }),

    h("div", {
      key: "heat",
      className: "shudanhex-heat",
      style: absoluteStyle(5),
    }),
    heat?.text != null &&
      h(
        "div",
        {
          key: "heatlabel",
          className: "shudanhex-heatlabel",
          style: absoluteStyle(6),
        },
        heat.text && heat.text.toString()
      )
  );
}
