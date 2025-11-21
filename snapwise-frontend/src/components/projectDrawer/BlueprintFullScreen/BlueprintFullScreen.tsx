import React from "react";
import {SlDrawer } from "@shoelace-style/shoelace/dist/react";
import "./bluePrintFullScreen.css";

type Props = {
  open: boolean;
  onClose: () => void;
  planUrl: string;
  pins: Array<{ id: string; x: number; y: number; label: string }>;
};

export default function BlueprintFullScreen({ open, onClose, planUrl, pins }: Props) {
  return (
    <SlDrawer
      open={open}
      onSlAfterHide={onClose}
      placement="end"
      label="Blueprint Viewer"
      className="bp-fullscreen"
    >
      <div className="bp-container">
        <div className="bp-image-wrapper">
          <img src={planUrl} alt="Blueprint" className="bp-image" />

          {pins.map((p) => (
            <div
              key={p.id}
              className="bp-pin"
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            >
              <div className="bp-pin-circle">{p.label}</div>
            </div>
          ))}
        </div>
      </div>
    </SlDrawer>
  );
}
