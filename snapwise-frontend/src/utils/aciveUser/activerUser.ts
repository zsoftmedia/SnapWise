import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function useActiveUser() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  return userId;
}
