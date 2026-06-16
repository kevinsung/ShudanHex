import { h, render, Component } from "preact";
import { Hex } from "../src/main.js";

// 11x11 starting position (empty board)
function emptyBoard(size) {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
}

const SIZE = 11;

const paintMap = emptyBoard(SIZE).map((row, y) =>
  row.map((_, x) => {
    // Simple territory split for demo: black upper-right, white lower-left
    const val = x - y;
    if (val > 2) return ((Math.random() * 2 + 1) / 3) * 1;
    if (val < -2) return ((Math.random() * 2 + 1) / 3) * -1;
    return 0;
  })
);

const heatMap = (() => {
  let _ = null;
  let O = (strength, text) => ({ strength, text });
  const m = emptyBoard(SIZE).map((row) => row.map(() => _));
  m[2][8] = O(9, "80%");
  m[3][7] = O(7, "60%");
  m[4][6] = O(3, "30%");
  m[7][3] = O(5, "50%");
  m[8][2] = O(2, "20%");
  return m;
})();

const markerMap = (() => {
  let _ = null;
  let O = { type: "circle" };
  let X = { type: "cross" };
  let T = { type: "triangle" };
  let Q = { type: "square" };
  let $ = { type: "point" };
  let S = { type: "loader" };
  let L = (label) => ({ type: "label", label });

  const m = emptyBoard(SIZE).map((row) => row.map(() => _));
  m[1][1] = O;
  m[1][2] = O;
  m[1][3] = O;
  m[3][5] = X;
  m[4][5] = X;
  m[5][3] = T;
  m[5][4] = T;
  m[7][7] = Q;
  m[8][7] = Q;
  m[9][5] = $;
  m[9][6] = S;
  m[9][9] = L("A");
  m[8][9] = L("B");
  m[7][9] = L("C");
  return m;
})();

const ghostStoneMap = (() => {
  let _ = null;
  const m = emptyBoard(SIZE).map((row) => row.map(() => _));
  m[0][0] = { sign: 1 };
  m[1][0] = { sign: -1 };
  m[2][0] = { sign: 1, type: "good" };
  m[3][0] = { sign: 1, type: "interesting" };
  m[4][0] = { sign: 1, type: "doubtful" };
  m[5][0] = { sign: 1, type: "bad" };
  m[6][0] = { sign: -1, faint: true };
  return m;
})();

const createTwoWayCheckBox =
  (component) =>
  ({ stateKey, text }) =>
    h(
      "label",
      {
        style: {
          display: "flex",
          alignItems: "center",
        },
      },

      h("input", {
        style: { marginRight: ".5em" },
        type: "checkbox",
        checked: component.state[stateKey],
        onClick: () =>
          component.setState((s) => ({ [stateKey]: !s[stateKey] })),
      }),

      h("span", { style: { userSelect: "none" } }, text)
    );

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      signMap: emptyBoard(SIZE),
      vertexSize: 24,
      showCoordinates: false,
      showCorner: false,
      showDimmedStones: false,
      fuzzyStonePlacement: false,
      animateStonePlacement: false,
      showPaintMap: false,
      showHeatMap: false,
      showMarkerMap: false,
      showGhostStones: false,
      showLines: false,
      showSelection: false,
      isBusy: false,
    };

    this.CheckBox = createTwoWayCheckBox(this);
  }

  render() {
    let {
      signMap,
      vertexSize,
      showCoordinates,
      showCorner,
      showDimmedStones,
      fuzzyStonePlacement,
      animateStonePlacement,
      showPaintMap,
      showHeatMap,
      showMarkerMap,
      showGhostStones,
      showLines,
      showSelection,
    } = this.state;

    return h(
      "section",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "15em auto",
          gridColumnGap: "1em",
        },
      },

      h(
        "form",
        {
          style: {
            display: "flex",
            flexDirection: "column",
          },
        },

        h(
          "p",
          { style: { margin: "0 0 .5em 0" } },
          "Size: ",

          h(
            "button",
            {
              type: "button",
              onClick: () =>
                this.setState((s) => ({
                  vertexSize: Math.max(s.vertexSize - 4, 4),
                })),
            },
            "-"
          ),
          " ",

          h(
            "button",
            {
              type: "button",
              title: "Reset",
              onClick: () => this.setState({ vertexSize: 24 }),
            },
            "•"
          ),
          " ",

          h(
            "button",
            {
              type: "button",
              onClick: () =>
                this.setState((s) => ({ vertexSize: s.vertexSize + 4 })),
            },
            "+"
          )
        ),

        h(
          "p",
          { style: { margin: "0 0 .5em 0" } },
          "Stones: ",

          h(
            "button",
            {
              type: "button",
              title: "Reset",
              onClick: () => this.setState({ signMap: emptyBoard(SIZE) }),
            },
            "•"
          )
        ),

        h(this.CheckBox, {
          stateKey: "showCoordinates",
          text: "Show coordinates",
        }),
        h(this.CheckBox, {
          stateKey: "showCorner",
          text: "Show lower-right corner only",
        }),
        h(this.CheckBox, {
          stateKey: "showDimmedStones",
          text: "Dim some stones",
        }),
        h(this.CheckBox, {
          stateKey: "fuzzyStonePlacement",
          text: "Fuzzy stone placement",
        }),
        h(this.CheckBox, {
          stateKey: "animateStonePlacement",
          text: "Animate stone placement",
        }),
        h(this.CheckBox, { stateKey: "showMarkerMap", text: "Show markers" }),
        h(this.CheckBox, {
          stateKey: "showGhostStones",
          text: "Show ghost stones",
        }),
        h(this.CheckBox, { stateKey: "showPaintMap", text: "Show paint map" }),
        h(this.CheckBox, { stateKey: "showHeatMap", text: "Show heat map" }),
        h(this.CheckBox, { stateKey: "showLines", text: "Show lines" }),
        h(this.CheckBox, { stateKey: "showSelection", text: "Show selection" }),
        h(this.CheckBox, { stateKey: "isBusy", text: "Busy" })
      ),

      h(
        "div",
        {},
        h(Hex, {
          innerProps: {
            onContextMenu: (evt) => evt.preventDefault(),
          },

          vertexSize,
          busy: this.state.isBusy,
          rangeX: showCorner ? [6, 10] : undefined,
          rangeY: showCorner ? [6, 10] : undefined,

          signMap,
          showCoordinates,
          fuzzyStonePlacement,
          animateStonePlacement,
          paintMap: showPaintMap && paintMap,
          heatMap: showHeatMap && heatMap,
          markerMap: showMarkerMap && markerMap,
          ghostStoneMap: showGhostStones && ghostStoneMap,

          lines: showLines
            ? [
                { type: "line", v1: [2, 2], v2: [8, 8] },
                { type: "arrow", v1: [8, 2], v2: [2, 8] },
              ]
            : [],

          dimmedVertices: showDimmedStones
            ? [
                [3, 3],
                [4, 3],
                [3, 4],
                [7, 6],
                [7, 7],
              ]
            : [],

          selectedVertices: showSelection
            ? [
                [5, 5],
                [6, 5],
                [5, 6],
                [6, 6],
              ]
            : [],

          onVertexMouseUp: (evt, [x, y]) => {
            const sign = evt.button === 0 ? 1 : -1;
            this.setState((s) => {
              const next = s.signMap.map((row) => row.slice());
              next[y][x] = next[y][x] === sign ? 0 : sign;
              return { signMap: next };
            });
          },
        })
      )
    );
  }
}

render(h(App), document.getElementById("root"));
