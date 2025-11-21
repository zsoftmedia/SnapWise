import React, { useState, useRef } from "react";
import PanZoom from "react-easy-panzoom";
import "./planPinBoard.css";
import { SlIcon } from "@shoelace-style/shoelace/dist/react";

export type PlanPin = {
  id: string;
  x: number;
  y: number;
  label: string;
};

type Props = {
  imageUrl: string;
  pins: PlanPin[];
  activePinId?: string | null;
  onAddPin: (p: PlanPin) => void;
  onDeletePin: (id: string) => void;
  onEditPin: (id: string) => void;
};

export default function PlanPinBoard({
  imageUrl,
  pins,
  activePinId,
  onAddPin,
  onDeletePin,
  onEditPin,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);

  const [showCrosshair, setShowCrosshair] = useState(false);
  const [crosshair, setCrosshair] = useState({ x: 0, y: 0 });

  // NEW: state for which pin's actions are open
  const [openPinId, setOpenPinId] = useState<string | null>(null);

  /* -------------------------------------------------
     Convert screen → image relative %
  ------------------------------------------------- */
  const getCoords = (clientX: number, clientY: number) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    let xPct = ((clientX - rect.left) / rect.width) * 100;
    let yPct = ((clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.min(100, Math.max(0, xPct)),
      y: Math.min(100, Math.max(0, yPct)),
    };
  };

  /* -------------------------------------------------
     Desktop mouse move
  ------------------------------------------------- */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showCrosshair) return;
    setCrosshair(getCoords(e.clientX, e.clientY));
  };

  /* -------------------------------------------------
     Touch move
  ------------------------------------------------- */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!showCrosshair) return;
    if (e.touches.length === 1) {
      const t = e.touches[0];
      setCrosshair(getCoords(t.clientX, t.clientY));
    }
  };

  /* -------------------------------------------------
     Click → add pin
  ------------------------------------------------- */
  const handleClick = (e: React.MouseEvent) => {
    // If clicking background → close actions
    setOpenPinId(null);

    if (!showCrosshair) return;

    const { x, y } = getCoords(e.clientX, e.clientY);

    onAddPin({
      id: crypto.randomUUID(),
      x,
      y,
      label: `#${pins.length + 1}`,
    });

    setShowCrosshair(false);
  };

  /* -------------------------------------------------
     Touch end → add pin
  ------------------------------------------------- */
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!showCrosshair) return;

    if (e.changedTouches.length === 1) {
      const t = e.changedTouches[0];
      const { x, y } = getCoords(t.clientX, t.clientY);

      onAddPin({
        id: crypto.randomUUID(),
        x,
        y,
        label: `#${pins.length + 1}`,
      });

      setShowCrosshair(false);
    }
  };

  return (
    <div className="plan-wrapper">
      {/* Add Pin Button */}
      <button
        className={`add-pin-btn ${showCrosshair ? "active" : ""}`}
        onClick={() => {
          setShowCrosshair(!showCrosshair);
          setOpenPinId(null); // close all pin menus
        }}
      >
        <SlIcon name="plus-lg" /> Add Pin
      </button>

      <PanZoom
        zoomEnabled
        panEnabled
        autoCenter
        minZoom={0.5}
        maxZoom={3}
        zoomSpeed={0.4}
        style={{ width: "100%", height: "100%" }}
      >
        <div
          className={`plan-inner ${showCrosshair ? "add-pin-active" : ""}`}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="plan-grid" />

          <img ref={imgRef} src={imageUrl} className="plan-image" alt="Blueprint" />

          {/* Crosshair */}
          {showCrosshair && (
            <>
              <div
                className="crosshair-line vertical"
                style={{ left: `${crosshair.x}%` }}
              />
              <div
                className="crosshair-line horizontal"
                style={{ top: `${crosshair.y}%` }}
              />

              <div
                className="crosshair-icon"
                style={{ left: `${crosshair.x}%`, top: `${crosshair.y}%` }}
              >
                <SlIcon name="geo-alt-fill" />
              </div>
            </>
          )}

          {/* PINS */}
          {pins.map((p, index) => {
            const isOpen = openPinId === p.id;

            return (
              <div
                key={p.id}
                className={`pin ${isOpen ? "open" : ""}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onClick={(e) => {
                  e.stopPropagation(); // don't close by accident
                  setOpenPinId(p.id);
                }}
              >
                <div className={`pin-actions ${isOpen ? "show" : ""}`}>
                  <button className="pin-action edit" onClick={() => onEditPin(p.id)}>✎</button>
                  <button className="pin-action delete" onClick={() => onDeletePin(p.id)}>✕</button>
                </div>

                <div className="pin-icon">
                  <SlIcon name="geo-alt-fill" className="sl-icon" />
                </div>

                <span className="pin-number">{index + 1}</span>
              </div>
            );
          })}
        </div>
      </PanZoom>
    </div>
  );
}
