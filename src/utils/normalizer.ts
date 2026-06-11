import { NormalizedSummary } from "../types";
import { formatCNPJ, formatCEP, formatPhone, formatCurrency, formatDate } from "./formatter";

/**
 * Recursively searches any nested object for a key related to "municipio" or "cidade"
 * whose value is a valid non-empty string.
 */
function findCityRecursively(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;

  const excludeValues = ["NÃO INFORMANTE", "NÃO INFORMADO", "NÃO", "NÃO CONSTA", "INFORMANTE", "SEM INFORMAÇÃO", "", "-", "******"];

  // 1. Direct key search at current nest level first
  const keys = Object.keys(obj);
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim() !== "") {
      const kLower = key.toLowerCase();
      if (
        (kLower === "municipio" || 
         kLower === "cidade" || 
         kLower.includes("nome_municipio") || 
         kLower.includes("municipio_nome") || 
         kLower.includes("cidade_nome") || 
         kLower.includes("nome_cidade") ||
         kLower.includes("municipio_descricao") ||
         kLower.includes("cidade_descricao")) &&
        !excludeValues.includes(val.toUpperCase().trim()) &&
        val.trim().length > 1
      ) {
        return val.trim();
      }
    }
  }

  // 2. Direct sub-object check for known objects
  for (const key of keys) {
    const val = obj[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const kLower = key.toLowerCase();
      if (kLower === "municipio" || kLower === "cidade" || kLower === "estabelecimento" || kLower === "endereco" || kLower === "localizacao") {
        if (typeof val.nome === "string" && val.nome.trim() !== "" && !excludeValues.includes(val.nome.toUpperCase().trim())) return val.nome.trim();
        if (typeof val.descricao === "string" && val.descricao.trim() !== "" && !excludeValues.includes(val.descricao.toUpperCase().trim())) return val.descricao.trim();
        if (typeof val.nome_municipio === "string" && val.nome_municipio.trim() !== "" && !excludeValues.includes(val.nome_municipio.toUpperCase().trim())) return val.nome_municipio.trim();
      }
    }
  }

  // 3. Deep depth-first check on all sub-objects (including arrays of objects if needed)
  for (const key of keys) {
    const val = obj[key];
    if (val && typeof val === "object") {
      if (Array.isArray(val)) {
        for (const item of val) {
          const found = findCityRecursively(item);
          if (found) return found;
        }
      } else {
        const found = findCityRecursively(val);
        if (found) return found;
      }
    }
  }

  return null;
}

/**
 * Robustly extracts the municipality name across different possible API schemas
 */
function extractMunicipio(raw: any, sourceApi: "cnpj_ws" | "brasil_api"): string {
  const est = raw.estabelecimento || {};
  const excludeValues = ["NÃO INFORMANTE", "NÃO INFORMADO", "NÃO", "NÃO CONSTA", "INFORMANTE", "SEM INFORMAÇÃO", "", "-", "******"];
  
  // List of potential path candidates for city/municipality name
  const candidates = [
    est.municipio?.nome,
    est.municipio?.descricao,
    est.municipio_nome,
    est.nome_municipio,
    est.cidade_nome,
    est.cidade,
    est.municipio, // Direct string check
    raw.municipio?.nome,
    raw.municipio?.descricao,
    raw.municipio_nome,
    raw.nome_municipio,
    raw.cidade,
    raw.cidade_nome,
    raw.municipio, // Direct string check
    raw.nome_cidade_exterior,
    est.nome_cidade_exterior
  ];

  for (const cand of candidates) {
    if (cand && typeof cand === "string" && cand.trim() !== "" && cand.trim() !== "-" && !excludeValues.includes(cand.toUpperCase().trim())) {
      return cand.trim();
    }
  }

  // Handle case where municipio could be an object but without standard keys
  if (est.municipio && typeof est.municipio === "object") {
    if (est.municipio.nome && typeof est.municipio.nome === "string" && !excludeValues.includes(est.municipio.nome.toUpperCase().trim())) return est.municipio.nome;
    if (est.municipio.descricao && typeof est.municipio.descricao === "string" && !excludeValues.includes(est.municipio.descricao.toUpperCase().trim())) return est.municipio.descricao;
    if (est.municipio.nome_municipio && typeof est.municipio.nome_municipio === "string" && !excludeValues.includes(est.municipio.nome_municipio.toUpperCase().trim())) return est.municipio.nome_municipio;
  }

  if (raw.municipio && typeof raw.municipio === "object") {
    if (raw.municipio.nome && typeof raw.municipio.nome === "string" && !excludeValues.includes(raw.municipio.nome.toUpperCase().trim())) return raw.municipio.nome;
    if (raw.municipio.descricao && typeof raw.municipio.descricao === "string" && !excludeValues.includes(raw.municipio.descricao.toUpperCase().trim())) return raw.municipio.descricao;
    if (raw.municipio.nome_municipio && typeof raw.municipio.nome_municipio === "string" && !excludeValues.includes(raw.municipio.nome_municipio.toUpperCase().trim())) return raw.municipio.nome_municipio;
  }

  // Use deep recursive search as fallback
  const recursiveMatch = findCityRecursively(raw);
  if (recursiveMatch) return recursiveMatch;

  return "Não Informado";
}

