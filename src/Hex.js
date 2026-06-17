import { createElement as h, Component } from "preact";
import classnames from "classnames";

import {
  random,
  readjustShifts,
  neighborhood,
  vertexEquals,
  vertexEvents,
  diffSignMap,
  range,
  cellCenter,
  getStarPoints,
} from "./helper.js";
import { CoordX, CoordY } from "./Coord.js";
import HexGrid from "./HexGrid.js";
import Vertex from "./Vertex.js";
import Line from "./Line.js";

export default class Hex extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate() {
    if (
      this.props.animateStonePlacement &&
      !this.state.clearAnimatedVerticesHandler &&
      this.state.animatedVertices.length > 0
    ) {
      for (let [x, y] of this.state.animatedVertices) {
        this.state.shiftMap[y][x] = random(7) + 1;
        readjustShifts(this.state.shiftMap, [x, y]);
      }

      this.setState({ shiftMap: this.state.shiftMap });

      this.setState({
        clearAnimatedVerticesHandler: setTimeout(() => {
          this.setState({
            animatedVertices: [],
            clearAnimatedVerticesHandler: null,
          });
        }, this.props.animationDuration ?? 200),
      });
    }
  }

  render() {
    let {
      width,
      height,
      rangeX,
      rangeY,
      xs,
      ys,
      starPoints,
      shiftMap,
      randomMap,
    } = this.state;

    let {
      innerProps = {},
      vertexSize = 24,
      coordX,
      coordY,
      busy,
      signMap,
      paintMap,
      heatMap,
      markerMap,
      ghostStoneMap,
      fuzzyStonePlacement = false,
      showCoordinates = false,
      lines = [],
      selectedVertices = [],
      dimmedVertices = [],
    } = this.props;

    let animatedVertices = [].concat(
      ...this.state.animatedVertices.map(neighborhood)
    );

    const SQRT3 = Math.sqrt(3);
    const R = vertexSize / SQRT3;
    const H = (vertexSize * SQRT3) / 2;
    const W = vertexSize;

    const ncols = xs.length;
    const nrows = ys.length;
    const contentWidth = ncols * W + ((nrows - 1) * W) / 2;
    const contentHeight = 2 * R + (nrows - 1) * H;

    return h(
      "div",
      {
        ...innerProps,
        id: this.props.id,
        className: classnames(
          "shudanhex-board",
          "shudanhex-board-image",
          {
            "shudanhex-busy": busy,
            "shudanhex-coordinates": showCoordinates,
          },
          this.props.class ?? this.props.className
        ),
        style: {
          display: "inline-block",
          position: "relative",
          fontSize: vertexSize,
          lineHeight: "1em",
          ...(this.props.style ?? {}),
        },
      },

      h(
        "div",
        {
          className: "shudanhex-content",
          style: {
            position: "relative",
            width: contentWidth,
            height: contentHeight,
          },
        },

        h(HexGrid, {
          vertexSize,
          width,
          height,
          xs,
          ys,
          starPoints,
        }),

        h(
          "div",
          {
            className: "shudanhex-vertices",
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            },
          },

          ys.map((y, j) =>
            xs.map((x, i) => {
              let equalsVertex = (v) => vertexEquals(v, [x, y]);
              let selected = selectedVertices.some(equalsVertex);
              const { cx, cy } = cellCenter(i, j, vertexSize);

              return h(
                "div",
                {
                  key: [x, y].join("-"),
                  style: {
                    position: "absolute",
                    left: cx - W / 2,
                    top: cy - R,
                    width: W,
                    height: 2 * R,
                  },
                },

                h(
                  Vertex,
                  Object.assign(
                    {
                      position: [x, y],

                      shift: fuzzyStonePlacement ? shiftMap?.[y]?.[x] : 0,
                      random: randomMap?.[y]?.[x],
                      sign: signMap?.[y]?.[x],

                      heat: heatMap?.[y]?.[x],
                      marker: markerMap?.[y]?.[x],
                      ghostStone: ghostStoneMap?.[y]?.[x],
                      dimmed: dimmedVertices.some(equalsVertex),
                      animate: animatedVertices.some(equalsVertex),

                      paint: paintMap?.[y]?.[x],
                      paintLeft: paintMap?.[y]?.[x - 1],
                      paintRight: paintMap?.[y]?.[x + 1],
                      paintTop: paintMap?.[y - 1]?.[x],
                      paintBottom: paintMap?.[y + 1]?.[x],
                      paintTopLeft: paintMap?.[y - 1]?.[x - 1],
                      paintTopRight: paintMap?.[y - 1]?.[x + 1],
                      paintBottomLeft: paintMap?.[y + 1]?.[x - 1],
                      paintBottomRight: paintMap?.[y + 1]?.[x + 1],

                      selected,
                      selectedLeft:
                        selected &&
                        selectedVertices.some((v) =>
                          vertexEquals(v, [x - 1, y])
                        ),
                      selectedRight:
                        selected &&
                        selectedVertices.some((v) =>
                          vertexEquals(v, [x + 1, y])
                        ),
                      selectedTop:
                        selected &&
                        selectedVertices.some((v) =>
                          vertexEquals(v, [x, y - 1])
                        ),
                      selectedBottom:
                        selected &&
                        selectedVertices.some((v) =>
                          vertexEquals(v, [x, y + 1])
                        ),
                    },

                    ...vertexEvents.map((e) => ({
                      [`on${e}`]: this.props[`onVertex${e}`],
                    }))
                  )
                )
              );
            })
          )
        ),

        h(
          "svg",
          {
            className: "shudanhex-lines",
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2,
            },
            viewBox: `0 0 ${contentWidth} ${contentHeight}`,
            preserveAspectRatio: "none",
          },

          lines.map(({ v1, v2, type }, i) =>
            h(Line, {
              key: i,
              v1,
              v2,
              type,
              vertexSize,
              x0: xs[0] ?? rangeX[0],
              y0: ys[0] ?? rangeY[0],
            })
          )
        ),

        showCoordinates &&
          h(CoordX, {
            xs,
            vertexSize,
            R,
            coordX,
          }),

        showCoordinates &&
          h(CoordY, {
            ys,
            vertexSize,
            R,
            H,
            coordY,
          })
      )
    );
  }
}

