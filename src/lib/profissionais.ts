export type ProfessionalCategory =
  | "enfermeiro"
  | "tecnico_enfermagem"
  | "auxiliar_enfermagem"
  | "medico"
  | "psicologo"
  | "fisioterapeuta"
  | "fonoaudiologo"
  | "nutricionista"
  | "terapeuta_ocupacional"
  | "cuidador";

export const CATEGORY_LABEL: Record<ProfessionalCategory, string> = {
  enfermeiro: "Enfermeiro(a)",
  tecnico_enfermagem: "Técnico(a) de enfermagem",
  auxiliar_enfermagem: "Auxiliar de enfermagem",
  medico: "Médico(a)",
  psicologo: "Psicólogo(a)",
  fisioterapeuta: "Fisioterapeuta",
  fonoaudiologo: "Fonoaudiólogo(a)",
  nutricionista: "Nutricionista",
  terapeuta_ocupacional: "Terapeuta ocupacional",
  cuidador: "Cuidador(a)",
};

export const CATEGORY_ORDER: ProfessionalCategory[] = [
  "enfermeiro",
  "tecnico_enfermagem",
  "auxiliar_enfermagem",
  "medico",
  "fisioterapeuta",
  "psicologo",
  "fonoaudiologo",
  "nutricionista",
  "terapeuta_ocupacional",
  "cuidador",
];

export const COUNCIL_LABEL: Partial<Record<ProfessionalCategory, string>> = {
  enfermeiro: "COREN",
  tecnico_enfermagem: "COREN",
  auxiliar_enfermagem: "COREN",
  medico: "CRM",
  psicologo: "CRP",
  fisioterapeuta: "CREFITO",
  terapeuta_ocupacional: "CREFITO",
  fonoaudiologo: "CRFa",
  nutricionista: "CRN",
};

export const WEEKDAYS = [
  { value: 0, short: "Dom", label: "Domingo" },
  { value: 1, short: "Seg", label: "Segunda-feira" },
  { value: 2, short: "Ter", label: "Terça-feira" },
  { value: 3, short: "Qua", label: "Quarta-feira" },
  { value: 4, short: "Qui", label: "Quinta-feira" },
  { value: 5, short: "Sex", label: "Sexta-feira" },
  { value: 6, short: "Sáb", label: "Sábado" },
] as const;

export function categoryLabel(category: string | null): string {
  if (!category) return "Categoria não informada";
  return CATEGORY_LABEL[category as ProfessionalCategory] ?? category;
}

export function councilLabel(category: string | null): string {
  if (!category) return "Registro";
  return COUNCIL_LABEL[category as ProfessionalCategory] ?? "Registro";
}

export function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "A combinar";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseCurrencyToCents(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return parseInt(digits, 10);
}

export function formatCentsInput(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function shortTime(value: string): string {
  return value.slice(0, 5);
}

export function initials(name: string | null): string {
  if (!name) return "ZP";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