/**
 * Recursively searches any nested object for a key related to state (UF)
 */
function findUfRecursively(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;

  const keys = Object.keys(obj);
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim() !== "") {
      const kLower = key.toLowerCase();
      if ((kLower === "uf" || kLower === "sigla_uf" || kLower === "sigla_estado" || kLower === "estado_sigla") && val.trim().length === 2) {
        return val.trim().toUpperCase();
      }
    }
  }

  for (const key of keys) {
    const val = obj[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const kLower = key.toLowerCase();
      if (kLower === "estado" || kLower === "uf" || kLower === "estabelecimento" || kLower === "endereco") {
        if (typeof val.sigla === "string" && val.sigla.trim().length === 2) return val.sigla.trim().toUpperCase();
        if (typeof val.uf === "string" && val.uf.trim().length === 2) return val.uf.trim().toUpperCase();
      }
    }
  }

  for (const key of keys) {
    const val = obj[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const found = findUfRecursively(val);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Robustly extracts the federated state (UF) abbreviation
 */
function extractUf(raw: any, sourceApi: "cnpj_ws" | "brasil_api"): string {
  const est = raw.estabelecimento || {};
  const candidates = [
    est.estado?.sigla,
    est.estado?.uf,
    est.uf,
    raw.uf,
    raw.estado?.sigla,
    raw.estado?.uf,
    raw.estabelecimento?.uf
  ];

  for (const cand of candidates) {
    if (cand && typeof cand === "string" && cand.trim() !== "" && cand.trim().length === 2) {
      return cand.trim().toUpperCase();
    }
  }

  const recursiveMatch = findUfRecursively(raw);
  if (recursiveMatch) return recursiveMatch;

  return "SC"; // Default fallback state
}

/**
 * Normalizes an API response from CNPJ.ws or BrasilAPI to our unified NormalizedSummary structure.
 */
export function normalizeCnpjData(raw: any, sourceApi: "cnpj_ws" | "brasil_api"): NormalizedSummary {
  if (sourceApi === "cnpj_ws") {
    const est = raw.estabelecimento || {};
    const munName = extractMunicipio(raw, "cnpj_ws");
    const ufSigla = extractUf(raw, "cnpj_ws");
    
    // Build address
    const streetType = est.tipo_logradouro ? `${est.tipo_logradouro} ` : "";
    const street = est.logradouro || "";
    const num = est.numero ? `, No ${est.numero}` : "";
    const comp = est.complemento ? ` - ${est.complemento}` : "";
    const b = est.bairro ? `, ${est.bairro}` : "";
    const cepStr = est.cep ? ` | CEP: ${formatCEP(est.cep)}` : "";
    const fullAddr = `${streetType}${street}${num}${comp}${b}${cepStr}`;

    // CNAE principal
    let mainCnae = "-";
    const cnaeObj = est.atividade_principal || raw.atividade_principal;
    if (cnaeObj) {
      mainCnae = `${cnaeObj.id || cnaeObj.codigo || ""} - ${cnaeObj.descricao || ""}`.trim();
      if (mainCnae === "-") mainCnae = "-";
    }

    // CNAE secundarios
    const hasSec = Array.isArray(est.atividades_secundarias) ? est.atividades_secundarias : [];
    const cnaeSecList = hasSec.map((sec: any) => `${sec.id || sec.codigo || ""} - ${sec.descricao || ""}`);

    // Regime Apuração (Simples optante check)
    let rxRegime = "REGIME NORMAL (OUTROS)";
    if (raw.simples) {
      const opt = raw.simples.optante;
      if (opt === "Sim" || opt === "S" || opt === true) {
        rxRegime = "SIMPLES NACIONAL";
      }
    }

    // Natureza Juridica
    const natJur = raw.natureza_juridica 
      ? `${raw.natureza_juridica.id || ""} - ${raw.natureza_juridica.descricao || ""}`.trim()
      : "-";

    // Phone formatting
    const tel = formatPhone(est.ddd_telefone1 || "", est.telefone1 || est.ddd_telefone1 || "");

    // State Registrations
    const ieList: any[] = [];
    if (Array.isArray(est.inscricoes_estaduais)) {
      est.inscricoes_estaduais.forEach((item: any) => {
        ieList.push({
          ie: item.inscricao_estadual || "-",
          uf: item.estado?.sigla || est.estado?.sigla || est.uf || "-",
          ativo: item.ativo ?? true
        });
      });
    }

    return {
      cnpj: formatCNPJ(raw.cnpj || est.cnpj || ""),
      razaoSocial: raw.razao_social || est.razao_social || "Não Informado",
      nomeFantasia: est.nome_fantasia || raw.nome_fantasia || est.razao_social || "Não Informado",
      situacao: est.situacao_cadastral || "Desconhecida",
      situacaoData: formatDate(est.data_situacao_cadastral),
      enderecoCompleto: fullAddr,
      cidadeUf: `${munName} / ${ufSigla}`.trim(),
      cnaePrincipal: mainCnae,
      telefone: tel,
      email: est.email || "-",
      capitalSocial: formatCurrency(raw.capital_social),
      inscricoesEstaduais: ieList,
      sociosCount: Array.isArray(raw.socios) ? raw.socios.length : 0,
      dataInicioAtividade: formatDate(raw.data_inicio_atividade || est.data_inicio_atividade),
      regimeApuracao: rxRegime,
      naturezaJuridica: natJur,
      cnaeSecundarios: cnaeSecList,
      logradouro: `${streetType}${street}`.toUpperCase(),
      numero: est.numero || "S/N",
      complemento: est.complemento || "******",
      bairro: (est.bairro || "CENTRO").toUpperCase(),
      cep: formatCEP(est.cep),
      municipio: munName.toUpperCase(),
      uf: ufSigla.toUpperCase(),
    };
  } else {
    // BrasilAPI Map
    const munName = extractMunicipio(raw, "brasil_api");
    const ufSigla = extractUf(raw, "brasil_api");
    
    const street = raw.logradouro || "";
    const num = raw.numero ? `, No ${raw.numero}` : "";
    const comp = raw.complemento ? ` - ${raw.complemento}` : "";
    const b = raw.bairro ? `, ${raw.bairro}` : "";
    const cepStr = raw.cep ? ` | CEP: ${formatCEP(raw.cep)}` : "";
    const fullAddr = `${street}${num}${comp}${b}${cepStr}`;

    const mainCnae = raw.cnae_fiscal && raw.cnae_fiscal_descricao 
      ? `${raw.cnae_fiscal} - ${raw.cnae_fiscal_descricao}` 
      : (raw.cnae_fiscal_descricao || "-");

    // CNAE secundarios
    const hasSec = Array.isArray(raw.cnaes_secundarios) ? raw.cnaes_secundarios : [];
    const cnaeSecList = hasSec.map((sec: any) => `${sec.codigo || ""} - ${sec.descricao || ""}`);

    // Regime Apuração
    const rxRegime = raw.opcao_pelo_simples ? "SIMPLES NACIONAL" : "REGIME NORMAL (OUTROS)";

    // Natureza Juridica
    const natJur = raw.codigo_natureza_juridica && raw.natureza_juridica
      ? `${raw.codigo_natureza_juridica} - ${raw.natureza_juridica}`
      : (raw.natureza_juridica || "-");

    const tel = formatPhone("", raw.ddd_telefone1 || "");

    const ieList: any[] = [];
    if (raw.inscricoes_estaduais && Array.isArray(raw.inscricoes_estaduais)) {
      raw.inscricoes_estaduais.forEach((item: any) => {
        ieList.push({
          ie: item.inscricao_estadual || "-",
          uf: item.uf || raw.uf || "-",
          ativo: item.ativo ?? true
        });
      });
    }

    return {
      cnpj: formatCNPJ(raw.cnpj || ""),
      razaoSocial: raw.razao_social || "Não Informado",
      nomeFantasia: raw.nome_fantasia || raw.razao_social || "Não Informado",
      situacao: raw.descricao_situacao_cadastral || "Desconhecida",
      situacaoData: formatDate(raw.data_situacao_cadastral),
      enderecoCompleto: fullAddr,
      cidadeUf: `${munName} / ${ufSigla}`.trim(),
      cnaePrincipal: mainCnae,
      telefone: tel,
      email: raw.email || "-",
      capitalSocial: formatCurrency(raw.capital_social),
      inscricoesEstaduais: ieList,
      sociosCount: Array.isArray(raw.qsa) ? raw.qsa.length : 0,
      dataInicioAtividade: formatDate(raw.data_inicio_atividade),
      regimeApuracao: rxRegime,
      naturezaJuridica: natJur,
      cnaeSecundarios: cnaeSecList,
      logradouro: street.toUpperCase(),
      numero: raw.numero || "S/N",
      complemento: raw.complemento || "******",
      bairro: (raw.bairro || "CENTRO").toUpperCase(),
      cep: formatCEP(raw.cep),
      municipio: munName.toUpperCase(),
      uf: ufSigla.toUpperCase(),
    };
  }
}