Hex.getDerivedStateFromProps = function (props, state) {
  let { signMap = [], rangeX = [0, Infinity], rangeY = [0, Infinity] } = props;

  let width = signMap.length === 0 ? 0 : signMap[0].length;
  let height = signMap.length;

  if (state.width === width && state.height === height) {
    let animatedVertices = state.animatedVertices;

    if (
      props.animateStonePlacement &&
      props.fuzzyStonePlacement &&
      state.clearAnimatedVerticesHandler == null
    ) {
      animatedVertices = diffSignMap(state.signMap, signMap);
    }

    let result = {
      signMap,
      animatedVertices,
    };

    if (
      !vertexEquals(state.rangeX, rangeX) ||
      !vertexEquals(state.rangeY, rangeY)
    ) {
      Object.assign(result, {
        rangeX,
        rangeY,
        xs: range(width).slice(rangeX[0], rangeX[1] + 1),
        ys: range(height).slice(rangeY[0], rangeY[1] + 1),
      });
    }

    return result;
  }

  // Board size changed
  return {
    signMap,
    width,
    height,
    rangeX,
    rangeY,
    animatedVertices: [],
    clearAnimatedVerticesHandler: null,
    xs: range(width).slice(rangeX[0], rangeX[1] + 1),
    ys: range(height).slice(rangeY[0], rangeY[1] + 1),
    starPoints: getStarPoints(width, height),
    shiftMap: readjustShifts(signMap.map((row) => row.map((_) => random(8)))),
    randomMap: signMap.map((row) => row.map((_) => random(4))),
  };
};
