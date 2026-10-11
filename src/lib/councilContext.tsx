import React, { createContext, useContext, useState, useEffect } from "react";
import { advisors } from "./data";
import type { CouncilMode } from "./council-prompt";

interface CouncilContextType {
  mode: CouncilMode;
  setMode: (mode: CouncilMode) => void;
  activeAdvisors: Set<string>;
  setActiveAdvisors: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleAdvisor: (id: string) => void;
  selectAdvisorOnly: (id: string) => void;
}

const CouncilContext = createContext<CouncilContextType | null>(null);

export function CouncilProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<CouncilMode>("individual");
  const [activeAdvisors, setActiveAdvisors] = useState<Set<string>>(() => {
    // No modo individual, padrão Dra. Lúcia Prado (ou todos em modo geral)
    return new Set(["lucia"]);
  });

  // Ao mudar de modo, ajusta o estado dos conselheiros
  const handleSetMode = (newMode: CouncilMode) => {
    setMode(newMode);
    if (newMode === "individual") {
      // Garante que apenas um conselheiro fique ativo
      setActiveAdvisors((prev) => {
        const first = [...prev][0] || "lucia";
        return new Set([first]);
      });
    } else if (newMode === "war" || newMode === "geral") {
      // Em war room ou sala geral, ativa todos
      setActiveAdvisors(new Set(advisors.map((a) => a.id)));
    }
  };

  const toggleAdvisor = (id: string) => {
    if (mode === "individual") {
      // No modo individual, clicar em um conselheiro seleciona exclusivamente ele
      setActiveAdvisors(new Set([id]));
      return;
    }

    setActiveAdvisors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAdvisorOnly = (id: string) => {
    setActiveAdvisors(new Set([id]));
  };

  return (
    <CouncilContext.Provider
      value={{
        mode,
        setMode: handleSetMode,
        activeAdvisors,
        setActiveAdvisors,
        toggleAdvisor,
        selectAdvisorOnly,
      }}
    >
      {children}
    </CouncilContext.Provider>
  );
}

export function useCouncil() {
  const ctx = useContext(CouncilContext);
  if (!ctx) {
    // Fallback seguro caso usado fora do provider
    return {
      mode: "geral" as CouncilMode,
      setMode: () => {},
      activeAdvisors: new Set(advisors.map((a) => a.id)),
      setActiveAdvisors: () => {},
      toggleAdvisor: () => {},
      selectAdvisorOnly: () => {},
    };
  }
  return ctx;
}
