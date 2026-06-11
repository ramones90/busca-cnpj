/**
 * Utilities for formatting values and processing the CNPJ response.
 */

/**
 * Formats a raw string to CNPJ mask: 00.000.000/0000-00
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
}

/**
 * Clean a CNPJ to send to api
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "").slice(0, 14);
}

/**
 * Formats a raw string to CEP mask: 00.000-000 or returns original
 */
export function formatCEP(cep: any): string {
  if (!cep) return "-";
  const clean = String(cep).replace(/\D/g, "");
  if (clean.length === 8) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  return String(cep);
}

/**
 * Formats capital social (numeric) into BRL currency
 */
export function formatCurrency(value: any): string {
  if (value === undefined || value === null) return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Formats telephone patterns
 */
export function formatPhone(ddd: any, phone: any): string {
  if (!phone) return "-";
  const dddStr = ddd ? `(${String(ddd).replace(/\D/g, "")}) ` : "";
  const phoneStr = String(phone).replace(/\D/g, "");
  
  if (phoneStr.length === 9) {
    return `${dddStr}${phoneStr.slice(0, 5)}-${phoneStr.slice(5)}`;
  } else if (phoneStr.length === 8) {
    return `${dddStr}${phoneStr.slice(0, 4)}-${phoneStr.slice(4)}`;
  }
  return `${dddStr}${phoneStr}`;
}

/**
 * Formats dates from YYYY-MM-DD or DD/MM/YYYY to human-readable pt-BR format
 */
export function formatDate(dateStr: any): string {
  if (!dateStr) return "-";
  const clean = String(dateStr).trim();
  
  // YYYY-MM-DD pattern
  const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (isoPattern.test(clean)) {
    const match = clean.match(isoPattern);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
  }

  // YYYY-MM-DD THH:MM:SS... pattern
  if (clean.includes("T")) {
    const parted = clean.split("T")[0];
    const match = parted.match(isoPattern);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
  }
  
  return clean;
}

/**
 * Formats booleans to friendly portuguese text
 */
export function formatBoolean(val: any): string {
  if (val === true || String(val).toLowerCase() === "true") return "Sim (Ativo)";
  if (val === false || String(val).toLowerCase() === "false") return "Não (Inativo)";
  return "-";
}

/**
 * Recursively counts the number of non-null, non-undefined, and non-empty strings/arrays in an object
 */
export function countFilledFields(obj: any): number {
  if (obj === null || obj === undefined) return 0;
  
  if (typeof obj !== "object") {
    // For primitive values, count if it's not a placeholder/empty
    const strVal = String(obj).trim().toLowerCase();
    if (strVal === "" || strVal === "null" || strVal === "undefined" || strVal === "-") {
      return 0;
    }
    return 1;
  }
  
  let count = 0;
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      count += countFilledFields(item);
    }
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        count += countFilledFields(obj[key]);
      }
    }
  }
  
  return count;
}

/**
 * Humanizes keys (e.g., "razao_social" -> "Razão Social")
 */
export function humanizeKey(key: string): string {
  const knownKeys: Record<string, string> = {
    razao_social: "Razão Social",
    nome_fantasia: "Nome Fantasia",
    situacao_cadastral: "Situação Cadastral",
    capital_social: "Capital Social",
    cnpj: "CNPJ",
    cep: "CEP",
    uf: "UF",
    municipio: "Município",
    bairro: "Bairro",
    logradouro: "Logradouro",
    numero: "Número",
    complemento: "Complemento",
    email: "E-mail",
    telefone: "Telefone",
    cnae_fiscal: "CNAE Fiscal",
    cnae_fiscal_descricao: "Descrição do CNAE",
    data_inicio_atividade: "Início das Atividades",
    situacao_especial: "Situação Especial",
    data_situacao_especial: "Data Situação Especial",
    data_situacao_cadastral: "Data Situação Cadastral",
    descricao_situacao_cadastral: "Status Cadastral",
    motivo_situacao_cadastral: "Motivo Situação Cadastral",
    natureza_juridica: "Natureza Jurídica",
    codigo_natureza_juridica: "Cód. Natureza Jurídica",
    porte: "Porte da Empresa",
    ente_federativo_responsavel: "Ente Federativo Resp.",
    inscricoes_estaduais: "Inscrições Estaduais",
    socios: "Quadro de Sócios",
    qsa: "Quadro de Sócios (QSA)",
  };

  if (knownKeys[key]) return knownKeys[key];

  // Fallback: replace underscores with spaces and capitalize words
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
