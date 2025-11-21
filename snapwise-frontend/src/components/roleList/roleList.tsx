import React from "react";
import { SlSelect, SlOption } from "@shoelace-style/shoelace/dist/react";
import { useGetRolesQuery } from "../../api/roles/roles";

export type RoleSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
};

export const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  onChange,
  label = "Role",
  disabled = false,
  placeholder = "Select role",
}) => {
  const { data, isLoading } = useGetRolesQuery();

  return (
    <SlSelect
      label={label}
      value={value}
      placeholder={placeholder}
      disabled={disabled || isLoading}
      onSlChange={(e: any) => onChange(e.target.value)}
    >
      {isLoading && <SlOption value="">Loading...</SlOption>}

      {!isLoading &&
        data?.roles?.map((role: any) => (
          <SlOption key={role.id} value={role.key}>
            {role.label}
          </SlOption>
        ))}
    </SlSelect>
  );
};
