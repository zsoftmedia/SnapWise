import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlButton,
  SlCard,
  SlInput,
  SlSpinner,
  SlAlert,
  SlIcon
} from "@shoelace-style/shoelace/dist/react";

import {
  useCompleteInviteMutation,
  useValidateInviteQuery
} from "../../../api/employee/invateApi";

export const JoinEmployee: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  // Validate token from backend
  const { data, isLoading, error } = useValidateInviteQuery(token, { skip: !token });

  // Complete the invite (sets password + creates supabase user)
  const [completeInvite, { isLoading: saving }] = useCompleteInviteMutation();

  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* -------------------------------
      Loading Token Validation
  --------------------------------- */
  if (isLoading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <SlSpinner style={{ fontSize: "2rem" }} />
      </div>
    );
  }

  /* -------------------------------
      Invalid link
  --------------------------------- */
  if (!data?.ok || error) {
    return (
      <SlCard style={{ maxWidth: 420, margin: "2rem auto", padding: "1rem" }}>
        <h2 style={{ textAlign: "center" }}>
          <SlIcon name="exclamation-circle" style={{ color: "red" }} /> Invalid Link
        </h2>
        <p style={{ textAlign: "center" }}>
          This invitation is expired or does not exist.
        </p>
      </SlCard>
    );
  }

  const employee = data.employee;

  /* -------------------------------
      After Successful Registration
  --------------------------------- */
  if (done) {
    return (
      <SlCard style={{ maxWidth: 420, margin: "2rem auto", padding: "1.5rem" }}>
        <h2 style={{ textAlign: "center" }}>Welcome, {employee.full_name}!</h2>
        <p style={{ textAlign: "center" }}>
          Your account has been created successfully.
        </p>

        <SlButton
          href="/login"
          variant="primary"
          style={{ width: "100%", marginTop: "1rem" }}
        >
          Go to Login
        </SlButton>
      </SlCard>
    );
  }

  /* -------------------------------
      Submit handler
  --------------------------------- */
  const handleSubmit = async () => {
    setSubmitError("");

    if (password.length < 6) {
      setSubmitError("Password must be at least 6 characters.");
      return;
    }

    const res: any = await completeInvite({ token, password });

    if (!res?.data?.ok) {
      setSubmitError(res?.data?.error ?? "Something went wrong.");
      return;
    }

    setDone(true);
  };

  return (
    <SlCard style={{ maxWidth: 420, margin: "2rem auto", padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Complete Your Registration</h2>

      {submitError && (
        <SlAlert variant="danger" open style={{ marginBottom: "1rem" }}>
          <SlIcon slot="icon" name="exclamation-triangle" />
          {submitError}
        </SlAlert>
      )}

      <SlInput label="Full Name" value={employee.full_name} disabled />
      <SlInput label="Email" value={employee.email} disabled />

      <SlInput
        label="Create Password"
        type="password"
        value={password}
        onSlInput={(e) => setPassword((e.target as HTMLInputElement).value)}
        helpText="Minimum 6 characters"
        style={{ marginTop: "1rem" }}
      />

      <SlButton
        variant="primary"
        onClick={handleSubmit}
        disabled={saving}
        style={{ width: "100%", marginTop: "1.5rem" }}
      >
        {saving ? <SlSpinner /> : "Create Account"}
      </SlButton>
    </SlCard>
  );
};

export default JoinEmployee;
