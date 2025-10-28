import React from "react";
import {
  SlBadge,
  SlCard,
  SlIcon
} from "@shoelace-style/shoelace/dist/react";

export type FolderCard = {
  id: string;
  room: string;
  taskName: string;
  createdBy: string;
  createdAt: string;
  badges: string[];
};

type Props = {
  loading: boolean;
  folders: FolderCard[];
  activeTaskId: string | null;
  onSelect: (id: string) => void;
};

export default function TaskList({ loading, folders, activeTaskId, onSelect }: Props) {
  return (
    <section className="tf-left">
      <SlCard className="tf-card">
        <div slot="header" className="tf-left-head">
          <div className="tf-left-title">
            <SlIcon name="folder-fill" />
            <span>Folders (Tasks)</span>
          </div>
          <SlBadge pill>{folders.length}</SlBadge>
        </div>

        <div className="tf-grid">
          {loading && <div className="tf-empty">Loading…</div>}
          {!loading && folders.length === 0 && (
            <div className="tf-empty">No tasks yet</div>
          )}
          {folders.map((f) => (
            <button
              key={f.id}
              className={`tf-folder ${activeTaskId === f.id ? "is-active" : ""}`}
              onClick={() => onSelect(f.id)}
            >
              <div className="tf-folder-user">
                <SlIcon name="folder-fill" style={{ color: "#E2B44D" }} />
                <div className="tf-user-meta">
                  <div className="tf-user-name">{f.room}</div>
                  <div className="tf-date">{f.taskName}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </SlCard>
    </section>
  );
}
