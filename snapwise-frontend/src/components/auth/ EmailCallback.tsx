import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function EmailCallback() {
  const [msg, setMsg] = useState("Finalizing sign-in...");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setMsg(error.message);
      else if (data?.session) {
        setMsg("Email confirmed! Redirecting...");
        setTimeout(() => navigate("/master", { replace: true }), 800);
      } else {
        setMsg("Confirmation processed. Please log in.");
        setTimeout(() => navigate("/login", { replace: true }), 1000);
      }
      if (window.location.hash) {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      }
    })();
  }, [navigate]);

  return <p style={{ padding: 24 }}>{msg}</p>;
}
