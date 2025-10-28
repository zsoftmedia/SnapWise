import { Navigate, Outlet } from "react-router-dom";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute() {
  const [isAuth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setAuth(Boolean(data.session));
    })();
  }, []);

  if (isAuth === null) return <p>Checking session...</p>;
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
