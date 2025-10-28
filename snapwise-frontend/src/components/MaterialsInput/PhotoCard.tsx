import React, { useEffect, useState } from "react";

import SlDialog from "@shoelace-style/shoelace/dist/react/dialog";
import SlInput from "@shoelace-style/shoelace/dist/react/input";
import SlTextarea from "@shoelace-style/shoelace/dist/react/textarea";
import SlRadio from "@shoelace-style/shoelace/dist/react/radio";
import SlRadioGroup from "@shoelace-style/shoelace/dist/react/radio-group";
import SlButton from "@shoelace-style/shoelace/dist/react/button";
import SlSelect from "@shoelace-style/shoelace/dist/react/select";
import SlOption from "@shoelace-style/shoelace/dist/react/option";
import SlDivider from "@shoelace-style/shoelace/dist/react/divider";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon";

import "./photoDialogCss.css";
import { PHOTO_STATUS, PhotoItem } from "../../types/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (photo: PhotoItem) => void;
  initial?: PhotoItem;
};

const STATUS_LABEL: Record<PhotoItem["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  finished: "Finished"
};

export default function PhotoDialog({ open, onClose, onSave, initial }: Props) {
  // local state
  const [phase, setPhase] = useState<PhotoItem["phase"]>("before");
  const [status, setStatus] = useState<PhotoItem["status"]>("not_started");
  const [description, setDescription] = useState("");
  const [employeesOnTask, setEmployeesOnTask] = useState<number>(0);
  const [locationTag, setLocationTag] = useState<string>("");
  const [materialsCsv, setMaterialsCsv] = useState<string>("");

  // Keep dialog fields in sync whenever a new "initial" arrives or dialog opens
  useEffect(() => {
    setPhase(initial?.phase ?? "before");
    setStatus(initial?.status ?? "not_started");
    setDescription(initial?.description ?? "");
    setEmployeesOnTask(initial?.employeesOnTask ?? 0);
    setLocationTag(initial?.locationTag ?? "");
    setMaterialsCsv((initial?.materials ?? []).join(", "));
  }, [initial, open]);

  const handleSave = () => {
    if (!initial) return;
    const materials = materialsCsv
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    onSave({
      ...initial,
      phase,
      status,
      description,
      employeesOnTask,
      locationTag,
      materials
    });

    // Close explicitly only after save
    onClose();
  };

  return (
    <SlDialog
      className="pd-root"
      label="Photo details"
      open={open}
      // ✅ Block ALL implicit close attempts (overlay click, ESC, etc.)
      onSlRequestClose={(e: any) => {
        e.preventDefault();
      }}
      // ❌ Do NOT auto-close via onSlAfterHide; we close explicitly on Save/Cancel
      style={{ "--width": "520px" } as any}
    >
      {/* Header */}
      <div className="pd-head">
        <div className="pd-head-left">
          <SlIcon name="image" />
          <span>Attach metadata</span>
        </div>
        <div className="pd-head-right">
          <SlButton size="small" variant="neutral" onClick={onClose}>
            <SlIcon name="x" /> Close
          </SlButton>
        </div>
      </div>

      {/* Preview */}
      {initial?.dataUrl && (
        <div className="pd-preview">
          <img src={initial.dataUrl} alt={initial.fileName} />
          <div className="pd-filemeta">
            <div className="pd-name" title={initial.fileName}>
              {initial.fileName}
            </div>
            <div className="pd-sub">
              {Math.round((initial.size ?? 0) / 1024)} KB · {initial.mimeType || "image"}
            </div>
          </div>
        </div>
      )}

      <SlDivider />

      {/* Form */}
      <div className="pd-grid">
        <div className="pd-field">
          <label className="pd-label">Phase</label>
          <SlRadioGroup
            value={phase}
            className="pd-row-inline"
            onSlChange={(e: any) => setPhase(e.detail?.value ?? e.target.value)}
          >
            <SlRadio value="before">Before</SlRadio>
            <SlRadio value="after">After</SlRadio>
          </SlRadioGroup>
        </div>

        <div className="pd-field">
          <label className="pd-label">Status</label>
          {/* Keep hoist (good UX), but we now block implicit dialog closes globally */}
          <SlSelect
            hoist
            value={status}
            placeholder="Select status"
            onSlChange={(e: any) => setStatus(e.detail?.value ?? e.target.value)}
          >
            {PHOTO_STATUS.map((s) => (
              <SlOption key={s} value={s}>
                {STATUS_LABEL[s]}
              </SlOption>
            ))}
          </SlSelect>
        </div>

        <div className="pd-field">
          <label className="pd-label">Employees on this task</label>
          <SlInput
            type="number"
            min="0"
            inputMode="numeric"
            value={String(employeesOnTask)}
            onSlChange={(e: any) => setEmployeesOnTask(Number(e.target.value) || 0)}
          />
        </div>

        <div className="pd-field">
          <label className="pd-label">Location tag (optional)</label>
          <SlInput
            placeholder="e.g. Floor 2, Room 210"
            value={locationTag}
            onSlChange={(e: any) => setLocationTag(e.target.value)}
          />
        </div>

        <div className="pd-field pd-colspan-2">
          <label className="pd-label">Materials (comma separated)</label>
          <SlInput
            placeholder="Cement, Tiles, Paint"
            value={materialsCsv}
            onSlChange={(e: any) => setMaterialsCsv(e.target.value)}
          />
        </div>

        <div className="pd-field pd-colspan-2">
          <label className="pd-label">Description</label>
          <SlTextarea
            rows={3}
            placeholder="Short description for this photo…"
            value={description}
            onSlChange={(e: any) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <SlDivider />

      {/* Footer */}
      <div className="pd-footer">
        <div className="pd-hint">
          <SlIcon name="info-circle" />
          <span>Tip: Use clear location tags so your team can filter later.</span>
        </div>
        <div className="pd-actions">
          <SlButton variant="default" onClick={onClose}>
            Cancel
          </SlButton>
          <SlButton variant="primary" onClick={handleSave}>
            <SlIcon name="check2" /> Save
          </SlButton>
        </div>
      </div>
    </SlDialog>
  );
}
