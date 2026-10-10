import { useState, useEffect } from "react";

export type CentralModo = "operacao" | "gestao";

export function getCentralModo(): CentralModo {
  if (typeof window === "undefined") return "operacao";
  const params = new URLSearchParams(window.location.search);
  const modoParam = params.get("modo");
  if (modoParam === "gestao" || modoParam === "operacao") return modoParam;
  const saved = localStorage.getItem("central_modo");
  return (saved === "gestao" || saved === "operacao") ? saved : "operacao";
}

export function getGestaoAba(): string {
  if (typeof window === "undefined") return "painel";
  const params = new URLSearchParams(window.location.search);
  const abaParam = params.get("aba");
  if (abaParam) return abaParam;
  const saved = localStorage.getItem("gestao_last_tab");
  return saved || "painel";
}

export function setCentralModo(modo: CentralModo, aba?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("central_modo", modo);
  
  let targetAba = aba;
  if (!targetAba) {
    if (modo === "gestao") targetAba = localStorage.getItem("gestao_last_tab") || "painel";
    else targetAba = localStorage.getItem("operacao_last_tab") || "central";
  }

  if (modo === "gestao") localStorage.setItem("gestao_last_tab", targetAba);
  else localStorage.setItem("operacao_last_tab", targetAba);

  if (window.location.search) {
    window.history.replaceState({}, "", window.location.pathname);
  }
  window.dispatchEvent(new CustomEvent("central_modo_change", { detail: { modo, aba: targetAba } }));
}

export function useCentralModo() {
  const [modo, setModo] = useState<CentralModo>(getCentralModo);
  const [aba, setAba] = useState<string>(getGestaoAba);

  useEffect(() => {
    const handleSync = () => {
      setModo(getCentralModo());
      setAba(getGestaoAba());
    };

    window.addEventListener("central_modo_change", handleSync);
    window.addEventListener("popstate", handleSync);
    return () => {
      window.removeEventListener("central_modo_change", handleSync);
      window.removeEventListener("popstate", handleSync);
    };
  }, []);

  return { modo, aba, setModo: (m: CentralModo, a?: string) => setCentralModo(m, a) };
}
