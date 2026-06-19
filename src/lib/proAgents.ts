import type { EspecialistaId } from "./especialistas";

/**
 * Mapeia a especialidade do profissional B2B para o agente de I.A. correspondente.
 */
export function mapSpecialtyToAgent(specialty: string | null | undefined): EspecialistaId {
  const s = (specialty || "").toLowerCase();
  if (s.includes("nutri")) return "nutricionista";
  if (s.includes("psic") || s.includes("terap") || s.includes("psiqu")) return "psicologo";
  if (s.includes("personal") || s.includes("educador f") || s.includes("fisiotera")) return "personal";
  if (s.includes("médic") || s.includes("medic") || s.includes("coach")) return "coach";
  return "coach";
}
