// src/types/types.ts

/* ---------- Domain constants ---------- */
export const PHOTO_STATUS = [
  "not_started",
  "in_progress",
  "blocked",
  "finished",
] as const;

export const PHOTO_PHASE = ["before", "after", "other"] as const;

/* ---------- Type aliases (derived from constants) ---------- */
export type PhotoStatus = (typeof PHOTO_STATUS)[number];
export type PhotoPhase  = (typeof PHOTO_PHASE)[number];

/* ---------- Core entities ---------- */
export type PhotoItem = {
  id: string;
  fileName: string;

  /** before/after/other */
  phase: PhotoPhase;

  /** not_started/in_progress/blocked/finished */
  status: PhotoStatus;

  /** number of people involved in the specific task pictured */
  employeesOnTask: number;

  /** tags for materials visible/used in this photo */
  materials: string[];

  /** total minutes spent on this task segment */
  durationMins: number;

  /** optional file metadata */
  mimeType?: string;
  size?: number;
  dataUrl?: string; // local preview (base64) before upload

  /** free text */
  description?: string;

  /** timestamps — accept Date or ISO string so UI and server both fit */
  startedAt?: Date | string;
  finishedAt?: Date | string;

  /** e.g., "Floor 2, Room 210" */
  locationTag?: string;
};

/* ---------- Form payload for your construction report ---------- */
export type ConstructionFormData = {
  projectName: string;
  projectId: string;
  location: string;

  area?: string;
  floor?: string;
  room?: string;
  workPackage?: string;
  supervisor?: string;

  allowGps: boolean;
  photos: PhotoItem[];
  notes?: string;
};
