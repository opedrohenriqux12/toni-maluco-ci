import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/conselho/")({
  component: PickThread,
});

function PickThread() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    (async () => {
      if (user) {
        const { data } = await supabase.from("council_threads").select("id").order("updated_at", { ascending: false }).limit(1);
        if (data?.[0]?.id) {
          navigate({ to: "/conselho/$threadId", params: { threadId: data[0].id }, replace: true });
          return;
        }
        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          const { data: created } = await supabase.from("council_threads").insert({ user_id: u.user.id }).select("id").single();
          if (created) {
            navigate({ to: "/conselho/$threadId", params: { threadId: created.id }, replace: true });
            return;
          }
        }
      } else {
        const stored = localStorage.getItem("council_threads");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.length > 0 && parsed[0].id) {
              navigate({ to: "/conselho/$threadId", params: { threadId: parsed[0].id }, replace: true });
              return;
            }
          } catch {}
        }
        const newId = Math.random().toString(36).substring(2, 10);
        const newThread = { id: newId, title: "Nova conversa", updated_at: new Date().toISOString() };
        localStorage.setItem("council_threads", JSON.stringify([newThread]));
        navigate({ to: "/conselho/$threadId", params: { threadId: newId }, replace: true });
      }
    })();
  }, [user, navigate]);
  return <div className="glass grid min-h-[520px] place-items-center text-sm text-muted-foreground">Abrindo o escritório…</div>;
}
