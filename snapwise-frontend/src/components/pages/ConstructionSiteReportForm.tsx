// client/src/components/pages/ConstructionSiteReportForm.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  FieldArrayWithId,
  Controller
} from "react-hook-form";

import SlCard from "@shoelace-style/shoelace/dist/react/card";
import SlInput from "@shoelace-style/shoelace/dist/react/input";
import SlButton from "@shoelace-style/shoelace/dist/react/button";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon";
import SlDivider from "@shoelace-style/shoelace/dist/react/divider";
import SlBadge from "@shoelace-style/shoelace/dist/react/badge";
import SlTextarea from "@shoelace-style/shoelace/dist/react/textarea";
import { SlSwitch } from "@shoelace-style/shoelace/dist/react";

import PhotoDialog from "../MaterialsInput/photoDialog/photoDialog";
import "./style.css";

import { CreateTaskBody, useCreateTaskMutation } from "../../api/task/taskApi";

/* ----------- Props ----------- */
export type ActiveProjectProps = {
  projectRowId: string;
  projectName: string;
  projectReadableId: string;
  location: string;
  supervisor?: string;
  allowGps?: boolean;
  area?: string;
  floor?: string;
  room?: string;
  workPackage?: string;
};

type Props = {
  activeProject: ActiveProjectProps;
  createdByName: string;
};

/* ----------- Literal unions ----------- */
export const PHASE_VALUES = ["before", "after", "other"] as const;
export type PhotoPhase = (typeof PHASE_VALUES)[number];

export const STATUS_VALUES = ["not_started", "in_progress", "blocked", "finished"] as const;
export type PhotoStatus = (typeof STATUS_VALUES)[number];

function isPhase(v: any): v is PhotoPhase {
  return typeof v === "string" && (PHASE_VALUES as readonly string[]).includes(v);
}
function isStatus(v: any): v is PhotoStatus {
  return typeof v === "string" && (STATUS_VALUES as readonly string[]).includes(v);
}

/* ----------- Form types ----------- */
type PhotoField = {
  id: string;
  fileName: string;
  mimeType?: string;
  size?: number;
  dataUrl?: string;
  phase: PhotoPhase;
  status: PhotoStatus;
  description?: string;
  employeesOnTask: number;
  materials: string[];
  startedAt?: string;   // ISO
  finishedAt?: string;  // ISO
  durationMins: number;
  locationTag?: string;

  // NEW (optional local)
  spot_id?: string;
  pair_id?: string | null;
};

type FormValues = {
  projectRowId: string;
  projectName: string;
  projectId: string;
  location: string;
  area?: string;
  floor?: string;
  room?: string;
  workPackage?: string;
  supervisor?: string;
  allowGps: boolean;
  photos: PhotoField[];
  notes?: string;
};

