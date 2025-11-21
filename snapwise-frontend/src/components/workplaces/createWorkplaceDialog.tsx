import React, { useEffect, useState } from "react";
import {
  SlDialog,
  SlInput,
  SlButton,
  SlSpinner,
} from "@shoelace-style/shoelace/dist/react";
import { useCreateWorkplaceMutation, useGetWorkplacesByUserQuery } from "../../api/workplace/workplaceApi";


/**
 * Auto-open dialog when user has no workplace.
 * Props: userId, onWorkplaceCreated (callback)
 */
export default function WorkplaceDialog({
  userId,
  onWorkplaceCreated,
}: {
  userId: string;
  onWorkplaceCreated?: (workplace: any) => void;
}) {
  const { data, isFetching } = useGetWorkplacesByUserQuery(userId);
  const [createWorkplace, { isLoading }] = useCreateWorkplaceMutation();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Check if user has workplaces → open dialog if none exist
  useEffect(() => {
    if (!isFetching) {
      const workplaces = data?.workplaces || [];
      if (workplaces.length === 0) {
        setOpen(true);
      } else {
        setOpen(false);
        onWorkplaceCreated?.(workplaces[0]);
      }
    }
  }, [data, isFetching]);

  async function handleSubmit() {
    if (!name || !slug) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await createWorkplace({
        name,
        slug,
        createdBy: userId,
      }).unwrap();

      setOpen(false);
      setName("");
      setSlug("");
      onWorkplaceCreated?.(res.workplace);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to create workplace");
    }
  }

  if (isFetching)
    return (
      <div className="flex justify-center items-center h-32">
        <SlSpinner />
      </div>
    );

  return (
    <SlDialog
      label="Create Your Workplace"
      open={open}
      noHeader={false}
      onSlAfterHide={() => setOpen(false)}
      style={{ "--width": "420px" } as any}
    >
      <div className="p-4 flex flex-col gap-3">
        <p className="text-sm text-gray-600 mb-2">
          Welcome! To start using SnapWise, create your workplace or company.
        </p>

        <SlInput
          label="Workplace Name"
          placeholder="e.g. Extra Möbelpacker"
          value={name}
          onSlInput={(e) => setName((e.target as HTMLInputElement).value)}
        />

        <SlInput
          label="Workplace Slug (short unique name)"
          placeholder="e.g. extra-mobelpacker"
          helpText="Used for linking your workplace (must be unique)"
          value={slug}
          onSlInput={(e) => setSlug((e.target as HTMLInputElement).value)}
        />

        <SlButton
          variant="primary"
          disabled={isLoading}
          onClick={handleSubmit}
          style={{ width: "100%", marginTop: "1rem" }}
        >
          {isLoading ? "Creating…" : "Create Workplace"}
        </SlButton>
      </div>
    </SlDialog>
  );
}
