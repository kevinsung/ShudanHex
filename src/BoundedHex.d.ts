import type { ComponentClass } from "preact";
import type { HexProps } from "./Hex";

export type BoundedHexProps = Omit<HexProps, "vertexSize"> & {
  maxWidth: number;
  maxHeight: number;
  maxVertexSize?: number;

  onResized?: () => void;
};

declare const BoundedHex: ComponentClass<BoundedHexProps>;

export default BoundedHex;
