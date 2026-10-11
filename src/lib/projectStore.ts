export interface SavedSession {
  id: string;
  type: "conselho" | "terminal";
  title: string;
  projectId?: string | undefined; // se undefined, fica avulso/individual
  createdAt: string;
  updatedAt: string;
  data: any; // histórico de mensagens do conselho ou comandos do terminal
}

export interface ProjectFolder {
  id: string;
  name: string;
  color?: string | undefined;
  description?: string | undefined;
  createdAt: string;
}

const STORAGE_KEY_PROJECTS = "tonimaluco_projects_v1";
const STORAGE_KEY_SESSIONS = "tonimaluco_saved_sessions_v1";

const DEFAULT_PROJECTS: ProjectFolder[] = [
  { id: "proj-geral", name: "Geral", color: "#3b82f6", createdAt: new Date().toISOString() },
  { id: "proj-scraping", name: "Scrapers & Bots", color: "#10b981", createdAt: new Date().toISOString() },
  { id: "proj-marketplace", name: "Estratégia Marketplaces", color: "#f59e0b", createdAt: new Date().toISOString() },
];

export function getProjects(): ProjectFolder[] {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveProjects(DEFAULT_PROJECTS);
  return DEFAULT_PROJECTS;
}

export function saveProjects(projects: ProjectFolder[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }
}

export function createProject(name: string, color?: string): ProjectFolder {
  const projects = getProjects();
  const newProj: ProjectFolder = {
    id: `proj-${Date.now().toString(36)}`,
    name: name.trim() || "Novo Projeto",
    color: color || "#6366f1",
    createdAt: new Date().toISOString(),
  };
  const updated = [...projects, newProj];
  saveProjects(updated);
  return newProj;
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
  // Remove associação das sessões desse projeto (ficam avulsas)
  const sessions = getSavedSessions().map((s) => (s.projectId === id ? { ...s, projectId: undefined } : s));
  saveSessions(sessions);
}

export function getSavedSessions(type?: "conselho" | "terminal"): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (raw) {
      const parsed: SavedSession[] = JSON.parse(raw);
      return type ? parsed.filter((s) => s.type === type) : parsed;
    }
  } catch {}
  return [];
}

export function saveSessions(sessions: SavedSession[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }
}

export function saveOrUpdateSession(session: Omit<SavedSession, "updatedAt"> & { updatedAt?: string }): SavedSession {
  const current = getSavedSessions();
  const now = new Date().toISOString();
  const existingIdx = current.findIndex((s) => s.id === session.id);

  const fullSession: SavedSession = {
    ...session,
    updatedAt: now,
  };

  let updated: SavedSession[];
  if (existingIdx >= 0) {
    updated = current.map((s, idx) => (idx === existingIdx ? fullSession : s));
  } else {
    updated = [fullSession, ...current];
  }

  saveSessions(updated);
  return fullSession;
}

export function assignSessionToProject(sessionId: string, projectId?: string): void {
  const current = getSavedSessions();
  const updated = current.map((s) => (s.id === sessionId ? { ...s, projectId, updatedAt: new Date().toISOString() } : s));
  saveSessions(updated);
}

export function deleteSavedSession(id: string): void {
  const current = getSavedSessions().filter((s) => s.id !== id);
  saveSessions(current);
}
