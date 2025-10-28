import React, { useState } from "react";
import { SlBadge } from "@shoelace-style/shoelace/dist/react";

type Props = {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
};

export default function MaterialsInput({ value, onChange, placeholder = "Add and press Enter" }: Props) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setInput("");
  }

  return (
    <div className="material-input">
      <div className="tags">
        {value.map((tag) => (
          <SlBadge key={tag} variant="neutral" pill>
            {tag}
            <button
              className="remove"
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </SlBadge>
        ))}
        <input
          className="tag-editor"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(input);
            }
          }}
        />
      </div>
      <div className="hint">Examples: concrete, rebar, bricks, wiring, paint, tiles</div>
    </div>
  );
}
