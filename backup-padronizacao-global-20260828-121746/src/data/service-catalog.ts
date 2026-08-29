
export type CatalogCategory =
  | "enfermagem"
  | "fisioterapia"
  | "terapia_ocupacional"
  | "fonoaudiologia"
  | "nutricao"
  | "home_care";

export interface CatalogService {
  code: string;
  title: string;
  unit: string; // "sessão", "hora", "visita"
  priceCents: number;
  note?: string;
}

export interface CatalogGroup {
  category: CatalogCategory;
  label: string;
  source: string;
  sourceUrl: string;
  services: CatalogService[];
}

const reais = (r: number) => Math.round(r * 100);

export const SERVICE_CATALOG: CatalogGroup[] = [
  {
    category: "enfermagem",
    label: "Enfermagem",
    source: "Parecer COREN-SP 025/2021",
    sourceUrl: "",
    services: [
      {
        code: "ENF-ADM-CONS",
        title: "Consultoria administrativa",
        unit: "hora",
        priceCents: reais(100),
      },
      { code: "ENF-ADM-ASSES", title: "Assessoria", unit: "hora", priceCents: reais(100) },
      {
        code: "ENF-ADM-SUPERV",
        title: "Supervisão / coordenação do cuidado",
        unit: "hora",
        priceCents: reais(30),
      },
      {
        code: "ENF-VISITA-DOM",
        title: "Visita de atendimento domiciliar",
        unit: "visita",
        priceCents: reais(50),
      },
      {
        code: "ENF-DIDATICA-COMUN",
        title: "Atividade didática — comunidade",
        unit: "hora",
        priceCents: reais(120),
      },
      {
        code: "ENF-DIDATICA-INST",
        title: "Atividade didática — instituição de saúde",
        unit: "hora",
        priceCents: reais(120),
      },
      { code: "ENF-RT", title: "Responsabilidade técnica", unit: "hora", priceCents: reais(50) },
      {
        code: "ENF-PROC-LEITO-OCUP",
        title: "Preparo de leito ocupado",
        unit: "procedimento",
        priceCents: reais(30),
      },
    ],
  },
  {
    category: "fisioterapia",
    label: "Fisioterapia",
    source: "STJ — Tabela referencial de Fisioterapia (vig. 01/03/2026)",
    sourceUrl: "",
    services: [
      {
        code: "FIS-AVAL",
        title: "Consulta de avaliação",
        unit: "consulta",
        priceCents: reais(121.34),
      },
      {
        code: "FIS-CARDIO",
        title: "Fisioterapia cardiovascular",
        unit: "sessão",
        priceCents: reais(45.25),
      },
      {
        code: "FIS-RESP",
        title: "Fisioterapia respiratória",
        unit: "sessão",
        priceCents: reais(45.25),
      },
      {
        code: "FIS-DERMATO",
        title: "Fisioterapia dermatofuncional",
        unit: "sessão",
        priceCents: reais(54.3),
      },
      {
        code: "FIS-NEURO",
        title: "Fisioterapia neurofuncional",
        unit: "sessão",
        priceCents: reais(67.88),
      },
      {
        code: "FIS-TRAUMA",
        title: "Fisioterapia traumato-ortopédica",
        unit: "sessão",
        priceCents: reais(67.88),
      },
      {
        code: "FIS-PELVICA",
        title: "Fisioterapia pélvica",
        unit: "sessão",
        priceCents: reais(176.49),
      },
      {
        code: "FIS-RPG",
        title: "RPG — Reeducação Postural Global",
        unit: "sessão",
        priceCents: reais(83.72),
      },
      { code: "FIS-PILATES", title: "Pilates", unit: "sessão", priceCents: reais(69.01) },
      {
        code: "FIS-HIDRO",
        title: "Fisioterapia aquática (hidroterapia)",
        unit: "sessão",
        priceCents: reais(58.56),
      },
    ],
  },
  {
    category: "terapia_ocupacional",
    label: "Terapia Ocupacional",
    source: "RNHTO / CREFITO 12 — 2024",
    sourceUrl: "",
    services: [
      { code: "TO-CONS", title: "Consulta", unit: "consulta", priceCents: reais(118.5) },
      {
        code: "TO-AVAL-COMP",
        title: "Avaliação dos componentes de desempenho",
        unit: "sessão",
        priceCents: reais(106.65),
      },
      {
        code: "TO-AVAL-AJUDA",
        title: "Avaliação para prescrição de recursos de ajuda",
        unit: "sessão",
        priceCents: reais(106.65),
      },
      {
        code: "TO-AVAL-ACESS",
        title: "Avaliação de acessibilidade / ergonomia",
        unit: "sessão",
        priceCents: reais(184.86),
      },
      {
        code: "TO-TREINO-AVD",
        title: "Estimulação e treino de AVDs",
        unit: "sessão",
        priceCents: reais(92.43),
      },
      {
        code: "TO-TRAT-COMP",
        title: "Tratamento de componentes de desempenho",
        unit: "sessão",
        priceCents: reais(92.43),
      },
      {
        code: "TO-AT",
        title: "Acompanhamento terapêutico",
        unit: "sessão",
        priceCents: reais(237.0),
      },
      {
        code: "TO-ORTESE",
        title: "Prescrição e confecção de órteses/recursos",
        unit: "procedimento",
        priceCents: reais(158.0),
      },
    ],
  },
  {
    category: "fonoaudiologia",
    label: "Fonoaudiologia",
    source: "Tabela Fonoaudiologia — atualizada",
    sourceUrl: "",
    services: [
      { code: "FONO-ANAMNESE", title: "Anamnese", unit: "consulta", priceCents: reais(120) },
      {
        code: "FONO-CONS",
        title: "Consulta fonoaudiológica",
        unit: "consulta",
        priceCents: reais(100),
      },
      {
        code: "FONO-AVAL",
        title: "Avaliação fonoaudiológica",
        unit: "avaliação",
        priceCents: reais(167),
      },
      {
        code: "FONO-SESSAO-IND",
        title: "Sessão individual",
        unit: "sessão",
        priceCents: reais(100),
      },
      {
        code: "FONO-SESSAO-GRUPO",
        title: "Sessão em grupo",
        unit: "sessão",
        priceCents: reais(100),
      },
      {
        code: "FONO-DOM-AVAL",
        title: "Consulta domiciliar (com avaliação)",
        unit: "visita",
        priceCents: reais(250),
      },
      {
        code: "FONO-DOM-SESSAO",
        title: "Sessão domiciliar",
        unit: "visita",
        priceCents: reais(200),
      },
      {
        code: "FONO-PAC",
        title: "Terapia do processamento auditivo central",
        unit: "sessão",
        priceCents: reais(150),
      },
      {
        code: "FONO-VESTIB",
        title: "Reabilitação vestibular",
        unit: "sessão",
        priceCents: reais(100),
      },
      {
        code: "FONO-INT-AVAL",
        title: "Avaliação em paciente internado",
        unit: "avaliação",
        priceCents: reais(250),
      },
      {
        code: "FONO-INT-SESSAO",
        title: "Sessão em paciente internado",
        unit: "sessão",
        priceCents: reais(200),
      },
    ],
  },
  {
    category: "nutricao",
    label: "Nutrição",
    source: "FNN — Tabela de Honorários Nutricionistas 2026 (USN R$ 107,14)",
    sourceUrl: "",
    services: [
      {
        code: "NUT-CONS-CLIN",
        title: "Consulta clínica",
        unit: "consulta",
        priceCents: reais(214.28),
      },
      {
        code: "NUT-CONS-CONV",
        title: "Consulta convênio",
        unit: "consulta",
        priceCents: reais(107.14),
      },
      {
        code: "NUT-AVAL",
        title: "Avaliação nutricional",
        unit: "avaliação",
        priceCents: reais(214.28),
      },
      { code: "NUT-BIO", title: "Bioimpedância", unit: "procedimento", priceCents: reais(214.28) },
      {
        code: "NUT-ORIENT",
        title: "Orientação nutricional",
        unit: "sessão",
        priceCents: reais(107.14),
      },
      {
        code: "NUT-HOME",
        title: "Home care — visita domiciliar",
        unit: "visita",
        priceCents: reais(428.56),
      },
      {
        code: "NUT-CARDAPIO-SEM",
        title: "Cardápio semanal",
        unit: "cardápio",
        priceCents: reais(535.7),
      },
      {
        code: "NUT-CARDAPIO-MES",
        title: "Cardápio mensal",
        unit: "cardápio",
        priceCents: reais(2142.8),
      },
      {
        code: "NUT-ENTERAL",
        title: "Avaliação clínica enteral",
        unit: "avaliação",
        priceCents: reais(428.56),
      },
      {
        code: "NUT-PARENTERAL",
        title: "Avaliação clínica parenteral",
        unit: "avaliação",
        priceCents: reais(428.56),
      },
    ],
  },
  {
    category: "home_care",
    label: "Home Care",
    source: "Tabela PF Saúde — Assistência Domiciliar (vig. 01/03/2025)",
    sourceUrl: "",
    services: [
      {
        code: "HC-24H",
        title: "Diária domiciliar 24 h",
        unit: "diária",
        priceCents: reais(0),
        note: "Compõe técnico de enfermagem 24h + visita médica quinzenal + supervisão + mobiliário e kit de sinais vitais",
      },
      {
        code: "HC-12H",
        title: "Diária domiciliar 12 h",
        unit: "diária",
        priceCents: reais(0),
        note: "Técnico 12h + visita médica quinzenal + supervisão + kit",
      },
      {
        code: "HC-06H",
        title: "Diária domiciliar 6 h",
        unit: "diária",
        priceCents: reais(0),
        note: "Técnico 6h + visita médica mensal + supervisão + kit",
      },
      {
        code: "HC-REM-CM",
        title: "Remoção ida e volta com médico",
        unit: "remoção",
        priceCents: reais(0),
        note: "Valor conforme tabela vigente PF Saúde",
      },
      {
        code: "HC-REM-SM",
        title: "Remoção ida e volta sem médico",
        unit: "remoção",
        priceCents: reais(0),
        note: "Valor conforme tabela vigente PF Saúde",
      },
      {
        code: "HC-REM-UTI",
        title: "Remoção UTI com médico",
        unit: "remoção",
        priceCents: reais(0),
        note: "Valor conforme tabela vigente PF Saúde",
      },
    ],
  },
];

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
