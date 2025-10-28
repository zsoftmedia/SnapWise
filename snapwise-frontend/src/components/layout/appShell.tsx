import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";


export default function AppShell() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
