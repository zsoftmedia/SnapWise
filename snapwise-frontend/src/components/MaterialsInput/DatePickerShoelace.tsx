import React from "react";
import { SlInput } from "@shoelace-style/shoelace/dist/react";

type Props = {
  value?: string; // ISO yyyy-mm-dd
  onChange: (v?: string) => void;
  placeholder?: string;
};

export default function DatePickerShoelace({ value, onChange, placeholder = "Select date" }: Props) {
  return (
    <SlInput
      type="date"
      value={value ?? ""}
      placeholder={placeholder}
      onSlChange={(e: any) => onChange(e.target.value || undefined)}
    />
  );
}
