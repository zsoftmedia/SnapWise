import React, { useState } from "react";
import {
  SlCard,
  SlButton,
  SlSpinner,
} from "@shoelace-style/shoelace/dist/react";
import { useGetWorkplacesByUserQuery } from "../../api/workplace/workplaceApi";
import WorkplaceDetail from "./workplaceDetail";

export default function WorkplaceList({ userId }: { userId: string }) {
  const { data, isLoading } = useGetWorkplacesByUserQuery(userId);
  const [selected, setSelected] = useState<any | null>(null);

  if (isLoading)
    return (
      <div className="flex justify-center p-4">
        <SlSpinner /> Loading workplaces…
      </div>
    );

  const workplaces = data?.workplaces || [];

  if (selected)
    return (
      <WorkplaceDetail
        workplace={selected}
        onBack={() => setSelected(null)}
      />
    );

  return (
    <div className="p-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {workplaces.length === 0 && (
        <div className="text-center text-gray-500 w-full">
          No workplaces yet — create one to get started.
        </div>
      )}

      {workplaces.map((w:any
      ) => (
        <SlCard key={w.id} className="p-3">
          <div className="flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-semibold">{w.name}</h3>
              <p className="text-sm text-gray-500">{w.slug}</p>
            </div>
            <div className="mt-3 flex justify-between">
              <SlButton size="small" onClick={() => setSelected(w)}>
                View
              </SlButton>
            </div>
          </div>
        </SlCard>
      ))}
    </div>
  );
}
