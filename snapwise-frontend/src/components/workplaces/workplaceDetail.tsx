import React, { useState } from "react";
import {
  SlButton,
  SlInput,
  SlCard,
  SlSpinner,
} from "@shoelace-style/shoelace/dist/react";
import { useUpdateWorkplaceMutation } from "../../api/workplace/workplaceApi";

export default function WorkplaceDetail({
  workplace,
  onBack,
}: {
  workplace: any;
  onBack: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: workplace.name, slug: workplace.slug });
  const [updateWorkplace, { isLoading }] = useUpdateWorkplaceMutation();

  async function handleSave() {
    try {
      await updateWorkplace({ id: workplace.id, ...form }).unwrap();
      setEdit(false);
    } catch (e: any) {
      alert(e?.data?.error || "Update failed");
    }
  }

  return (
    <SlCard className="m-3 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Workplace Details</h2>
        <SlButton size="small" variant="neutral" onClick={onBack}>
          ← Back
        </SlButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <SlSpinner />
        </div>
      ) : edit ? (
        <div className="flex flex-col gap-3">
          <SlInput
            label="Name"
            value={form.name}
            onSlInput={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })}
          />
          <SlInput
            label="Slug"
            value={form.slug}
            onSlInput={(e) => setForm({ ...form, slug: (e.target as HTMLInputElement).value })}
          />
          <div className="flex justify-end gap-2 mt-3">
            <SlButton variant="default" onClick={() => setEdit(false)}>Cancel</SlButton>
            <SlButton variant="success" onClick={handleSave}>Save</SlButton>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2"><strong>Name:</strong> {workplace.name}</div>
          <div className="mb-2"><strong>Slug:</strong> {workplace.slug}</div>
          <div className="mb-2"><strong>Created At:</strong> {new Date(workplace.created_at).toLocaleString()}</div>
          <SlButton variant="primary" onClick={() => setEdit(true)}>
            Edit
          </SlButton>
        </div>
      )}
    </SlCard>
  );
}
