import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { fileToDataUrl } from "../utils/fileToDataUrl";
import { PhotoItem } from "../types/types";

export function useImageFiles() {
  const filesToPhotoItems = useCallback(async (files: FileList | null): Promise<PhotoItem[]> => {
    if (!files || files.length === 0) return [];
    const items = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: uuidv4(),
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl: await fileToDataUrl(file),
        phase: "before" as const,
        status: "in_progress" as const,
        description: "",
        employeesOnTask: 0,
        materials: [],
        durationMins: 0
      }))
    );
    return items;
  }, []);

  return { filesToPhotoItems };
}
