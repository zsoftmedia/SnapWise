declare module "react-easy-panzoom" {
  import * as React from "react";

  export interface PanZoomProps {
    zoomEnabled?: boolean;
    panEnabled?: boolean;
    autoCenter?: boolean;
    zoomSpeed?:number;
    minZoom?: number;
    maxZoom?: number;

    autoCenterZoomLevel?: number;

    boundaryRatioVertical?: number;
    boundaryRatioHorizontal?: number;

    style?: React.CSSProperties;
    className?: string;

    children?: React.ReactNode;
  }

  export default class PanZoom extends React.Component<PanZoomProps> {}
}