export default function ConstructionSiteReportForm({ activeProject, createdByName }: Props) {
  const [batchCaptureGroupId] = useState<string>(() => crypto.randomUUID());
  const [jsonPreview, setJsonPreview] = useState<any | null>(null);
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  const formRef = useRef<HTMLFormElement>(null);
  const nativeSubmitRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      projectRowId: "",
      projectName: "",
      projectId: "",
      location: "",
      area: "",
      floor: "",
      room: "",
      workPackage: "",
      supervisor: "",
      allowGps: false,
      photos: [],
      notes: ""
    }
  });

  // prefill & lock
  useEffect(() => {
    reset({
      projectRowId: activeProject.projectRowId,
      projectName: activeProject.projectName,
      projectId: activeProject.projectReadableId,
      location: activeProject.location,
      area: activeProject.area || "",
      floor: activeProject.floor || "",
      room: activeProject.room || "",
      workPackage: activeProject.workPackage || "",
      supervisor: activeProject.supervisor || "",
      allowGps: !!activeProject.allowGps,
      photos: [],
      notes: ""
    });
  }, [activeProject, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "photos" });

  // queue + dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileQueue, setFileQueue] = useState<File[]>([]);

  const [phase, setPhase] = useState<PhotoPhase>("before");
  const [status, setStatus] = useState<PhotoStatus>("not_started");
  const [description, setDescription] = useState("");
  const [employees, setEmployees] = useState(1);
  const [materials, setMaterials] = useState("");
  const [locationTag, setLocationTag] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const openSystemPicker = () => fileInputRef.current?.click();
  const toIso = (v?: string | Date) => (v ? (typeof v === "string" ? v : v.toISOString()) : undefined);

  function enqueueFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    setFileQueue(prev => {
      const next = [...prev, ...files];
      if (!dialogOpen && !currentFile) startNext(next);
      return next;
    });
  }

  function startNext(queueSnapshot?: File[]) {
    setFileQueue(prev => {
      const q = queueSnapshot ?? prev;
      if (q.length === 0) return prev;
      const [first, ...rest] = q;
      setCurrentFile(first);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(first);

      setPhase("before");
      setStatus("not_started");
      setDescription("");
      setEmployees(1);
      setMaterials("");
      setLocationTag("");
      setDialogOpen(true);
      return rest;
    });
  }

  // Remember last BEFORE pair per place (spot_id || locationTag)
  const lastBeforePairForPlace = useRef<Map<string, string>>(new Map());

  function handleDialogSave(photo: {
    id: string; fileName: string; dataUrl?: string; mimeType?: string; size?: number;
    phase: PhotoPhase; status: PhotoStatus; description?: string;
    employeesOnTask: number; materials: string[];
    startedAt?: string | Date; finishedAt?: string | Date;
    durationMins: number; locationTag?: string; spot_id?: string;
  }) {
    const placeKey = (photo.spot_id || photo.locationTag || "no_loc").toString();
    let pairId: string | null = null;

    if (photo.phase === "before") {
      pairId = crypto.randomUUID();
      lastBeforePairForPlace.current.set(placeKey, pairId);
    } else if (photo.phase === "after") {
      pairId = lastBeforePairForPlace.current.get(placeKey) || crypto.randomUUID();
    } else {
      pairId = lastBeforePairForPlace.current.get(placeKey) || null;
    }

    append({
      id: photo.id,
      fileName: photo.fileName,
      mimeType: photo.mimeType,
      size: photo.size,
      dataUrl: photo.dataUrl,
      phase: isPhase(photo.phase) ? photo.phase : "before",
      status: isStatus(photo.status) ? photo.status : "not_started",
      description: photo.description,
      employeesOnTask: Number(photo.employeesOnTask) || 0,
      materials: Array.isArray(photo.materials) ? photo.materials : [],
      startedAt: toIso(photo.startedAt),
      finishedAt: toIso(photo.finishedAt),
      durationMins: Number(photo.durationMins) || 0,
      locationTag: photo.locationTag,
      spot_id: photo.spot_id,
      pair_id: pairId
    });

    setDialogOpen(false);
    setCurrentFile(null);
    setPreviewUrl(null);
    setTimeout(() => startNext(), 0);
  }

  function handleDialogClose() {
    setDialogOpen(false);
    setCurrentFile(null);
    setPreviewUrl(null);
    setTimeout(() => startNext(), 0);
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const payload: CreateTaskBody = {
      project_id: values.projectRowId,
      project_readable_id: values.projectId,
      project_name: values.projectName,
      location: values.location,
      area: values.area || null,
      floor: values.floor || null,
      room: values.room || null,
      work_package: values.workPackage || null,
      supervisor: values.supervisor || null,
      allow_gps: !!values.allowGps,
      notes: values.notes || null,
      created_by_name: createdByName,
      photos: values.photos.map((p) => ({
        id: p.id,
        fileName: p.fileName,
        dataUrl: p.dataUrl,
        mimeType: p.mimeType,
        size: p.size,
        phase: p.phase,
        status: p.status,
        description: p.description,
        employeesOnTask: p.employeesOnTask,
        materials: p.materials,
        startedAt: p.startedAt ?? null,
        finishedAt: p.finishedAt ?? null,
        durationMins: p.durationMins,
        locationTag: p.locationTag ?? null,
        capturedAt: new Date().toISOString(),
        captureGroupId: batchCaptureGroupId,
        spot_id: (p as any).spot_id,
        pair_id: p.pair_id ?? null
      }))
    };

    setJsonPreview(payload);
    try {
      await createTask(payload).unwrap();
      reset({ ...values, photos: [] });
    } catch (e) {
      console.error("createTask failed:", e);
    }
  };

  const photos = watch("photos");
  const stats = useMemo(() => {
    const total = photos.length;
    const byStatus = Object.fromEntries(
      STATUS_VALUES.map((s) => [s, photos.filter((p) => p.status === s).length])
    ) as Record<PhotoStatus, number>;
    const before = photos.filter((p) => p.phase === "before").length;
    const after = photos.filter((p) => p.phase === "after").length;
    return { total, byStatus, before, after } as const;
  }, [photos]);

  const lock = {
    projectName: true, projectId: true, location: true,
    supervisor: !!activeProject.supervisor, allowGps: true,
    area: !!activeProject.area, floor: !!activeProject.floor,
    room: !!activeProject.room, workPackage: !!activeProject.workPackage
  };

  return (
    <div className="container">
      <SlCard className="card">
        <div slot="header">
          <div className="header">
            <div className="title">Construction Site Report</div>
            <div className="subtitle">Project fields are pre-filled and locked.</div>
          </div>
        </div>

        <form ref={formRef} className="form" onSubmit={handleSubmit(onSubmit)}>
          <button ref={nativeSubmitRef} type="submit" style={{ display: "none" }} />
          <input type="hidden" {...register("projectRowId", { required: true })} />

          <div className="grid three">
            <div>
              <label>Project Name</label>
              <SlInput disabled={lock.projectName} {...register("projectName", { required: true, minLength: 2 })} />
              {errors.projectName && <div className="error">Project name is required</div>}
            </div>
            <div>
              <label>Project ID</label>
              <SlInput disabled={lock.projectId} {...register("projectId", { required: true })} />
              {errors.projectId && <div className="error">Project ID is required</div>}
            </div>
            <div>
              <label>Location</label>
              <SlInput disabled={lock.location} {...register("location", { required: true, minLength: 2 })} />
              {errors.location && <div className="error">Location is required</div>}
            </div>
          </div>

          <div className="grid three soft">
            <SlInput label="Area" disabled={lock.area} {...register("area")} />
            <SlInput label="Floor" disabled={lock.floor} {...register("floor")} />
            <SlInput label="Room" disabled={lock.room} {...register("room")} />
            <SlInput label="Work Package" disabled={lock.workPackage} {...register("workPackage")} />
            <SlInput label="Supervisor" disabled={lock.supervisor} {...register("supervisor")} />
            <div className="switch-row">
              <Controller
                control={control}
                name="allowGps"
                render={({ field: { value, onChange} }) => (
                  <SlSwitch disabled={lock.allowGps} checked={!!value} onSlChange={(e: any) => onChange(!!e.target.checked)}>
                    Attach GPS (if supported)
                  </SlSwitch>
                )}
              />
            </div>
          </div>

          <SlDivider />

          <div className="photos-header">
            <div className="h-left">
              <SlIcon name="image" /><h3>Photos</h3>
            </div>
            <div className="h-right">
              <SlButton className="upload-btn" variant="neutral" size="small" onClick={() => fileInputRef.current?.click()}>
                <SlIcon name="camera" /> Take / Add Photos
              </SlButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden-file-input"
                onChange={(e) => { enqueueFiles(e.target.files); e.currentTarget.value = ""; }}
              />
            </div>
          </div>

          <div className="thumbs">
            {fields.map((f: FieldArrayWithId<FormValues, "photos", "id">, idx: number) => (
              <div key={f.id} className="thumb">
                {photos[idx]?.dataUrl ? (
                  <img src={photos[idx].dataUrl} alt={photos[idx].fileName} />
                ) : (<div className="no-thumb">No preview</div>)}
                <div className="thumb-overlay">
                  <SlBadge className="status" variant="primary">
                    {String(photos[idx].phase)} / {String(photos[idx].status)}
                  </SlBadge>
                  <button className="delete" type="button" onClick={() => remove(idx)} aria-label="Delete" title="Remove">×</button>
                </div>
              </div>
            ))}
          </div>

          <SlDivider />

          <label>General Notes</label>
          <SlTextarea rows={4} placeholder="Anything else to record?" {...register("notes")} />

          <div className="footer">
            <div className="badges">
              <SlBadge pill>total: {photos.length}</SlBadge>
              <SlBadge variant="primary">in_progress: {photos.filter(p => p.status === "in_progress").length}</SlBadge>
              <SlBadge variant="success">finished: {photos.filter(p => p.status === "finished").length}</SlBadge>
              <SlBadge variant="warning">blocked: {photos.filter(p => p.status === "blocked").length}</SlBadge>
              <SlBadge variant="neutral">not_started: {photos.filter(p => p.status === "not_started").length}</SlBadge>
              <SlBadge pill>before: {photos.filter(p => p.phase === "before").length}</SlBadge>
              <SlBadge pill>after: {photos.filter(p => p.phase === "after").length}</SlBadge>
            </div>
            <div className="actions">
              <SlButton type="reset" variant="default">Reset</SlButton>
              <SlButton
                variant="primary"
                disabled={isCreating || photos.length === 0}
                onClick={() => {
                  if (formRef.current?.requestSubmit) formRef.current.requestSubmit();
                  else nativeSubmitRef.current?.click();
                }}
              >
                {isCreating ? "Saving…" : "Create Task"}
              </SlButton>
            </div>
          </div>
        </form>
      </SlCard>

      <PhotoDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        initial={
          currentFile
            ? {
                id: crypto.randomUUID(),
                fileName: currentFile.name,
                dataUrl: previewUrl ?? undefined,
                mimeType: currentFile.type,
                size: currentFile.size,
                phase,
                status,
                description,
                employeesOnTask: employees,
                materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
                locationTag,
                durationMins: 0
              }
            : undefined
        }
      />

      {jsonPreview && (
        <div className="json-panel">
          <label>Payload sent to API</label>
          <pre>{JSON.stringify(jsonPreview, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
