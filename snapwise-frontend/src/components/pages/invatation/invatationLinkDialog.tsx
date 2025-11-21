import React, { useState } from "react";
import {
  SlButton,
  SlDialog,
  SlInput,
  SlSelect,
  SlOption,
  SlIcon,
} from "@shoelace-style/shoelace/dist/react";
import { useGenerateInviteLinkMutation } from "../../../api/workplace/workplaceEmployeeApi";

type Props = {
  workplaceId: string;
  invitedBy: string;
};

export default function GenerateInviteLinkDialog({ workplaceId, invitedBy }: Props) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const [generateInviteLink, { isLoading, error }] = useGenerateInviteLinkMutation();

  const handleGenerate = async () => {
    try {
      const res = await generateInviteLink({
        workplace_id: workplaceId,
        full_name: fullName,
        email,
        invited_by: invitedBy,
        role,
      }).unwrap();
      setInviteUrl(res.inviteUrl);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleCopy = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl);
      alert("✅ Invite link copied to clipboard!");
    }
  };

  return (
    <>
      <SlButton variant="primary" onClick={() => setOpen(true)}>
        <SlIcon name="person-plus" /> Generate Invite Link
      </SlButton>

      <SlDialog label="Generate Invite Link" open={open} onSlAfterHide={() => setOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <SlInput
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onSlInput={(e: any) => setFullName(e.target.value)}
          />
          <SlInput
            label="Email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onSlInput={(e: any) => setEmail(e.target.value)}
          />
          <SlSelect label="Role" value={role} onSlChange={(e: any) => setRole(e.target.value)}>
            <SlOption value="admin">Admin</SlOption>
            <SlOption value="supervisor">Supervisor</SlOption>
            <SlOption value="member">Member</SlOption>
          </SlSelect>

          {error && (
            <p style={{ color: "red", fontSize: "0.9rem" }}>
              {(error as any).data?.error || "Error generating link"}
            </p>
          )}

          {inviteUrl && (
            <div style={{ marginTop: 12 }}>
              <p><strong>Invite Link:</strong></p>
              <SlInput readonly value={inviteUrl} />
              <SlButton variant="success" onClick={handleCopy} style={{ marginTop: 8 }}>
                <SlIcon name="clipboard" /> Copy Link
              </SlButton>
            </div>
          )}
        </div>

        {!inviteUrl && (
          <div slot="footer" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <SlButton variant="neutral" onClick={() => setOpen(false)}>
              Cancel
            </SlButton>
            <SlButton variant="primary" loading={isLoading} onClick={handleGenerate}>
              Generate Link
            </SlButton>
          </div>
        )}
      </SlDialog>
    </>
  );
}
