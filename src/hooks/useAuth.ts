import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Timeout de segurança: se a rede ou o storage travar, nunca deixar em loop infinito
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 1500);

    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (mounted) {
        setSession(s);
        setLoading(false);
        clearTimeout(safetyTimer);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data: d }) => {
        if (mounted) {
          setSession(d.session);
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      })
      .catch((err) => {
        console.warn("Falha ao recuperar sessão do Supabase:", err);
        if (mounted) {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}
